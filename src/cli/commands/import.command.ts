import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { Offer } from '../../shared/types/offer.type.js';
import { DefaultUserService, UserModel, UserService } from '../../shared/modules/user/index.js';
import { CategoryModel, CategoryService, DefaultCategoryService } from '../../shared/modules/category/index.js';
import { DefaultOfferService, OfferModel, OfferService } from '../../shared/modules/offer/index.js';
import { DatabaseClient, MongoDatabaseClient } from '../../shared/libs/database-client/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { ConsoleLogger } from '../../shared/libs/logger/console.logger.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './command.constant.js';

export class ImportCommand implements Command {
  private userService: UserService;
  private categoryService: CategoryService;
  private offerService: OfferService;
  private databaseClient: DatabaseClient;
  private logger: Logger;
  private salt: string;

  constructor() {
    this.onImportedOffer = this.onImportedOffer.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);

    this.logger = new ConsoleLogger();
    this.offerService = new DefaultOfferService(this.logger, OfferModel);
    this.categoryService = new DefaultCategoryService(this.logger, CategoryModel);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
  }

  public getName(): string {
    return '--import';
  }

  private async onImportedOffer(offer: Offer, resolve: () => void) {
    await this.saveOffer(offer);
    resolve();
  }

  private async saveOffer(offer: Offer) {
    const categories: string[] = [];
    const user = await this.userService.findOrCreate({
      ...offer.user,
      password: DEFAULT_USER_PASSWORD
    }, this.salt);

    for (const category of offer.categories) {
      const name = String(category.name);
      const existCategory = await this.categoryService.findByCategoryNameOrCreate(name, { name });
      categories.push(String(existCategory.id));
    }

    await this.offerService.create({
      categories,
      userId: String(user.id),
      title: offer.title,
      description: offer.description,
      postDate: offer.postDate,
      price: offer.price,
      type: offer.type,
    });

  }

  private async onCompleteImport(count: number) {
    console.info(`${count.toString()} rows imported.`);
    await this.databaseClient.disconnect();
  }

  public async execute(filename: string, login: string, password: string, host: string, dbname: string, salt: string): Promise<void> {
    const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
    this.salt = salt;

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('line',  (offer: Offer, resolve: () => void) => {
      void this.onImportedOffer(offer, resolve);
    });

    fileReader.on('end',   (count:number) => {
      void this.onCompleteImport(count);
    });

    try {
      await fileReader.read();
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
    }
  }
}

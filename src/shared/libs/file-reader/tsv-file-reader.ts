import EventEmitter from 'node:events';

import { FileReader } from './file-reader.interface.js';
import { Offer, OfferType, User } from '../../types/index.js';

export class TSVFileReader extends EventEmitter implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) {
    super();
  }

  private validateRawData(): void {
    if (! this.rawData) {
      throw new Error('File was not read');
    }
  }

  private parseRawDataToOffers(): Offer[] {
    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => this.parseLineToOffer(line));
  }

  private parseLineToOffer(line: string): Offer {
    const [
      title,
      description,
      createdDate,
      image,
      type,
      price,
      categories,
      firstname,
      lastname,
      email,
      avatarPath
    ] = line.split('\t');

    return {
      title,
      description,
      postDate: new Date(createdDate),
      image,
      type: OfferType[type as 'Buy' | 'Sell'],
      categories: this.parseCategories(categories),
      price: this.parsePrice(price),
      user: this.parseUser(firstname, lastname, email, avatarPath),
    };
  }

  private parseCategories(categoriesString: string): { name: string }[] {
    return categoriesString.split(';').map((name) => ({ name }));
  }

  private parsePrice(priceString: string): number {
    return Number.parseInt(priceString, 10);
  }

  private parseUser(firstname: string, lastname: string, email: string, avatarPath: string): User {
    return { email, firstname, lastname, avatarPath };
  }

  public read(): void {
    // Код для работы с потоками
  }

  public toArray(): Offer[] {
    this.validateRawData();
    return this.parseRawDataToOffers();
  }
}

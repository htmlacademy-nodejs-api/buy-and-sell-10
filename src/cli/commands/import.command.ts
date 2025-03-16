import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { Offer } from '../../shared/types/offer.type.js';
import { getErrorMessage } from '../../shared/helpers/index.js';

export class ImportCommand implements Command {
  private onImportedOffer(offer: Offer): void {
    console.info(offer);
  }

  private onCompleteImport(count: number) {
    console.info(`${count.toString()} rows imported.`);
  }

  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('line', this.onImportedOffer.bind(this));
    fileReader.on('end', this.onCompleteImport.bind(this));

    try {
      await fileReader.read();
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
    }
  }
}

import EventEmitter from 'node:events';
import { createReadStream } from 'node:fs';

import { FileReader } from './file-reader.interface.js';
import { Offer, OfferType, User } from '../../types/index.js';

export class TSVFileReader extends EventEmitter implements FileReader {
  private CHUNK_SIZE = 16384; // 16KB

  constructor(
    private readonly filename: string
  ) {
    super();
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

  public async read(): Promise<void> {
    const readStream = createReadStream(this.filename, {
      highWaterMark: this.CHUNK_SIZE,
      encoding: 'utf-8',
    });

    let remainingData = '';
    let nextLinePosition = -1;
    let importedRowCount = 0;

    for await (const chunk of readStream as AsyncIterable<string>) {
      remainingData += chunk.toString();

      while ((nextLinePosition = remainingData.indexOf('\n')) >= 0) {
        const completeRow = remainingData.slice(0, nextLinePosition + 1);
        remainingData = remainingData.slice(++nextLinePosition);
        importedRowCount++;

        const parsedOffer = this.parseLineToOffer(completeRow);
        this.emit('line', parsedOffer);
      }
    }

    this.emit('end', importedRowCount);
  }
}

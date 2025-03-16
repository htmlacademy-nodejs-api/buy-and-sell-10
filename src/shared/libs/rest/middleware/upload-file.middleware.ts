import { NextFunction, Request, Response } from 'express';
import multer, { diskStorage } from 'multer';
import { extension } from 'mime-types';

import * as crypto from 'node:crypto';
import { promisify } from 'node:util';

import { Middleware } from './middleware.interface.js';

export class UploadFileMiddleware implements Middleware {
  constructor(
    private uploadDirectory: string,
    private fieldName: string,
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const fileExtension = extension(file.mimetype);
        const filename = crypto.randomUUID();
        callback(null, `${filename}.${typeof fileExtension === 'string' ? fileExtension : 'unknown'}`);
      }
    });

    const uploadSingleFileMiddleware = multer({ storage }).single(this.fieldName);
    const uploadMiddlewarePromise = promisify(uploadSingleFileMiddleware);

    try {
      await uploadMiddlewarePromise(req, res);
      next();
    } catch (err) {
      next(err);
    }

  }
}

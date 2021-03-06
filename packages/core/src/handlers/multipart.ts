import * as http from 'http';
import * as multiparty from 'multiparty';
import { BaseStorage, File, FileInit } from '../storages';
import { DiskStorageOptions } from '../storages';
import { ERRORS, fail, setHeaders } from '../utils';
import { BaseHandler } from './base-handler';

interface MultipartyPart extends multiparty.Part {
  headers: {
    [key: string]: any;
    'content-type': string;
  };
}

export class Multipart<TFile extends Readonly<File>, TList> extends BaseHandler<TFile, TList> {
  async post(req: http.IncomingMessage, res: http.ServerResponse): Promise<TFile> {
    return new Promise((resolve, reject) => {
      const form = new multiparty.Form();
      const config: FileInit = { metadata: {} };
      form.on('field', (key, value) => {
        Object.assign(config.metadata, key === 'metadata' ? JSON.parse(value) : { [key]: value });
      });
      form.on('error', error => reject(error));
      form.on('part', (part: MultipartyPart) => {
        config.size = part.byteCount;
        config.originalName = part.filename;
        config.contentType = part.headers['content-type'];
        config.userId = this.getUserId(req, res);
        part.on('error', error => null);
        this.storage
          .create(req, config)
          .then(created =>
            this.storage.write({
              start: 0,
              contentLength: part.byteCount,
              body: part,
              name: created.name
            })
          )
          .then(file => {
            if (file.status === 'completed') {
              const headers = { Location: this.buildFileUrl(req, file) };
              setHeaders(res, headers);
            }
            return resolve(file);
          })
          .catch(err => reject(err));
      });

      form.parse(req);
    });
  }

  /**
   * Delete upload by id
   */
  async delete(req: http.IncomingMessage, res: http.ServerResponse): Promise<TFile> {
    const name = this.getName(req);
    if (!name) return fail(ERRORS.FILE_NOT_FOUND);
    const [file] = await this.storage.delete(name);
    this.send(res, { statusCode: 204 });
    return file;
  }
}

/**
 * Basic express wrapper
 */
export function multipart<TFile extends Readonly<File>, TList>(
  options: DiskStorageOptions | { storage: BaseStorage<TFile, TList> } = {}
): (req: http.IncomingMessage, res: http.ServerResponse) => void {
  return new Multipart(options).handle;
}

multipart.upload = (options: DiskStorageOptions | { storage: any }) =>
  new Multipart(options).upload;

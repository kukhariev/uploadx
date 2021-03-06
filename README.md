# node-uploadx

[![npm version][npm-image]][npm-url] [![Build status][gha-image]][gha-url]
[![commits since latest release][comm-image]][comm-url] [![Snyk Vulnerabilities][snyk-image]][snyk-url]

> Node.js resumable upload middleware.
> Server-side part of [ngx-uploadx](https://github.com/kukhariev/ngx-uploadx)
> Supported APIs: Google resumable v3.0, tus 1.0, multipart upload.
> Capable store uploads locally on disk, on Google Storage or on AWS S3.

## 🌩 Installation

All-In-One:

```sh
npm install node-uploadx
```

Separate modules can also be used to save disk space and for faster installation process.:

- core module:

  ```sh
  npm install @uploadx/core
  ```

- _Google Cloud Storage_ support:

  ```sh
  npm install @uploadx/gcs
  ```

- _AWS S3_ support:

  ```sh
  npm install @uploadx/s3
  ```

## ♨ Usage

Express example:

```js
const express = require('express');
const { uploadx } = require('@uploadx/core');

const app = express();
const opts = {
  directory: './files',
  onComplete: file => console.log('Upload complete: ', file)
};

app.use('/upload/files', uploadx(opts));

app.listen(3003);
```

Node http.Server GCS example:

```js
const { Uploadx, GCStorage } = require('node-uploadx');
const http = require('http');
const url = require('url');

const storage = new GCStorage({ bucket: 'uploads' });
const uploads = new Uploadx({ storage });
uploads.on('completed', console.log);

const server = http
  .createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/upload/files') {
      uploads.handle(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plan' });
      res.end('Not Found');
    }
  })
  .listen(3003);
```

Please navigate to the [examples](examples) for more.

### 🛠 Options

Available options are:

| option                |       type       |  default value   | description                                         |
| :-------------------- | :--------------: | :--------------: | --------------------------------------------------- |
| `directory`           |     `string`     |    `"files"`     | _DiskStorage upload directory_                      |
| `bucket`              |     `string`     | `"node-uploadx"` | _S3 or GCS bucket_                                  |
| `path`                |     `string`     |    `"/files"`    | _Node http base path_                               |
| `allowMIME`           |    `string[]`    |    `["*\*"]`     | _Allowed MIME types_                                |
| `maxUploadSize`       | `string\|number` |     `"5TB"`      | _File size limit_                                   |
| `maxMetadataSize`     | `string\|number` |     `"4MB"`      | _Metadata size limit_                               |
| `validation`          |     `Object`     |                  | _Upload validation options_                         |
| `useRelativeLocation` |    `boolean`     |     `false`      | _Use relative urls_                                 |
| `filename`            |    `Function`    |                  | _Name generator function_                           |
| `onComplete`          |    `Function`    |                  | _On upload complete callback_                       |
| `clientDirectUpload`  |    `boolean`     |                  | _Upload by a compatible client directly to the GCS_ |

For Google Cloud Storage authenticate see [GoogleAuthOptions](https://github.com/googleapis/google-auth-library-nodejs/blob/04dae9c271f0099025188489c61fd245d482832b/src/auth/googleauth.ts#L62). Also supported `GCS_BUCKET`, `GCS_KEYFILE` and `GOOGLE_APPLICATION_CREDENTIALS` environment variables.

For AWS S3 - [Setting Credentials in Node.js](https://docs.aws.amazon.com/en_us/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html) and `S3_BUCKET`, `S3_KEYFILE` environment variable.

## References

- [https://developers.google.com/drive/api/v3/manage-uploads#resumable](https://developers.google.com/drive/api/v3/manage-uploads#resumable)
- [https://github.com/tus/tus-resumable-upload-protocol/blob/master/protocol.md](https://github.com/tus/tus-resumable-upload-protocol/blob/master/protocol.md)

## Contributing

If you'd like to contribute, please fork the repository and make changes as you'd like.
Pull requests are welcome!

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/node-uploadx.svg
[npm-url]: https://www.npmjs.com/package/node-uploadx
[gha-image]: https://github.com/kukhariev/node-uploadx/workflows/CI/badge.svg
[gha-url]: https://github.com/kukhariev/node-uploadx
[comm-image]: https://img.shields.io/github/commits-since/kukhariev/node-uploadx/latest
[comm-url]: https://github.com/kukhariev/node-uploadx/releases/latest
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/npm/node-uploadx
[snyk-url]: https://snyk.io/test/github/kukhariev/node-uploadx?targetFile=package.json

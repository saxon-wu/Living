import { createStream } from 'rotating-file-stream';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as morgan from 'morgan';

export function setupMorgan(app: INestApplication) {
  // MORGAN HTTP请求 日志中间件
  const logDirectory = path.join(__dirname, 'log');

  // ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

  // create a rotating write stream
  var accessLogStream = createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory,
  });

  // setup the logger
  app.use(morgan('combined', { stream: accessLogStream }));
}

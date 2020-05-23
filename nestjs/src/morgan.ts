import { createStream } from 'rotating-file-stream';
import { INestApplication } from '@nestjs/common';
import fs from 'fs';
import morgan from 'morgan';
import { join } from 'path';

export function setupMorgan(app: INestApplication) {
  
  // MORGAN HTTP请求 日志中间件
  const logDirectory = join(__dirname, '..', 'logs');

  // Ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

  // Create a rotating write stream
  var accessLogStream = createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory,
  });

  // Setup the logger
  app.use(morgan('combined', { stream: accessLogStream }));
}

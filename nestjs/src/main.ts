import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  HttpStatus,
  NestApplicationOptions,
} from '@nestjs/common';
import { HttpExceptionFilter } from './shared/http-exception.filter';
import { TransformInterceptor } from './shared/transform.interceptor';
import rateLimit from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import DDOS from 'ddos';
import bodyParser from 'body-parser';
import { noop } from 'rxjs';
import { setupMorgan } from './morgan';
import csurf from 'csurf';
import fs from 'fs';

const PORT = process.env.API_PORT || 3000;
const PREFIX = process.env.API_PREFIX || 'api';
const API_URL_PREFIX = process.env.API_URL_PREFIX || 'localhost';
const isDevelopment = process.env.NODE_ENV === 'development';

const nestApplicationOptions: NestApplicationOptions = {};
if (API_URL_PREFIX.includes('https')) {
  const secretsDir = join(__dirname, '..', 'secrets');
  const httpsOptions = {
    key: fs.readFileSync(`${secretsDir}/living.key`),
    cert: fs.readFileSync(`${secretsDir}/living.crt`),
  };
  nestApplicationOptions.httpsOptions = httpsOptions;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    nestApplicationOptions,
  );

  // 允许跨域资源共享 端口80不可为 http:xxx:80
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:8001',
      'http://localhost',
      'http://localhost:3000',
      'https://living-blog.now.sh',
    ],
  });

  // 限制请求次数
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 100 requests per windowMs
      message: {
        status: HttpStatus.TOO_MANY_REQUESTS,
        message: '请求过于频繁，请稍候再试！',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        results: null,
      },
    }),
  );

  // 全局路由前缀
  app.setGlobalPrefix(PREFIX);

  // 全局注册错误的过滤器(错误异常)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局注册拦截器(成功返回格式)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局使用管道(数据校验)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动将有效负载转换为对象类型，就是plainToClass
      forbidNonWhitelisted: true, // 非白名单属性停止处理请求，并向用户返回错误响应
      whitelist: true, // 自动删除非白名单属性(在验证类中没有任何修饰符的属性)
      // skipMissingProperties: true, // 如果设置为true，则验证程序将跳过验证对象中缺少的所有属性的验证。
      // disableErrorMessages: true, // 如果设置为true，则验证错误不会转发到客户端。
      // dismissDefaultMessages: true, // 如果设置为true，则验证将不使用默认消息。undefined如果未明确设置，则始终为错误消息。
      // groups: [], // 在验证对象期间要使用的组。
      validationError: {
        target: true, // 指示是否应该公开目标 ValidationError
        value: true, // 指示是否应公开验证值ValidationError。
      },
    }),
  );

  // 压缩可以大大减小响应主体的大小，从而提高 Web 应用程序的速度
  app.use(compression());

  // 应用层DDOS保护
  const ddos = new DDOS({ burst: 100, limit: 150 });
  isDevelopment ? noop() : app.use(ddos.express);

  // 拒绝已知的REST API漏洞
  // app.use(helmet.hidePoweredBy({ setTo: 'PHP/5.3.2' }));
  app.use(helmet.hidePoweredBy()); // Remove the X-Powered-By header
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.noSniff()); // Keep clients from sniffing the MIME type
  app.use(helmet.xssFilter()); // Adds some small XSS protections
  app.use(helmet.referrerPolicy()); // Hide the Referer header
  app.use(helmet.hsts()); // HTTP Strict Transport Security

  // 健康检查URL @ index.html
  const K = '哎呀，这里什么都没有:)';
  app.use('/index.html', (request: any, response: any) => response.send(K));

  // 添加对BODY/ url编码的REST api的支持
  app.use(bodyParser.urlencoded({ extended: true, limit: '8mb' }));
  // 413 Request Entity Too Large(params) OR Request Entity Too Large(params, files)
  app.use(bodyParser.json({ limit: '8mb' }));

  // 跨站点请求伪造（称为 CSRF 或 XSRF）
  // app.use(csurf());

  // 设置写入日志
  setupMorgan(app);

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  await app
    .listen(PORT)
    .then(() => console.log(`Server starting on ${API_URL_PREFIX}:${PORT}`));
}
bootstrap();

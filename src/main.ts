import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session'

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // generic for useStaticAssets
  const port = process.env.PORT || 3000;
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe( { transform: true }));

  if (process.env.NODE_ENV === 'production') { 
    app.enableCors({ 
      origin: ['https://nest-slack.com'], // https://github.com/expressjs/cors#configuration-options
      credentials: true
    });
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  app.useStaticAssets(path.join(__dirname, '..', 'file-uploads'), { // multer 관련 파일 경로를 지정해줌
    prefix: '/file-uploads'
  }); 

  const config = new DocumentBuilder()
    .setTitle('nest-slack API')
    .setDescription('The slack API description')
    .setVersion('1.0')
    .addTag('nest-slack')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
        httpOnly: true
      }
    })
  )
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(port);
  console.log(`listening on port: ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('bootstrap');
  
  const PORT = configService.get<number>('PORT') || 4000;
  
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
          enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(PORT, () => {
    logger.log(`Application listening on port ${PORT}`);
  });
}
bootstrap();

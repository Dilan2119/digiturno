import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  try {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    console.log('Redis adapter enabled');
  } catch (err) {
    console.warn('Redis not available, using in-memory socket adapter:', (err as Error).message);
  }

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const uploadsPath = join(process.cwd(), 'uploads');
  console.log(`Serving static files from: ${uploadsPath}`);
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

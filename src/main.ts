import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow requests from any origin ['http://localhost:5173', 'https://fays-hub-v3.vercel.app'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Include OPTIONS for preflight requests
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept', // Explicitly allow common headers
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

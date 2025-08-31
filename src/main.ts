import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import "reflect-metadata";
import z from "zod";
import { AppModule } from "./app.module";
import { ENVEnum } from "./common/enum/env.enum";
import { AllExceptionsFilter } from "./common/filter/http-exception.filter";
// import { GlobalExceptionFilter } from "./common/filter/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: ["*"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  // app.useGlobalFilters(new GlobalExceptionFilter());

  // ✅ Swagger config with Bearer Auth
  extendZodWithOpenApi(z);
  const config = new DocumentBuilder()
    .setTitle("Jdadzok")
    .setDescription("Jdadzok API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? "5000", 10);
  await app.listen(port);
}

void bootstrap();

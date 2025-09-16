import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";
import "reflect-metadata";
import z from "zod";
import appMetadata from "./app-metadata/app-metadata";
import { AppModule } from "./app.module";
import { ENVEnum } from "./common/enum/env.enum";
import { AllExceptionsFilter } from "./common/filter/http-exception.filter";

// import { GlobalExceptionFilter } from "./common/filter/http-exception.filter";

expand(config({ path: path.resolve(process.cwd(), ".env") }));
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration
  app.enableCors({
    origin: "*",
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
    .setTitle(appMetadata.displayName)
    .setDescription(appMetadata.description)
    .setVersion(appMetadata.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? "5056", 10);

  await app.listen(
    port,
    process.env.NODE_ENV !== "development" ? "0.0.0.0" : "localhost",
    () => console.info(`PORT=${port}`),
  );
}

void bootstrap();

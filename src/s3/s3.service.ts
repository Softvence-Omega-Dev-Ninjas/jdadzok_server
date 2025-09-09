// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { ENVEnum } from '@common/enum/env.enum';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { extname } from 'path';
// import { v4 as uuid } from 'uuid';

// @Injectable()
// export class S3Service {
//     private s3: S3Client;
//     private AWS_S3_BUCKET_NAME: string;

//     constructor(private readonly configSerivce: ConfigService) {
//         const AWS_REGION = configSerivce.getOrThrow(ENVEnum.AWS_REGION)
//         const AWS_ACCESS_KEY_ID = configSerivce.getOrThrow(ENVEnum.AWS_ACCESS_KEY_ID)
//         const AWS_SECRET_ACCESS_KEY = configSerivce.getOrThrow(ENVEnum.AWS_SECRET_ACCESS_KEY)
//         const AWS_S3_BUCKET_NAME = configSerivce.getOrThrow(ENVEnum.AWS_S3_BUCKET_NAME)
//         this.AWS_S3_BUCKET_NAME = AWS_S3_BUCKET_NAME

//         this.s3 = new S3Client({
//             region: AWS_REGION!,
//             credentials: {
//                 accessKeyId: AWS_ACCESS_KEY_ID!,
//                 secretAccessKey: AWS_SECRET_ACCESS_KEY!,
//             },
//         });
//     }

//     async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
//         const fileExtension = extname(file.originalname);
//         const key = `${folder}/${uuid()}${fileExtension}`;

//         const command = new PutObjectCommand({
//             Bucket: this.AWS_S3_BUCKET_NAME,
//             Key: key,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//         });

//         await this.s3.send(command);

//         return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//     }
// }

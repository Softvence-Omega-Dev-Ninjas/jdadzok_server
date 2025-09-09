import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { S3ResponseDto } from "./dto/s3.dto";

@Injectable()
export class S3Service {
  private s3: S3Client;
  private AWS_S3_BUCKET_NAME: string;
  private AWS_REGION: string;

  constructor(private readonly configSerivce: ConfigService) {
    this.AWS_REGION = this.configSerivce.getOrThrow("AWS_REGION");
    this.AWS_S3_BUCKET_NAME =
      this.configSerivce.getOrThrow("AWS_S3_BUCKET_NAME");

    this.s3 = new S3Client({
      region: this.AWS_REGION,
      credentials: {
        accessKeyId: this.configSerivce.getOrThrow("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configSerivce.getOrThrow("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<S3ResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No file(s) uploaded");
    }

    if (files.length > 20) {
      throw new BadRequestException("You can upload a maximum of 20 files");
    }

    const results: S3ResponseDto[] = [];

    for (const file of files) {
      results.push(await this.uploadFile(file));
    }

    return results;
  }

  async uploadFile(file: Express.Multer.File): Promise<S3ResponseDto> {
    const fileExt = file.originalname.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;

    const folder = this.getFolderByMimeType(file.mimetype);
    const s3Key = `${folder}/${uniqueFileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype, // Important for browser preview
      });

      await this.s3.send(command);

      return {
        size: file.size,
        type: file.mimetype,
        originalName: file.originalname,
        url: `https://${this.AWS_S3_BUCKET_NAME}.s3.${this.AWS_REGION}.amazonaws.com/${s3Key}`,
      };
    } catch (err) {
      throw new BadRequestException("Failed to upload file to S3");
    }
  }

  private getFolderByMimeType(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "videos";
    return "documents";
  }
}

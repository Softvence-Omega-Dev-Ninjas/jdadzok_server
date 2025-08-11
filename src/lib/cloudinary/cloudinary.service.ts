import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENVEnum } from '@project/common/enum/env.enum';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';
import { Readable } from 'stream';

@Global()
@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        ENVEnum.CLOUDINARY_CLOUD_NAME,
      ),
      api_key: this.configService.getOrThrow<string>(
        ENVEnum.CLOUDINARY_API_KEY,
      ),
      api_secret: this.configService.getOrThrow<string>(
        ENVEnum.CLOUDINARY_API_SECRET,
      ),
    });
  }

  async uploadImageFromBuffer(
    fileBuffer: Buffer,
    filename: string,
    folder = 'profile-images',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const originalNameWithoutExt = path.parse(filename).name;

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: originalNameWithoutExt,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );
      Readable.from(fileBuffer).pipe(stream);
    });
  }

  private extractPublicId(url: string): string {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const filenameWithExt = parts.slice(-1)[0]; // e.g. Screenshot-2025-07-10-at-10.07.04-PM.png
    const folder = parts.slice(-2, -1)[0]; // e.g. profile-images
    const filename = path.parse(filenameWithExt).name;
    return `${folder}/${filename}`;
  }

  async deleteImage(url: string): Promise<void> {
    const publicId = await this.extractPublicId(url);
    await cloudinary.uploader.destroy(publicId);
  }
}

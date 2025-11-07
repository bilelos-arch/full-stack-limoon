import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: 'dgm6ng4wj',
      api_key: '466765748292158',
      api_secret: 'KX2gRXebDHDEDQqNpS_OcCFZlaA',
    });
  }

  getCloudinary(): typeof cloudinary | undefined {
    return cloudinary;
  }
}
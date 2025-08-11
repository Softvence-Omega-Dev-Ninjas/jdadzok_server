import { Global, Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { SuperAdminService } from './services/super-admin.service';

@Global()
@Module({
  imports: [],
  providers: [AdminService, SuperAdminService],
})
export class SeedModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/user/user.entity';
import { FileModule } from '@src/file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), FileModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

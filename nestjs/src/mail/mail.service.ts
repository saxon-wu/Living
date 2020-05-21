import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { UserEntity } from '@src/user/user.entity';
import { FileService } from '@src/file/file.service';
import { IFileProperty } from '@src/file/file.interface';
import { FilePurposeEnum } from '@src/file/file.enum';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail') private readonly mailQueue: Queue,
    private readonly fileService: FileService,
  ) {}

  async addQueue(user: UserEntity) {
    const job = await this.mailQueue.add('sendEmail', {
      user
    });

    return { taskId: job.id };
  }

  async getState(jobId: number) {
    const job = await this.mailQueue.getJob(jobId);
    return job.getState();
  }

}

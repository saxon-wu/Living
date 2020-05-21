import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailService } from './mail.service';

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);
  
  constructor(private readonly mailService: MailService) {}


  @Process('sendEmail')
  async exec(job: Job<unknown>) {
    this.logger.debug('Start sending...');
    await new Promise((resolve) => setTimeout(resolve, 6000));
    this.logger.debug(job.data)
    const {user} = <any>job.data
    this.logger.debug(`Sending completed id=${job.id}, timestamp=${job.timestamp}`);
  }
}

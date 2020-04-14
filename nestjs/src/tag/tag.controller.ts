import { Controller, Get, Param, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { UUIDParamDTO } from '@src/shared/shared.dto';

const MANY = 'tags';
const ONE = 'tag';

@Controller('v1')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get(`${MANY}`)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ) {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.tagService.findAll({ page, limit });
  }
}

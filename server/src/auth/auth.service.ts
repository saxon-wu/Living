import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { LoginDTO } from './auth.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  async login(loginDTO: LoginDTO) {
    const { username, password } = loginDTO;
    const user = await this.userRepository.findOne({ username });
    if (!user || !user.comparePassword(password)) {
      throw new ForbiddenException('亲，用户或密码不正确');
    }
    return user.toResponseObject(false, true);
  }

  async register(loginDTO: LoginDTO) {
    const { username, password } = loginDTO;
    const user = await this.userRepository.findOne({ username });
    if (user) {
      throw new ConflictException('亲，用户已存在');
    }

    const created = this.userRepository.create(loginDTO);
    const saved = await this.userRepository.save(created);

    return saved.toResponseObject(false, true);
  }
}

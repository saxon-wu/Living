import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

interface ITokenResponseObject {
  readonly accessToken: string;
  readonly expiresIn: string | number;
}

@Entity('user')
export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @Column({
    unique: true,
  })
  username: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  password: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  comparePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }

  toResponseObject(isAdminSide: boolean = false, showToken: boolean = false) {
    const { id, uuid, username, createdAt, updatedAt, tokenObject } = this;
    const client = { id: uuid, username };

    if (isAdminSide) {
      return { id, uuid, username, createdAt, updatedAt };
    }
    if (showToken) {
      return { ...client, ...tokenObject };
    }
    return client;
  }

  private get tokenObject(): ITokenResponseObject {
    const { uuid, username } = this;
    // JWT_EXPIRATION_IN环境变量取到的是字符串，Eg: '60', "2 days", "10h", "7d", 其中字符串中是纯数字必须转成number类型，否则会报token过期
    let expiresIn: number | string = process.env.JWT_EXPIRATION_IN;
    if (!Number.isNaN(Number(expiresIn))) {
      // expiresIn转成数字类型不是not a number，说时可以转为数字类型，则转为数字类型
      expiresIn = Number.parseInt(expiresIn, 10);
    }
    const accessToken: string = jwt.sign(
      { id: uuid, username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn,
      },
    );
    return { accessToken, expiresIn };
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) {}

    async signIn(email: string, nickname: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email }});

        if (user) {
            throw new HttpException('이미 가입한 이메일입니다.', 401);
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.userRepository.save({
            email,
            nickname,
            password: hashedPassword
        });
    }
}

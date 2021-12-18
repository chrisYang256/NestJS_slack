import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({email});
    console.log(email, password, user)

    if (!user) {
      return null;
    }

    const result = await bcrypt.compair(password, user.password);
    if (result) {
        // 구조분해할당으로 password만 빼고 나머지 가져오는 방법!
        // delete user.password; 해도 같음.
        const { password, ...userWithoutPassword } = user; 
        return userWithoutPassword;
    }
    
    return null;
  }

//   async login(user: any) {
//     const payload = { username: user.username, sub: user.userId };
//     return {
//       access_token: this.jwtService.sign(payload),
//     };
//   }
}
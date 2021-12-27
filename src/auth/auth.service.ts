import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    // 공식문서처럼 usersService에서 로직을 추가로 만들어 가져오지 않고 InjectionRepository를 사용
    // 서비스에서 서비스를 부르면 모킹을 반복해야 하는 등 테스트 로직이 복잡해짐.
    @InjectRepository(Users) 
    private usersRepository: Repository<Users>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
        where: { email },
        select: ['id', 'password', 'email', 'nickname'] // User entity에서 password를 select: false로 막아놨기 때문에 설정해줘야함.
    });
    console.log('validateUser(auth.service):::', email, password, user)

    if (!user) {
      return null;
    }

    const result = await bcrypt.compare(password, user.password);
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
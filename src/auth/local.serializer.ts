import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "src/entities/Users";
import { Repository } from "typeorm";

@Injectable()
export class LocalSerializer extends PassportSerializer {
    constructor(
        @InjectRepository(Users) private userRepository: Repository<Users>,
    ) {
        super();
    }

    serializeUser(user: Users, done: CallableFunction) { // user정보 일부(id) sesiion에 저장
        done(null, user.id) 
    }

    async deserializeUser(userId: string, done: CallableFunction) { // user정보 복원
        return await this.userRepository
            .findOneOrFail({ 
                id: +userId,
                }, {
                select: ['id', 'email', 'nickname'],
                relations: ['Workspaces'] // typrorm 테이블 조인하는 방법(from User entity)
            })
            .then((user) => {
                console.log('user', user);
                done(null, user); // req.user
            })
            .catch((error) => done(error));
    }
}
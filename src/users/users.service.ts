import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Connection, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        private connection: Connection // query runner transaction controll https://docs.nestjs.kr/techniques/database#transactions
    ) {}

    async signIn(email: string, nickname: string, password: string) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        
        // ... this.userRepository.findOne({ where: { email } });처럼 this를 통해 Repository를 가져오는 경우
        // TypeOrmModule.forRoot(ormconfig)를 통해 맺어지기 때문에
        // await queryRunner.manager로 Repository를 가져와 관계를 맺어줘야 transaction이 적용되어 맺어짐.
        const user = await this.userRepository.findOne({ where: { email } });
        
        if (user) {
            throw new ForbiddenException('이미 가입한 이메일입니다.'); // HttpException('', status)을 상속받은 exception
        }
        
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await queryRunner.startTransaction();
        
        try {
            const enteredUser = await queryRunner.manager.getRepository(Users).save({
                email,
                nickname,
                password: hashedPassword
            });
            // throw new Error('rollback test')
            await queryRunner.manager.getRepository(WorkspaceMembers).save({
                UserId: enteredUser.id,
                WorkspaceId: 1,
            });
            await queryRunner.manager.getRepository(ChannelMembers).save({
                UserId: enteredUser.id,
                ChannelId: 1,
            });
            await queryRunner.commitTransaction(); // 성공
            return true;
            /*
                // 아래와 같은 방법으로 data mapping을 하면 if문이나 for문 등으로 컨트롤 할 수 있음
                const workspaceMember = new WorkspaceMembers(); // 혹은 new ~ 대신 this.workspaceMembersRepository.create();
                workspaceMember.UserId = enteredUSer.id;
                WorkspaceMember.workspaceId = 1;
            */
        } catch(error) {
            console.error(error);
            await queryRunner.rollbackTransaction(); // 실패
            throw error;
        } finally {
            await queryRunner.release(); // 성공실패 상관 없이 DB와 연결 끊어주기
        }
    }
}

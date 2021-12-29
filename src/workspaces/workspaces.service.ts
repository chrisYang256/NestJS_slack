import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspaces)
        private workspacesRepository: Repository<Workspaces>,
        @InjectRepository(WorkspaceMembers)
        private workspaceMembersRepository: Repository<WorkspaceMembers>,
        @InjectRepository(ChannelMembers)
        private channelMembersRepository: Repository<ChannelMembers>,
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        private connection: Connection
    ) {}

    async findWorkspaces(workspaceName: string) {
        const workspaces = await this.workspacesRepository
            .createQueryBuilder('workspace')
            .where('workspace.name like :name', { name: `%${workspaceName}%` })
            .getMany();

        console.log('findWorkspaces:::', workspaces)
        return workspaces;
    }
    
    async getMyWorkspaces(myId: number) {
        return await this.workspacesRepository
            .createQueryBuilder('workspace')
            .innerJoin('workspace.WorkspaceMembers', 'WM')
            .where('WM.UserId = :myId', { myId })
            .getMany();
        // return this.workspacesRepository.find({ // 안되는 로직
        //     where: { WorkspaceMembers: [{ userId: myId }] }
        // });
    }

    async createWorkspace(myId: number, name: string, url: string) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        const checkName = await this.workspacesRepository
            .createQueryBuilder('workspace')
            .where('workspace.name = :name', { name })

        if (checkName) {
            throw new ForbiddenException('이미 존재하는 채널 url입니다');
        }

        await queryRunner.startTransaction();

        try {
            const workspace = new Workspaces(); // 다양한 방법의 typeorm 맵핑 
            workspace.OwnerId = myId;
            workspace.name = name;
            workspace.url = url;
            // await this.WorkspacesRepository.save(workspace);
            await queryRunner.manager.getRepository(Workspaces).save(workspace)
    
            const workspaceMember = new WorkspaceMembers()
            workspaceMember.UserId = myId;
            workspaceMember.WorkspaceId = workspace.id;
    
            const channel = new Channels();
            channel.name = '일반'
            channel.WorkspaceId = workspace.id
    
            const [, channelResults] = await Promise.all([
                queryRunner.manager.getRepository(WorkspaceMembers).save(workspaceMember),
                queryRunner.manager.getRepository(Channels).save(channel)
                // this.workspaceMembersRepository.save(workspaceMember),
                // this.channelsRepository.save(channel)
            ]); 
    
            const channelMember = new ChannelMembers();
            channelMember.UserId = myId;
            channelMember.ChannelId = channelResults.id;
            await queryRunner.manager.getRepository(ChannelMembers).save(channelMember);
            // await this.channelMembersRepository.save(channelMember);
            await queryRunner.commitTransaction();
        } catch(error) {
            console.error(error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getWrokspaceMember(url: string, id: number) {
        return this.usersRepository
            .createQueryBuilder('user')
            .where('user.id = :id', { id }) // sql함수가 없는 이런 간단한 경우는 .where( { id } ) 라고만 넣어도 되긴 함
            .innerJoin('user.Workspaces', 'workspaces', 'workspaces.url = :url', { url })
            .getOne();
    }

    // Query Builder 써보기
    // 해당 url을 가진 workspace 안의 사용자 가져오기(~~ 안의, ~~의: Join). workspaceMembers 안의 ~ -> innnerJoin
    async getWrokspaceAllMembers(url: string) {
        return await this.usersRepository
            .createQueryBuilder('u') // 'u'는 uersRepository의 별명, 즉 Users Entity에 대한 별명
            .innerJoin('u.WorkspaceMembers', 'm') // 'm'은 u.workspaceMembers에 대한 별명(.workspaceMembers는 내가 Entity에 정의한 값)
            // !!원래 다대다 관계를 설정해두면 .innerJoin('u.Workspaces', 'w', 'w.url = :url, { url })만 써도 되지만 typeOrm버그가 있어서 두번 Join함.
            .innerJoin('m.Workspace', 'w', 'w.url = :url', { url })
            .getMany();
            /*
            - getRawMany() 결과(DB에서 만들어주는 row) -> ID, EMAIL, PASSWORD, workspace.NAME, workspace.URL
            - getMany() 결과(ORM이 객체 등으로 가공) -> 
                // SQL 결과물을 아래와 같이 자바스크립트로 한 번 가공해서 객체로 리턴하기 때문에 느림.
                // 하지만 성능을 생각할거면 row query를 쓰는게 맞음. 이런저런 이유로 getMany를 많이 씀.
                {
                    id: '1',
                    email: 'abc@def.net,
                    Workspace: {
                        name: 'ghgh',
                        url: 'gkgk'
                    }
                }
            */
    }

    // transaction 처리 전 상태
    async inviteMemberToWorkspaceChannel(url: string, email: string) { // 초대
        // typeorm은 join을 했다고 join한 테이블의 데이터를 가져오지 않기 때문에 joinAndSelec()를 써야함
        // const workspace = await this.workspacesRepository.findOne({
        //     where: { url },
        //     // relations: ['Channels'] 대신 join 사용해보기
        //     join: {
        //         alias: 'w', // alias: 'workspace'
        //         innerJoinAndSelect: {
        //             c: 'w.Channels', // channels: 'w.channels'
        //         },
        //     },
        // });
        
        const workspace = await this.workspacesRepository
            .createQueryBuilder('workspace')
            .innerJoinAndSelect('workspace.Channels', 'C')
            .where('workspace.url = :url', { url })
            .getOne();
        
        console.log('workspace:::', workspace);

        // 유저 정보에 workspace를 조인하여 담아놓음으로 두가지의 validation을 할 수 있도록 함.
        const user = await this.usersRepository
            .createQueryBuilder('u')
            .where('u.email = :email', { email })
            .innerJoinAndSelect('u.Workspaces', 'w')
            .getOne();
        console.log('user:::', user);

        if (!user) {
            throw new ForbiddenException('존재하지 않는 사용자입니다.');
        }

        if (user.Workspaces.find((v) => v.url === url)) {
            throw new ForbiddenException(`이미 '${workspace.name}' 워크스페이스에 초대된 회원입니다.`);
        }

        const workspaceMember = new WorkspaceMembers(); // 1. 워크스페이스 초대
        workspaceMember.WorkspaceId = workspace.id;
        workspaceMember.UserId = user.id;
        await this.workspaceMembersRepository.save(workspaceMember);

        // 채널까지 한번에 초대시키려면 아래 로직 사용. 그러나 실재 slack과도 다르고 channels 모듈에 거의 같은 기능이 있어서 주석처리.
        // const channelMember = new ChannelMembers(); // 2. 채널 초대
        // channelMember.UserId = user.id;
        // channelMember.ChannelId = workspace.Channels.find((v) => v.name === '일반').id;
        // await this.channelMembersRepository.save(channelMember);
    }
}

import { Injectable } from '@nestjs/common';
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
        private WorkspacesRepository: Repository<Workspaces>,
        @InjectRepository(WorkspaceMembers)
        private workspaceMembersRepository: Repository<WorkspaceMembers>,
        @InjectRepository(Channels)
        private channelsRepository: Repository<Channels>,
        @InjectRepository(ChannelMembers)
        private channelMembersRepository: Repository<ChannelMembers>,
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        private connection: Connection
    ) {}
    
    // async findById(id: number) {
    //     return this.workspaceMembersRepository.findByIds( [id] );
    // }
    
    async getMyWorkspaces(myId: number) {
        return this.WorkspacesRepository.find({
            where: { WorkspaceMembers: [{ UserId: myId }] }
        });
    }

    async createWorkspace(userId: number, name: string, url: string) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const workspace = new Workspaces(); // 다양한 방법의 typeorm 맵핑 
            workspace.OwnerId = userId;
            workspace.name = name;
            workspace.url = url;
            // await this.WorkspacesRepository.save(workspace);
            await queryRunner.manager.getRepository(Workspaces).save(workspace)
    
            const workspaceMember = new WorkspaceMembers()
            workspaceMember.UserId = userId;
            workspaceMember.WorkspaceId = workspace.id;
    
            const channel = new Channels();
            channel.name = '친구들 모여라~'
            channel.WorkspaceId = workspace.id
    
            const [, channelResults] = await Promise.all([
                queryRunner.manager.getRepository(WorkspaceMembers).save(workspaceMember),
                queryRunner.manager.getRepository(Channels).save(channel)
                // this.workspaceMembersRepository.save(workspaceMember),
                // this.channelsRepository.save(channel)
            ]); 
    
            const channelMember = new ChannelMembers();
            channelMember.UserId = channelResults.id;
            channelMember.ChannelId = channelResults.id;
            queryRunner.manager.getRepository(ChannelMembers).save(channelMember);
            // await this.channelMembersRepository.save(channelMember);
        } catch(error) {
            console.error(error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // Query Builder 써보기
    // 해당 url을 가진 workspace 안의 사용자 가져오기(~~ 안의, ~~의: Join). workspaceMembers 안의 ~ -> innnerJoin
    async getWorkspaceMembers(url: string) {
        this.usersRepository
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
}

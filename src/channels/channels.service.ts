import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/CannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsGateway } from 'src/events/events.gateway';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channels)
        private channelsRepository: Repository<Channels>,
        @InjectRepository(ChannelMembers)
        private channelmembersRepository: Repository<ChannelMembers>,
        @InjectRepository(Workspaces)
        private wrorkspaceRepository: Repository<Workspaces>,
        @InjectRepository(ChannelChats)
        private channelchatsRepository: Repository<ChannelChats>,
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        private eventsGateway: EventsGateway,
    ) {}

    async findChannelById(Id: number) {
        // return this.channelsRepository.findOne({ where: { id} });
        return this.channelsRepository.createQueryBuilder('channels').where('id').getOne();
    }

    async getAllChannels(url: string, myId: number) {
        return this.channelsRepository
            .createQueryBuilder('channels') // alias by Channels entity
            .innerJoinAndSelect(
                'channels.Channelmembers',
                'channelMembers', // alias by ChannelMembers entity
                'channelMembers.userId = :userId',
                { myId }
            )
            .innerJoinAndSelect(
                'channels.Workspace',
                'workspace',
                'workspace.url = :url',
                { url }
            )
            .getMany();
    }

    async getWorkspaceChannel(url: string, name: string) {
        return this.channelsRepository.findOne({
            where: { name },
            relations: ['Workspace'] // workspace까지 가져오기
        });
    }

    // transaction 관리 필요
    async createWorkspaceChannels(url: string, name: string, myId: number) {
        const workspace = await this.wrorkspaceRepository.findOne({ where: { url }});

        const channel = await this.channelsRepository.save({
            name,
            WrokspaceId: workspace.id
        });
        
        await this.channelmembersRepository.save({
            UserId: myId,
            ChannelId: channel.id
        });
    }

    async getWorkspaceChannelMembers(url: string, name: string) {
        return this.usersRepository
            .createQueryBuilder('user')
            .innerJoin('user.channels', 'channels', 'channels.name = :name', { name }) // 같은 채널 이름이 다른 워크스페이스에 있을 수 있으니
            .innerJoin('channels.Workspace', 'workspace', 'workspace.url = :url', { url }) // workspace도 추가로 검색
            .getMany();
    }

    // transaction 관리 필요
    async createWorkspaceChannelMembers(url: string, name: string, email: string) {
        const channel = await this.channelsRepository
            .createQueryBuilder('channel')
            .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
            .where('channel.name = :name', { name })
            .getOne();

        if(!channel) {
            throw new NotFoundException('존재하지 않는 채널입니다.')

        }
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .innerJoin('user.Workspaces', 'workspace', 'workspace.url = :url', { url })
            .getOne();
        
        if (!user) {
            throw new NotFoundException('존재하지 않는 사용자입니다.')
        }

        await this.channelmembersRepository.save({
            ChannelId: channel.id,
            UserId: user.id
        });
    }

    async getWorkspaceChannelChats(url: string, name: string, perPage: number, page: number) {
        return this.channelchatsRepository
            .createQueryBuilder('channelChats')
            .innerJoin('channelChats.Channel', 'channel', 'channel.name = :name', { name }) // name, url은 자주 나오니 indexing해주자
            .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
            .innerJoinAndSelect('channelChats.User', 'user')
            .orderBy('channelChats.createdAt', 'DESC')
            .take(perPage) // limit
            .skip(perPage * (page - 1)) // pagenation
            .getMany();
    }

    async getChannelUnreadsCount(url: string, name: string, after: number) {
        const channel = await this.channelsRepository
            .createQueryBuilder('channel')
            .innerJoin('channel.Workspace', 'workspace', 'workspace.url = url', { url })
            .where('channel.name = :name', { name })
            .getOne();

        return this.channelchatsRepository.count({ // COUNT(*)
            where: {
                ChannelId: channel.id,
                createdAt: MoreThan(new Date(after)) // > createdAt > "확인한 현재시간"
            }
        })
    }

    // tracsaction 관리 필요
    async postWorkspaceChannelChats({url, name, content, myId}) { // 매개변수 객체처리하면  순서 상관 없어짐. 꿀팁
        const channel = await this.channelsRepository
            .createQueryBuilder('channel')
            .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
            . where('channel.name = :name', { name })
            .getOne();

        if (!channel) {
            throw new NotFoundException('채널이 존재하지 않습니다.');
        }

        const chat = await this.channelchatsRepository.save({
            content,
            UserId: myId,
            ChannelId: channel.id
        });

        const chatWithUser = await this.channelchatsRepository.findOne({
            where: { id: chat.id },
            relations: ['User', 'Channel']
        });

        // socket.io로 해당 워크스페이스 채널 사용자들에게 전송
        this.eventsGateway.server.to(`/ws-${url}-${channel.id}`).emit('message', chatWithUser);
    }

    // transaction 관리 필요
    async createWorkspaceChannelImage(
        url: string,
        name: string,
        files: Express.Multer.File[],
        myId: number
    ) {
        const channel = await this.channelsRepository
            .createQueryBuilder('channel')
            .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
            .where('channel.name = :name', { name })
            .getOne();
        
            if (!channel) {
                throw new NotFoundException('채널이 존재하지 않습니다.');
            }

        for (let i = 0; i < files.length; i++) { // 파일이 여러개일 때 처리
            const chat = await this.channelchatsRepository.save({ // 채팅 저장
                content: files[i].path,
                UserId: myId,
                ChannelId: channel.id
            });

            const chatWithUser = await this.channelchatsRepository.findOne({ // 저장한 채팅 불러옴
                where: { id: chat.id },
                relations: ['User', 'Channel']
            });

            this.eventsGateway.server // 1. socket.io로 
                // .of(`/ws-${url})
                .to(`/ws-${url}-${chatWithUser.ChannelId}`) // 2. 불러온 채팅정보로 해당 워크스페이스와 채널을 찾고
                .emit('message', chatWithUser) // 3. 메시지로 전송
        }   
    }
}

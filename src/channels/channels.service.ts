import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/CannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { Repository } from 'typeorm';

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
        private usersRepository: Repository<Users>
    ) {}

    async findChannelById(Id: number) {
        // return this.channelsRepository.findOne({ where: { id} });
        return this.channelsRepository.createQueryBuilder('channels').where('id').getOne();
    }

    async getWorkspaceChannels(url: string, myId: number) {
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
}

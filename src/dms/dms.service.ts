import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DMs } from 'src/entities/DMs';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsGateway } from 'src/events/events.gateway';
import { onlineMap } from 'src/events/onlineMap';
import { Repository } from 'typeorm';

function getKeyByValue(object, value) {
    return Object.keys(Object).find((key) => object[key] === value);
}

@Injectable()
export class DmsService {
    constructor(
        @InjectRepository(DMs)
        private dmsRepository: Repository<DMs>,
        @InjectRepository(Workspaces)
        private workspaceRepository: Repository<Workspaces>,
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        private eventsGateway: EventsGateway
    ) {}

    async getWorkspaceAllDMs(url: string, myId: number) {
        return this.usersRepository
            .createQueryBuilder('user')
            .leftJoin('user.dms', 'dms', 'dms.sensderId = :myId', { myId })
            .leftJoin('dms', 'workspace', 'workspace.url = :url', { url })
            .groupBy('dms.senderId')
            .getMany();
    }

    async getWorkspaceDMChats(
        perPage: number, 
        page: number, 
        url: string, 
        counterpartId: number, 
        myId: number
    ) {
        return this.dmsRepository
            .createQueryBuilder('dms')
            .innerJoinAndSelect('dms.Sender', 'sender')
            .innerJoinAndSelect('dms.Receiver', 'receiver')
            .innerJoin('dms.Workspace', 'workspace')
            .where('workspace.url = :url', { url })
            .andWhere(
                `((dms.SenderId = :myId AND dms.ReceiverId = :counterpartId)
                    OR (dms.ReceiverId = :myId AND dms.SenderId = :counterpartId))`,
                { counterpartId, myId }
            )
            .orderBy('dms.createdAt', 'DESC')
            .take(perPage)
            .skip(perPage * (page - 1))
            .getMany();
    }

    async createWorkspaceDmChat(
        url: string, 
        content: string, 
        counterpartId: number, 
        myId: number
    ) {
        const workspace = await this.workspaceRepository.findOne({ where: { url } });

        const dm = await this.dmsRepository.save({
            SenderId: myId,
            ReceiverId: counterpartId,
            content: content,
            WorkspaceId: workspace.id
        });

        const dmWithSender = await this.dmsRepository.findOne({
            where: { id: dm.id },
            relations: ['Sender'],
        });
        const receiveSocketId = getKeyByValue(
            onlineMap[`\ws-${workspace.url}`],
            Number(counterpartId)
        );
        this.eventsGateway.server.to(receiveSocketId).emit('dm', dmWithSender);
    }

    async createWorkspaceDMImages(
        url: string, 
        files: Express.Multer.File[], 
        counterpartId: number, 
        myId: number
    ) {
        const workspace = await this.workspaceRepository.findOne({ where: { url } });

        for(let i = 0; i < files.length; i++) {
            const dm = await this.dmsRepository.save({
                SenderId: myId,
                ReceiveId: counterpartId,
                content: files[i].path,
                WorkspaceId: workspace.id
            });
            const dmWithSender = await this.dmsRepository.findOne({
                where: { id: dm.id },
                relations: ['Sender']
            });
            const receiverSocketId = getKeyByValue(
                onlineMap[`/ws-${workspace.url}`],
                Number(counterpartId),
            );
            this.eventsGateway.server.to(receiverSocketId).emit('dm', dmWithSender);
        }

    }

    // 기존 엔티티 매니저 코드
    // async getDMUnreadsCount(url, id, myId, after) {
    //     const workspace = await this.workspacesRepository.findOne({
    //       where: { url },
    //     });
    //     return this.dmsRepository.count({
    //       where: {
    //         WorkspaceId: workspace.id,
    //         SenderId: id,
    //         ReceiverId: myId,
    //         createdAt: MoreThan(new Date(after)),
    //       },
    //     });
    //   }
    // }
    async getUnleads(url: string, counterpartId: number, after: number, myId: number) {
        const nowDate = new Date(after);

        return await this.dmsRepository
            .createQueryBuilder('dms')
            .innerJoinAndSelect('dms.SenderId', 'sender')
            .innerJoinAndSelect('dms.ReceiverId', 'receiver')
            .innerJoin('dms.Workspace', 'workspace')
            .where('workspace.url = :url', { url })
            .andWhere(
                `(
                    (sender.id = :myId) AND 
                    (receiver.id = :counterpartId) AND
                    (createdAt > :nowDate)
                )`, 
                { myId, counterpartId, nowDate }
            )
            // .getCount(); // 아래꺼 대신
            .select('COUNT(dms.id)')
            .getRawMany();
    }
}

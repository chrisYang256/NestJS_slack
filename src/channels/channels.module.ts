import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsModule } from 'src/events/events.module';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService],
  imports: [
    TypeOrmModule.forFeature([
      Channels,
      ChannelMembers,
      Workspaces,
      ChannelChats,
      Users
    ]),
    // EventsGateway를 담고 있는 EventsModule이 있기 때문에 provider에 넣으면 안됨!
    // EventsGateway를 provider에 넣으면 class이기 때문에 작동할 때마다 new가 되서 새로운 인스턴스가 생성됨(새로운 서버가 생성됨)
    EventsModule,
  ]
})
export class ChannelsModule {}

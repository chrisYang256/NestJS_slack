import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { ChannelsService } from './channels.service';
import { PostChatDto } from './dto/post-chat.dto';

@ApiTags('CHANNEL')
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
    constructor(
        private channelsService: ChannelsService
    ) {}

    @Get()
    getAllChannels(@Param('url') url: string, @GetUser() user) {
        return this.channelsService.getAllChannels(url, user.id)
    }

    @Post()
    createChannels() {

    }

    @Get('/:id')
    findChannelById() {
        
    }

    @Get('name')
    getSpecificChannel(@Param('name') name: string) {

    }

    @Get(':name/chats')
    getWorkspaceChannelChats(
        @Param('url') url: string, 
        @Param('name') name: string, 
        @Query() query, 
        @Param() param
    ) {
        console.log(query.perPage, query.page);
        console.log(param.id, param.url)
        return this.channelsService.getWorkspaceChannelChats(url, name, query.perPage, query.page);
    }
    
    @Post(':name/chats')
    postWorkspaceChannelChats(
        @Param('url') url: string,
        @Param('name') name: string,
        @Body() body: PostChatDto,
        @GetUser() user  
    ) {
        return this.channelsService.postWorkspaceChannelChats({ url, name, content: body.content, myId: user.id }); // 매개변수 많으면 객체처리로 순서 상관없게 만듦
    }

    @Post(':name/images')
    postImages(@Body() body) {

    }

    @Get(':name/unreads')
    getUnreads(
        @Param('url') url: string,
        @Param('name') name: string,
        @Query('after') after: number   
    ) {
        return this.channelsService.getChannelUnreadsCount(url, name, after);
    }

    @Get(':name/members')
    getWorkspaceChannelMembers(@Param('url') url: string, @Param('name') name: string) {
        return this.channelsService.getWorkspaceChannelMembers(url, name);
    }

    @Post(':name/members')
    inviteMembers() {
        
    }
}

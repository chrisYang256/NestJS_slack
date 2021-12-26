import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { ChannelsService } from './channels.service';
import { PostChatDto } from './dto/post-chat.dto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { Users } from 'src/entities/Users';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateChannelMemeberDto } from './dto/create-channel.member.dto';

try { // 파일 업로드를 위한 저장소 설정
    fs.readdirSync('file-uploads');
} catch (error) {
    console.error('::: create file-uploads folder!');
    fs.mkdirSync('file-uploads');
}

@ApiTags('CHANNEL')
@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard)
@Controller('api/workspaces')
export class ChannelsController {
    constructor(
        private channelsService: ChannelsService
    ) {}

    @ApiOperation({ summary: '특정 워크스페이스 내 채널 모두 가져오기' })
    @Get(':url/channels')
    getWorkspaceChannels(@Param('url') url: string, @GetUser() user: Users) {
        return this.channelsService.getWorkspaceChannels(url, user.id)
    }

    @ApiOperation({ summary: '특정 워크스페이스 내 특정 채널 가져오기' })
    @Get(':url/channels/:name')
    async getWorkspaceChannel(@Param('url') url: string, @Param('name') name: string) {
        return this.channelsService.getWorkspaceChannel(url, name)
    }

    @ApiOperation({ summary: '워크스페이스에 채널 만들기' })
    @Post(':url/channels')
    async createWorkspaceChannel(
        @Param('url') url: string,
        @Body() body: CreateChannelDto,
        @GetUser() user: Users,
    ) {
        return this.channelsService.createWorkspaceChannel(url, body.name, user.id)
    }

    @ApiOperation({ summary: '채널 맴버들 가져오기' })
    @Get(':url/channels/:name/members')
    async getWorkspaceChannelMembers(@Param('url') url: string, @Param('name') name: string) {
        return this.channelsService.getWorkspaceChannelMembers(url, name);
    }

    @ApiOperation({ summary: '채널에 맴버 초대하기' })
    @Post(':url/channels/:name/members')
    async createWorkspaceChannelMembers(
        @Param('url') url: string, 
        @Param('name') name: string,
        @Body() body: CreateChannelMemeberDto
        ) {
        return this.channelsService.createWorkspaceChannelMembers(url, name, body.email);
    }

    @ApiOperation({ summary: '특정 채널의 채팅 모두 가져오기' })
    @Get(':url/channels/:name/chats')
    async getWorkspaceChannelChats(
        @Param('url') url: string, 
        @Param('name') name: string, 
        @Query() query, 
        @Param() param
    ) {
        console.log(query.perPage, query.page);
        console.log(param.id, param.url)
        return this.channelsService.getWorkspaceChannelChats(url, name, query.perPage, query.page);
    }
    
    @ApiOperation({ summary: '특정 채널에 채팅 생성하기' })
    @Post(':url/channels/:name/chats')
    async createWorkspaceChannelChats(
        @Param('url') url: string,
        @Param('name') name: string,
        @Body() body: PostChatDto,
        @GetUser() user: Users
    ) {
        return this.channelsService.createWorkspaceChannelChats({ url, name, content: body.content, myId: user.id }); // 매개변수 많으면 객체처리로 순서 상관없게 만듦
    }

    @ApiOperation({ summary: '특정 채널에 이미지 업로드하기' })
    @Post(':url/channels/:name/images')
    @UseInterceptors( // nest decorator 방식의 multer 설정
        FilesInterceptor('image', 10, { // 이미지 1개만: file~, 이미지 여러개: files~
            storage: multer.diskStorage({ 
                destination(req, file, cb) { 
                    cb(null, 'file-uploads/'); 
                },
                filename(req, file, cb) {
                    const ext = path.extname(file.originalname);
                    cb(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일명 중복 막기 위한 로직
                } 
            }),
            limits: { fileSize: 5 * 1024 * 1024 } // 5메가
        }),
    ) 
    async createWorkspaceChannelImage(
        @UploadedFiles() files: Array<Express.Multer.File>, // Express.Multer.File[],
        @Param('url') url: string,
        @Param('name') name: string,
        @GetUser() user: Users
    ) {
        console.log('multer-file:::', files)
        return this.channelsService.createWorkspaceChannelImage(url, name, files, user.id)
    }

    @Get(':url/channels/:name/unreads') // 안읽은 메시지
    async getUnreads(
        @Param('url') url: string,
        @Param('name') name: string,
        @Query('after', ParseIntPipe) after: number   
    ) {
        return this.channelsService.getChannelUnreadsCount(url, name, after);
    }
}

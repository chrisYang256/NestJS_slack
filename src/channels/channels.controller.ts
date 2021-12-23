import { Body, Controller, Get, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { ChannelsService } from './channels.service';
import { PostChatDto } from './dto/post-chat.dto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

try { // 파일 업로드를 위한 저장소 설정
    fs.readdirSync('file-uploads');
} catch (error) {
    console.error('::: create file-uploads folder!');
    fs.mkdirSync('file-uploads');
}

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
            limits: { fileSize: 5 * 1024 * 1024 }
        })
    ) 
    createWorkspaceChannelImage(
        @UploadedFiles() file: Array<Express.Multer.File>, // Express.Multer.File[],
        @Param('url') url: string,
        @Param('name') name: string,
        @GetUser() user  
    ) {
        console.log('multer-file:::', file)
        return this.channelsService.createWorkspaceChannelImage(url, name, file, user.id)
    }

    @Get(':name/unreads') // 안읽은 메시지
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

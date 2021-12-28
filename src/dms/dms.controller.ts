import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import multer from 'multer';
import path from 'path';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Users } from 'src/entities/Users';
import { DmsService } from './dms.service';

try {
    fs.readdirSync('file-uploads');
} catch(error) {
    console.error('Auto create file-uploads folder!');
    fs.mkdirSync('file-uploads');
}

@ApiTags('DMS')
@ApiCookieAuth('connect.sid')
@UseGuards(LocalAuthGuard)
@Controller('api/workspaces')
export class DmsController {
    constructor(
        private dmsService: DmsService
    ) {}

    @ApiOperation({ summary: '워크스페이스 DM 모두 가져오기' })
    @Get(':url/dms')
    async getWorkspaceAllDMs(@Param('url') url: string, @GetUser() user: Users) {
        return this.dmsService.getWorkspaceAllDMs(url, user.id);
    }

    @ApiOperation({ summary: '워크스페이스 특정 DM 모두 가져오기' })
    // swagger 연결 시 상세 정보를 넘겨주는 방법
    // @ApiParam({ name: 'url', description: '워크스페이스 url', required: true, type: String })
    // @ApiParam({ name: 'id', description: '유저 id', required: true, type: Number })
    // swagger decorator. Query는 swagger에 자동으로 연결되지 않음!
    @ApiQuery({ name: 'perPage', description: '한 번에 가져오는 갯수', required: true, type: Number })
    @ApiQuery({ name: 'page', description: '불러올 페이지', required: true, type: Number })
    @Get(':url/dms/:counterpartId/chats')
    async getWorkspaceDMChats(
        @Query('perpage', ParseIntPipe) perPage, 
        @Query('page', ParseIntPipe) page, 
        @Param('counterpartId', ParseIntPipe) counterpartId: number,
        @Param('url') url: string,
        @GetUser() user: Users
    ) { 
        return this.dmsService.getWorkspaceDMChats(perPage, page, url, counterpartId, user.id);
    }

    @ApiOperation({ summary: '워크스페이스 특정 DM 채팅 생성하기' })
    @Post(':url/dms/:counterpartId/chats')
    async createWorkspaceDmChat(
        @Param('url') url: string,
        @Param('counterpartId', ParseIntPipe) counterpartId: number,
        @Body('content') content: string,
        @GetUser() user: Users
    ) {
        return this.dmsService.createWorkspaceDmChat(url, content, counterpartId, user.id);
    }

    @ApiOperation({ summary: '워크스페이스 특정 DM IMG 업로드하기' })
    @UseInterceptors(
        FilesInterceptor('image', 10, {
            storage: multer.diskStorage({
                destination:(req, file, cb) => {
                    cb(null, 'file-uploads/');
                },
                filename(req, file, cb) {
                    const ext = path.extname(file.originalname);
                    cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
                }
            }),
            limits: { fileSize: 5 * 1024 * 1024 }
        })
    )
    @Post(':url/dms/:counterpartId/images')
    createWorkspaceDMImages(
        @Param('url') url: string,
        @Param('counterpartId', ParseIntPipe) counterpartId: number,
        @UploadedFiles() files: Express.Multer.File[],
        @GetUser() user: Users,
    ) {
        return this.dmsService.createWorkspaceDMImages(url, files, counterpartId, user.id);
    }

    @ApiOperation({ summary: '안읽은 DM counting' })
    @Get(':url/dms/:counterpartId/unreads')
    getUnleads(
        @Param('url') url: string,
        @Param('counterpartId') counterpartId: number,
        @Query('after', ParseIntPipe) after: number,
        @GetUser() user: Users
    ) {
        return this.dmsService.getUnleads(url, counterpartId, after, user.id);
    }
}

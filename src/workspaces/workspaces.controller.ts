import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Users } from 'src/entities/Users';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('WORKSPACE')
@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard)
@Controller('api/workspaces')
export class WorkspacesController {
    constructor(
        private workspacesService: WorkspacesService
    ) {}

    @ApiOperation({ summary: '이름으로 워크스페이스 찾기' })
    @Get(':name')
    // req.user 대신 커스텀 데코레이터 @GetUser()를 사용.(nest에서는 req, res를 쓰는 것이 좋은 설계가 아님)
    findWorkspaces(@Param('name') name: string) { 
        return this.workspacesService.findWorkspaces(name);
    }

    @ApiOperation({ summary: '내 워크스페이스 가져오기' })
    @Get()
    // req.user 대신 커스텀 데코레이터 @GetUser()를 사용.(nest에서는 req, res를 쓰는 것이 좋은 설계가 아님)
    getMyWorkspaces(@GetUser() user: Users) { 
        return this.workspacesService.getMyWorkspaces(user.id);
    }

    @ApiOperation({ summary: '워크스페이스 만들기 '})
    @Post()
    createWorkspace(@GetUser() user: Users, @Body() body: CreateWorkspaceDto) {
        return this.workspacesService.createWorkspace(user.id, body.name, body.url)
    }

    @ApiOperation( { summary: '워크스페이스 특정 맴버 가져오기 '})
    @Get(':url/users/:id')
    getWrokspaceMember(@Param('url') url: string, @Param('id') id: number, ) {
        return this.workspacesService.getWrokspaceMember(url, id);
    }

    @ApiOperation( { summary: '워크스페이스 맴버 모두 가져오기 '})
    @Get(':url/members')
    getWrokspaceAllMembers(@Param('url') url: string) {
        return this.workspacesService.getWrokspaceAllMembers(url);
    }

    @ApiOperation({ summary: '워크스페이스 맴버 초대하기' })
    @Post(':url/members')
    inviteMemberToWorkspace(@Param('url') url: string, @Body('email') email: string) {
        return this.workspacesService.inviteMemberToWorkspace(url, email)
    }
}

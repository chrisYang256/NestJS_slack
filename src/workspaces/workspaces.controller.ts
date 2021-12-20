import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Users } from 'src/entities/Users';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('WORKSPACE')
@Controller('api/workspaces')
export class WorkspacesController {
    constructor(
        private workspacesService: WorkspacesService
    ) {}

    @Get()
    // req.user 대신 커스텀 데코레이터 @GetUser()를 사용.(nest에서는 req, res를 쓰는 것이 좋은 설계가 아님)
    getMyWorkspaces(@GetUser() user: Users) { 
        return this.workspacesService.getMyWorkspaces(user.id);
    }

    @Post()
    createWorkspace(@GetUser() user: Users, @Body() body: CreateWorkspaceDto) {
        return this.workspacesService.createWorkspace(user.id, body.name, body.url)
    }

    @Get(':url/members')
    getAllMemberListFromWrokspace() {

    }

    @Post(':url/members')
    inviteMemberToWorkspace(@Body() data) {

    }

    @Delete(':url/members/:id')
    kickMemberFromWorkspace() {

    }

    @Get(':url/members/:id')
    getMemberInfoInWorkspace() {

    }
}

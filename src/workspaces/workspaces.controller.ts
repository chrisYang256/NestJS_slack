import { Body, Controller, Delete, Get, Post } from '@nestjs/common';

@Controller('api/workspaces')
export class WorkspacesController {
    @Get()
    getMyWorkspaces() {

    }

    @Post()
    createWorkspaces() {

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

import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { JoinRequestDto } from './dto/join.request.dto';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}

    @Get()
    getUsers(@Req() req) { // 내 정보
        return req.user
    }

    @Post()
    postUsers(@Body() data: JoinRequestDto) { // data가 아니라 body로 해도 되고 자유.
        this.usersService.postUsers(data.email, data.nickname, data.password);
    }

    @Post('logIn')
    logIn(@Req() req ) {
        return req.user
    }

    @Post('logOut')
    logOut(@Req() req) {
        req.logOut();
    }
}

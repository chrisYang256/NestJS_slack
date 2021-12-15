import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/user.decorator';
import { UndefindToNullInterceptor } from 'src/common/interceptors/undefinedToNull.interceptor';
import { JoinRequestDto } from './dto/join.request.dto';
import { UserWithIdDto } from './dto/user.response.dto';
import { UsersService } from './users.service';

@UseInterceptors(UndefindToNullInterceptor) // 개별 라우터에 붙이면 각각 적용됨.
@ApiTags('USER')
@Controller('api/users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}
    
    @ApiOkResponse({
        description: 'response 성공',
        type: UserWithIdDto
    })
    @ApiOperation({ summary: '내 정보 조회' }) // swagger decorator
    @Get()
    getUsers(@GetUser() user) {
        return user;
    }

    @ApiOperation({ summary: '회원가입' })
    @Post()
    signIn(@Body() data: JoinRequestDto) { // data가 아니라 body로 해도 되고 자유.
        this.usersService.postUsers(data.email, data.nickname, data.password);
    }

    @ApiOkResponse({
        description: 'response 성공',
        type: UserWithIdDto
    })
    @ApiOperation({ summary: '로그인' })
    @UseGuards()
    @Post('logIn')
    logIn(@GetUser() user ) {
        return user;
    }

    @ApiOperation({ summary: '로그아웃'})
    @Post('logOut')
    logOut(@Req() req, @Res() res) {
        req.logOut();
        res.clearCookie('connect.sid', { httpOnly: true });
        res.send('ok');
    }
}

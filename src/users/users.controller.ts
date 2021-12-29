import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard copy';
import { GetUser } from '../common/decorator/get-user.decorator';
import { UndefindToNullInterceptor } from 'src/common/interceptors/undefinedToNull.interceptor';
import { JoinRequestDto } from './dto/join.request.dto';
import { UserWithIdDto } from './dto/user.response.dto';
import { UsersService } from './users.service';
import { Users } from 'src/entities/Users';

@UseInterceptors(UndefindToNullInterceptor) // 개별 라우터에 붙이면 각각 적용됨.
@ApiTags('USER')
@Controller('api/users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}
    
    @ApiOkResponse({ description: 'response 성공', type: UserWithIdDto })
    @ApiOperation({ summary: '내 정보 조회' }) // swagger decorator
    @Get()
    @ApiCookieAuth('connect.sid')
    getUsers(@GetUser() user) {
        return user || false; // login 안했는데 조회하면 false
    }

    @ApiOkResponse({ description: 'response 성공', type: JoinRequestDto })
    @ApiOperation({ summary: '회원가입' })
    @Post('/signin')
    @UseGuards(NotLoggedInGuard)
    async signUp(@Body() data: JoinRequestDto) { // data가 아니라 body로 해도 되고 자유.
        await this.usersService.signUp(data.email, data.nickname, data.password);
    }

    @ApiOkResponse({ description: 'response 성공', type: UserWithIdDto })
    @ApiOperation({ summary: '로그인' })
    @Post('/login')
    @UseGuards(LocalAuthGuard)
    logIn(@GetUser() user: Users ) {
        return user;
    }

    @ApiOperation({ summary: '로그아웃'})
    @Post('/logout')
    @UseGuards(LoggedInGuard)
    logOut(@Req() req, @Res() res) {
        // req.logOut();
        res.clearCookie('connect.sid', { httpOnly: true });
        return res.send('ok');
    }
}

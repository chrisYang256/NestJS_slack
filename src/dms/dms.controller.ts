import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('DMS')
@Controller('api/workspaces/:url/dms')
export class DmsController {

    @ApiParam({
        name: 'url',
        description: '워크스페이스 url',
        required: true,
        type: String
    })
    @ApiParam({
        name: 'id',
        description: '유저 id',
        required: true,
        type: Number
    })
    @ApiQuery({
        name: 'perPage',
        description: '한 번에 가져오는 갯수',
        required: true,
        type: Number
    })
    @ApiQuery({ // swagger decorator. Query는 swagger에 자동으로 연결되지 않음.
        name: 'page',
        description: '불러올 페이지',
        required: true,
        type: Number
    })
    @Get(':id/chats')
    getChet(@Query('perpage') perPage, @Query('page') page, @Param() param) { // @Query() query로 하면
        console.log(perPage, page) // query.perPage, query.page로 받으면 됨.(방법의 차이)
        console.log(param.id, param.url)
    }

    @Post(':id/chats')
    postChet(@Body() body) {

    }

}

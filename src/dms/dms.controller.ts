import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

@Controller('api/workspaces/:url/dms')
export class DmsController {
    @Get(':id/chats')
    getChet(@Query('perpage') perPage, @Query('page') page, @Param() param) { // @Query() query로 하면
        console.log(perPage, page) // query.perPage, query.page로 받으면 됨.(방법의 차이)
        console.log(param.id, param.url)
    }

    @Post(':id/chats')
    postChet(@Body() body) {

    }

}

import { ApiProperty } from "@nestjs/swagger";

export class CreateChannelDto {
    @ApiProperty({ example: '핫코리안들 모여랏!', description: '채널 이름' })
    channelName: string;
}
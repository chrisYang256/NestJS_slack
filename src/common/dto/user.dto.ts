// 파일 이름에 reqest 등을 붙이지 않은 이유는 유저 정보가 범용적으로 쓰일 것 같아서임.
// dto를 class로 만들 이유는 런타임에도 존재하여 validation모듈을 사용해 valitation기능을 하거나 swagger를 쓰기 때문.
// 안그러면 그냥 interface와 다를게 없음.

import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
    @ApiProperty({
        example: 'maxsummer256@gmail.com',
        description: '이메일',
        required: true
    }) 
    public email: string;

    @ApiProperty({
        example: '코리아핫가이',
        description: '별명',
        required: true
    }) 
    public nickname: string;

    @ApiProperty({
        example: '숫자 + 영문 + 특수문자',
        description: '비밀번호',
        required: true,
    }) 
    public password: string;
}
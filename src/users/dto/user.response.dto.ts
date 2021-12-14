import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/common/dto/user.dto";

export class UserWithIdDto extends UserDto {
    @ApiProperty({
        example: 12,
        description: '아이디',
        required: true
    })
    public id: number;
}
import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Users } from "src/entities/Users";
import { Workspaces } from "src/entities/Workspaces";

// PicType 이용 DTO
export class CreateWorkspaceDto extends PickType(Workspaces, ['name', 'url']) {}

// 기본형 DTO
// export class CreateWorkspaceDto {
    
//     @IsNotEmpty()
//     @IsString()
//     @ApiProperty({ example: '3학년 1반 모여랏', description: '워크스페이스 이름'})
//     public workspace: string;

//     @IsNotEmpty()
//     @IsString()
//     @ApiProperty({ example: 'comeone3-1', description: 'url 주소'})
//     public url: string;

// }
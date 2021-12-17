import { PickType } from "@nestjs/swagger";
import { Users } from "src/entities/Users";

// Picktype을 통해 잘 만든 Entity에 연결하면 dto를 대신할 수 있음.(@nestjs/swagger 설치 필요)
export class JoinRequestDto extends PickType(Users, [ 
    'email', 
    'password', 
    'nickname'
] as const) {}


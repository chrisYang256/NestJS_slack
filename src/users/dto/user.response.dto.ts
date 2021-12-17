import { PickType } from "@nestjs/swagger";
import { Users } from "src/entities/Users";

export class UserWithIdDto extends PickType(Users, [
    'id', 
    'nickname', 
    'email', 
    'password'
] as const) {}
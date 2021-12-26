import { PickType } from "@nestjs/swagger";
import { Users } from "src/entities/Users";

export class CreateChannelMemeberDto extends PickType(Users, ['email']) {}

import { PickType } from "@nestjs/swagger";
import { ChannelChats } from "src/entities/CannelChats";

export class PostChatDto extends PickType(ChannelChats, ['content']) {}
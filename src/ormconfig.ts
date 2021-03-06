import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from 'dotenv';
import { ChannelChats } from "./entities/ChannelChats";
import { ChannelMembers } from "./entities/ChannelMembers";
import { Channels } from "./entities/Channels";
import { DMs } from "./entities/DMs";
import { Mentions } from "./entities/Mentions";
import { Users } from "./entities/Users";
import { WorkspaceMembers } from "./entities/WorkspaceMembers";
import { Workspaces } from "./entities/Workspaces";

dotenv.config();

const config: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [ // "entities/*.js" 처럼 경로로도 가능, 다양한 repository 패턴 존재
        ChannelChats,
        ChannelMembers,
        Channels,
        DMs,
        Mentions,
        Users,
        WorkspaceMembers,
        Workspaces
    ],
    synchronize: false, // true -> 생성 -> false로 해야 데이터 안날림(기존DB삭제하고 새로 생성)
    logging: true, // 실행되는 ORM을 SQL문으로 보여줌(코드가 복잡할수록 ORM이 구린 코드를 만들 수 있기 때문에 개발할 때는 켜주는게 좋음)
    migrations: [__dirname + '/src/migrations/*.ts'],
    cli: { migrationsDir: 'src/migrations' },
    keepConnectionAlive: true, // 핫리로딩을 해줘서 서버 재시작될 때 DB연결 안끊기게 해줌.
    charset: 'utf8mb4',
    // autoLoadEntities: true, // entity import하기 귀찮으면 사용
}

export = config;
import { Channels } from "../../entities/Channels";
import { Workspaces } from "../../entities/Workspaces"; // 경로설정 주의.
import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";

export class CreateInitialData implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        await connection
            .createQueryBuilder()
            .insert()
            .into(Workspaces)
            .values({ id: 1, name: '첫 워크스페이스', url: 'slack' })
            .execute();
        await connection
            .createQueryBuilder()
            .insert()
            .into(Channels)
            .values({ id: 1, name: '첫 채널', private: false })
            .execute();
    }
}
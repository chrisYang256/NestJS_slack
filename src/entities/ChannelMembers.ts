// 중간테이블은 자동생성 되지만, 추가로 컬럼정의나 사용자 정의가 필요한 경우 생성.

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { Channels } from "./Channels";
import { Users } from "./Users";

@Index('UserId', ['UserId'], {})
@Entity({ schema: 'slack', name: 'channelmembers'})
export class ChannelMembers {
    // @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    // id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('int', { primary: true, name: 'UserId' }) // 중간테이블에는 foreign key column을 명시해줌.
    UserId: number;

    @Column('int', { primary: true, name: 'ChannelId' })
    ChannelId: number;

    @ManyToOne(() => Users, (users) => users.ChannelMembers, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
    User: Users;

    @ManyToOne(() => Channels, (channels) => channels.ChannelMembers, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn([{ name: 'ChannelId', referencedColumnName: 'id' }])
    Channel: Channels;
}
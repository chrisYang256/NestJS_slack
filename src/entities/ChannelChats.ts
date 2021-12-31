import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channels } from "./Channels";
import { Users } from "./Users";

@Index('UserId', ['UserId'], {})
@Index('ChannelId', ['ChannelId'], {})
@Entity({ schema: 'slack', name: 'channelchats' })
export class ChannelChats {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: '메시지 내용', example: '안녕하세요 반가워요!'})
    @Column('text', { name: 'content' })
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('int', { name: 'UserId', nullable: true }) // soft delete를 위한듯?1
    UserId: number | null;

    @Column('int', { name: 'ChannelId', nullable: true })
    ChannelId: number | null;

    // 서로 반대 테이블 정보를 넣으주면 됨
    @ManyToOne(() => Users, (users) => users.ChannelChats, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',  // soft delete를 위한듯?2
    })
    @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
    User: Users // user column이 생김

    @ManyToOne(() => Channels, (channels) => channels.ChannelChats, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'ChannelId', referencedColumnName: 'id' }])
    Channel: Channels;
}
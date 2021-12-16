import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channels } from "./Channels";
import { Users } from "./Users";

// @Index('UserId', ['UserId'], {})
// @Index('ChannelId', ['ChannelId'], {})
@Entity({ schema: 'slack', name: 'channelchats' })
export class ChannelChats {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

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

    @ManyToOne(() => Users, (users) => users.ChannelChats, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',  // soft delete를 위한듯?2
    })
    @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
    User: Users

    @ManyToOne(() => Channels, (channels) => channels.ChannelChats, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'ChannerId', referencedColumnName: 'id' }])
    Channel: Channels;
}
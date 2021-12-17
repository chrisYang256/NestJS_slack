import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelChats } from "./CannelChats";
import { ChannelMembers } from "./ChannelMembers";
import { Users } from "./Users";
import { Workspaces } from "./Workspaces";

// @Index('WorkspaceId', ['WorkspaceId'], {})
@Entity({ schema: 'slack', name: 'channels' })
export class Channels {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('varchar', { name: 'name', length: 30 })
    name: string;

    @Column('tinyint', { name: 'private', nullable: true, width: 1, default: () => "'0'"})
    private: boolean | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('int', { name: 'WorkspaceId', nullable: true})
    WorkspaceId: number | null;

    @OneToMany(() => ChannelMembers, (channelmembers) => channelmembers.Channel, {
        cascade: ['insert'],
    })
    ChannelMembers: ChannelMembers[];

    @OneToMany(() => ChannelChats, (channelchats) => channelchats.Channel)
    ChannelChats: ChannelChats[];

    @ManyToOne(() => Workspaces, (workspaces) => workspaces.Channels, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'WorkspaceId', referencedColumnName: 'id' }])
    Workspace: Workspaces;

    @ManyToMany(() => Users, (users) => users.Channels)
    Members: Users[];
}
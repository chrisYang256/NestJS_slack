import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channels } from "./Channels";
import { DMs } from "./DMs";
import { Mentions } from "./Mentions";
import { Users } from "./Users";
import { WorkspaceMemebers } from "./WorkspaceMembers";

// @Index('name', ['name'], { unique: true })
// @Index('url', ['url'], { unique: true })
// @Index('OwnerId', ['OwnerId'], {})
@Entity({ schema: 'slack', name: 'workspaces' })
export class Workspaces {
    @PrimaryGeneratedColumn({ type: 'int', name: 'int' })
    id: number;

    @Column('varchar', { name: 'name', length: 20 })
    name: string;

    @Column('varchar', { name: 'url', length: 100 })
    url: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @Column('int', { name: 'OwnerId', nullable: true })
    OwnerId: number | null;

    @OneToMany(() => Channels, channels => channels.Workspace)
    Channels: Channels[];

    @OneToMany(() => DMs, dms => dms.Workspace)
    DMs: DMs[];

    @OneToMany(() => Mentions, mentions => mentions.Workspace)
    Mentions: Mentions[];

    @OneToMany(() => WorkspaceMemebers, workspacemembers => workspacemembers.Workspace, {
        cascade: ['insert'],
    })
    WorkspaceMembers: WorkspaceMemebers[];

    @ManyToOne(() => Users, users => users.Workspaces, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'OwnerId', referencedColumnName: 'id' }])
    Owner: Users;

    @ManyToMany(() => Users, users => users.Workspaces)
    Members: Users[];
}
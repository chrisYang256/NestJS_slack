import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channels } from "./Channels";
import { DMs } from "./DMs";
import { Mentions } from "./Mentions";
import { Users } from "./Users";
import { WorkspaceMembers } from "./WorkspaceMembers";

@Index('name', ['name'], { unique: true })
@Index('url', ['url'], { unique: true })
@Index('OwnerId', ['OwnerId'], {})
@Entity({ schema: 'slack', name: 'workspaces' })
export class Workspaces {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '3학년 1반 모여랏', description: '워크스페이스 이름'})
    @Column('varchar', { name: 'name', length: 20 })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'comeone3-1', description: 'url 주소'})
    @Column('varchar', { name: 'url', length: 100 })
    url: string;

    @CreateDateColumn() // @Column('date', { defalut: () => 'CURRENT_TIMESTAMP'})와 같음
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

    @OneToMany(() => WorkspaceMembers, workspacemembers => workspacemembers.Workspace, {
        cascade: ['insert'],
    })
    WorkspaceMembers: WorkspaceMembers[];

    @ManyToOne(() => Users, users => users.Workspaces, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'OwnerId', referencedColumnName: 'id' }])
    Owner: Users;

    @ManyToMany(() => Users, users => users.Workspaces)
    Members: Users[];
}
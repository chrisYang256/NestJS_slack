import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelChats } from "./ChannelChats";
import { ChannelMembers } from "./ChannelMembers";
import { Channels } from "./Channels";
import { DMs } from "./DMs";
import { Mentions } from "./Mentions";
import { WorkspaceMemebers } from "./WorkspaceMembers";
import { Workspaces } from "./Workspaces";

// @Index('email', ['email'], { unique: true })
@Entity({ schema: 'slack', name: 'users' })
export class Users {
    @ApiProperty({ example: 13, description: '회원 아이디'})
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @ApiProperty({ example: 'maxsummer256@gmail.com', description: '회원 이메일'})
    @Column('varchar', { name: 'email', unique: true, length: 30 })
    email: string;

    @ApiProperty({ example: '헬로 네스트', description: '유저 별명'})
    @Column('varchar', { name: 'nickname', length: 10 })
    nickname: string;

    @ApiProperty({ example: '123abc@', description: '회원 비밀번호'})
    @Column('varchar', { name: 'password', length: 100, select: false }) // Hidden Columns : 열이 쿼리에 표시되지 않게 해줌.
    password: string;

    @CreateDateColumn() // 자동설정됨, https://typeorm.io/#/entities/special-columns
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => DMs, (dms) => dms.Sender)
    DMsS: DMs[];

    @OneToMany(() => DMs, (dms) => dms.Receiver)
    DMsR: DMs[];

    @OneToMany(() => Mentions, (mentions) => mentions.Sender)
    MentionsS: Mentions[];

    @OneToMany(() => Mentions, (mentions) => mentions.Receiver)
    MentionsR: Mentions[];

    @OneToMany(() => Workspaces, (workspaces) => workspaces.Owner)
    OwnedWorkspaces: Workspaces[];

    @OneToMany(() => ChannelChats, (channnelchants) => channnelchants.User)
    ChannelChats: ChannelChats[];

    @OneToMany(() => ChannelMembers, (channelmembers) => channelmembers.User)
    ChannelMembers: ChannelMembers[];

    @OneToMany(() => WorkspaceMemebers, (workspacemembers) => workspacemembers.User)
    WorkspaceMembers: WorkspaceMemebers[];

    @ManyToMany(() => Channels, (channels) => channels.Members)
    @JoinTable({
        name: 'channermembers',
        joinColumn: {
            name: 'UserId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'ChannelId',
            referencedColumnName: 'id'
        },
    })
    Channels: Channels[];

    @ManyToMany(() => Workspaces, (workspaces) => workspaces.Members)
    @JoinTable({
        name: 'workspacesmembers',
        joinColumn: {
            name: 'UserId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'WorkspaceId',
            referencedColumnName: 'id'
        },
    })
    Workspaces: Workspaces[];
}
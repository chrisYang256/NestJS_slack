// !! 언뜻 중간테이블인것 같지만 다른 테이블들에서도 참조하는 Primary key를 가진 하나의 테이블임을 인지하도록

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./Users";
import { Workspaces } from "./Workspaces";

@Index('WorkspaceId', ['WorkspaceId'], {})
@Index('SenderId', ['SenderId'], {})
@Index('ReceiverId', ['ReceiverId'], {})
@Entity({ schema: 'slack', name: 'mentions' })
export class Mentions {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('enum', { name: 'category', enum: ['chat', 'dm', 'system'] }) // 기억하기
    type: 'chat' | 'dm' | 'system';

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
    
    @Column('int', { name: 'ChatId', nullable: true }) 
    ChatId: number | null; // ChatId가 삭제되어도 삭제되지 않도록 하기 위한듯?, onDelete: 'SET NULL'과 연계되는가?

    @Column('int', { name: 'WorkspaceId', nullable: true })
    WorkspaceId: number | null;

    @Column('int', { name: 'SenderId', nullable: true })
    SenderId: number | null;

    @Column('int', { name: 'ReceiverId', nullable: true })
    ReceiverId: number | null;

    @ManyToOne(() => Workspaces, workspace => workspace.Mentions, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'WorkspaceId', referencedColumnName: 'id' }])
    Workspace: Workspaces;

    @ManyToOne(() => Users, (users) => users.MentionsS, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'SenderId', referencedColumnName: 'id' }])
    Sender: Users;

    @ManyToOne(() => Users, (users) => users.MentionsR, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'ReceiverId', referencedColumnName: 'id' }])
    Receiver: Users;
}
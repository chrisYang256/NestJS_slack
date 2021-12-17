// 중간 테이블

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { Users } from "./Users";
import { Workspaces } from "./Workspaces";

// @Index('UserId', ['UserId'], {})
@Entity({ schema: 'slack', name: 'workspacemembers' })
export class WorkspaceMemebers {
    // @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    // id: number;

    @Column('datetime', { name: 'loggedInAt', nullable: true })
    loggedInAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('int', { name: 'WorkspaceId', primary: true })
    WorkspaceId: number;

    @Column('int', { name: 'UserId', primary: true })
    UserId: number;

    @ManyToOne(() => Users, (users) => users.WorkspaceMembers, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'UserId', referencedColumnName: 'id' })
    User: Users

    @ManyToOne(() => Workspaces, workspaces => workspaces.WorkspaceMembers, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'WorkspaceId', referencedColumnName: 'id' })
    Workspace: Workspaces;
}
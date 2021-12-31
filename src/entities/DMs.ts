import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./Users";
import { Workspaces } from "./Workspaces";

@Index('WorkspaceId', ['WorkspaceId'], {})
@Index('Dms_senderId', ['SenderId'], {})
@Index('Dms_receiverId', ['ReceiverId'], {})
@Entity({ schema: 'slack', name: 'dms' })
export class DMs {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('text', { name: 'content'})
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('int', { name: 'SenderId', nullable: true })
    SenderId: number | null;

    @Column('int', { name: 'ReceiveId', nullable: true })
    ReceiverId: number | null;

    @Column('int', { name: 'WorkspaceId', nullable: true })
    WorkspaceId: number | null;

    @ManyToOne(() => Users, (users) => users.DMsS, {
        onUpdate: 'CASCADE', // primary값이 변경되면 reference값이 같이 변경되도록
        onDelete: 'SET NULL', // 유저가 삭제되면 reference값(foreign key)가 null이 되고 삭제되지 않도록
    })
    @JoinColumn([{ name: 'SenderId', referencedColumnName: 'id' }])
    Sender: Users;

    @ManyToOne(() => Users, (users) => users.DMsR, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'ReceiverId', referencedColumnName: 'id' }])
    Receiver: Users;

    @ManyToOne(() => Workspaces, workspaces => workspaces.DMs, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn([{ name: 'WorkspaceId', referencedColumnName: 'id' }])
    Workspace: Workspaces;
}
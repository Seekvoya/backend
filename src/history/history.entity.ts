import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { OperationType } from './operation-type.enum';
import { User } from 'src/auth/users.entity'; 

@Entity()
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum',
    enum: OperationType,
    default: OperationType.REPLENISHMENT
  })
  type: OperationType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  frozen: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.histories)
  user: User;
}
  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/auth/users.entity'; 

@Entity()
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  bank: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  holder: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment: string;

  @Column({
    type: 'enum',
    enum: ['Активный', 'Неактивный'],
    default: 'Активный',
  })
  status: 'Активный' | 'Неактивный';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.banks)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: number;
}
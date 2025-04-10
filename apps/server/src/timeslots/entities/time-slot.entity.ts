import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Office } from '../../offices/entities/office.entity';

@Entity({ name: 'time_slots' })
@Index(['officeId', 'startTime', 'endTime'], { unique: true })
export class TimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Office, (office) => office.timeSlots, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'officeId' })
  office: Office;

  @Column({ type: 'uuid' })
  officeId: string;

  @Column({ type: 'int', nullable: true, comment: 'Sequence number of the time slot. Example: 1' })
  sequence: number;

  @Column({ type: 'time', nullable: false, comment: 'Start time of the time slot. Example: 14:00:00' })
  startTime: Date;

  @Column({ type: 'time', nullable: false, comment: 'End time of the time slot. Example: 15:00:00' })
  endTime: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
  updatedAt: Date;
}

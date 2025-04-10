import { DayOfWeek } from 'src/common/enums/day-of-week.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TimeSlot } from '../../timeslots/entities/time-slot.entity';

@Entity({ name: 'offices' })
export class Office {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'time', nullable: false, comment: 'General workday start time. Example: 14:00:00' })
  workStartTime: Date;

  @Column({ type: 'time', nullable: false, comment: 'General workday end time. Example: 22:00:00' })
  workEndTime: Date;

  @Column({ type: 'enum', enum: DayOfWeek, array: true, nullable: false, comment: 'Days of the week when the office is open. Example: [1, 2, 3, 4, 5]' })
  workingDays: DayOfWeek[];

  @OneToMany(() => TimeSlot, (timeSlot) => timeSlot.office)
  timeSlots: TimeSlot[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
  updatedAt: Date;
}

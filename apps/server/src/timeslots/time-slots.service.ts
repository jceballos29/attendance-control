import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from 'src/offices/entities/office.entity'; // Asegúrate que la ruta sea correcta
import { Repository } from 'typeorm';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { TimeSlot } from './entities/time-slot.entity';

@Injectable()
export class TimeSlotsService {
  private readonly logger = new Logger(TimeSlotsService.name);

  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
  ) {}

  /**
   * Obtiene y valida la existencia de un Office por su ID.
   * @throws {NotFoundException} Si el Office no existe.
   */
  private async getAndValidateOffice(officeId: string): Promise<Office> {
    const office = await this.officeRepository.findOneBy({ id: officeId });
    if (!office) {
      this.logger.warn(
        `Intento de operación en TimeSlot para Office inexistente: ${officeId}`,
      );
      throw new NotFoundException(
        `Consultorio con ID "${officeId}" no encontrado.`,
      );
    }
    return office;
  }

  /**
   * Valida que una nueva franja horaria no se superponga con existentes para la misma oficina.
   * @param excludeSlotId - ID del slot a excluir de la comparación (para actualizaciones).
   * @throws {ConflictException} Si se detecta superposición.
   */
  private async validateNoOverlap(
    officeId: string,
    startTime: string,
    endTime: string,
    excludeSlotId?: string,
  ): Promise<void> {
    this.logger.debug(
      `Validando superposición para Office ${officeId}, Slot ${startTime}-${endTime}, Excluyendo ${excludeSlotId || 'ninguno'}`,
    );

    const queryBuilder = this.timeSlotRepository
      .createQueryBuilder('slot')
      .where('slot.officeId = :officeId', { officeId })
      // Condición de superposición: (StartA < EndB) AND (EndA > StartB)
      .andWhere('slot.startTime < :endTime', { endTime })
      .andWhere('slot.endTime > :startTime', { startTime });

    if (excludeSlotId) {
      queryBuilder.andWhere('slot.id != :excludeSlotId', { excludeSlotId });
    }

    const overlapExists = await queryBuilder.getExists();

    if (overlapExists) {
      this.logger.warn(
        `Conflicto de superposición detectado para Office ${officeId}, Slot ${startTime}-${endTime}`,
      );
      throw new ConflictException(
        `La franja horaria ${startTime} - ${endTime} se superpone con una existente para este consultorio.`,
      );
    }
    this.logger.debug(
      `No se encontró superposición para ${startTime}-${endTime}`,
    );
  }

  /**
   * Valida que una franja horaria esté dentro del horario laboral definido para el Office.
   * Asume que los parámetros de Office son Date | null y los de Slot son string 'HH:MM:SS'.
   * @throws {ConflictException} Si el slot está fuera del horario laboral.
   */
  private validateSlotWithinOfficeHours(
    officeWorkStartTimeDate: string,
    officeWorkEndTimeDate: string,
    slotStartTime: string,
    slotEndTime: string,
  ): void {

    const isStartValid = slotStartTime >= officeWorkStartTimeDate;
    const isEndValid = slotEndTime <= officeWorkEndTimeDate;

    if (!isStartValid) {
      this.logger.warn(
        `Conflicto Horario: Inicio slot (${slotStartTime}) < Inicio oficina (${officeWorkStartTimeDate})`,
      );
      throw new ConflictException(
        `La hora de inicio (${slotStartTime}) no puede ser anterior al inicio laboral (${officeWorkStartTimeDate}).`,
      );
    }
    if (!isEndValid) {
      this.logger.warn(
        `Conflicto Horario: Fin slot (${slotEndTime}) > Fin oficina (${officeWorkEndTimeDate})`,
      );
      throw new ConflictException(
        `La hora de fin (${slotEndTime}) no puede ser posterior al fin laboral (${officeWorkEndTimeDate}).`,
      );
    }

    // El DTO ya valida start < end, esta comprobación es redundante aquí.
    // if (slotStartTime >= slotEndTime) { ... }

    this.logger.debug(
      `Slot ${slotStartTime}-${slotEndTime} validado dentro de ${officeWorkStartTimeDate}-${officeWorkEndTimeDate}.`,
    );
  }

  // --- Métodos Públicos ---

  async create(
    officeId: string,
    createTimeSlotDto: CreateTimeSlotDto,
  ): Promise<TimeSlot> {
    // Asumimos que DTO ya validó startTime < endTime
    const office = await this.getAndValidateOffice(officeId);

    // Validar contra horario de oficina
    // Nota: Asegúrate que office.workStartTime/EndTime sean Date|null si eso espera la función
    this.validateSlotWithinOfficeHours(
      office.workStartTime.toString(), // Castear si el tipo de entidad es string pero la función espera Date
      office.workEndTime.toString(), // Castear si el tipo de entidad es string pero la función espera Date
      createTimeSlotDto.startTime,
      createTimeSlotDto.endTime,
    );

    // Validar superposición
    await this.validateNoOverlap(
      officeId,
      createTimeSlotDto.startTime,
      createTimeSlotDto.endTime,
    );

    const newTimeSlot = this.timeSlotRepository.create({
      ...createTimeSlotDto,
      officeId: officeId,
    });

    this.logger.log(
      `Creando TimeSlot para Office ${officeId}: ${newTimeSlot.startTime}-${newTimeSlot.endTime}`,
    );
    return this.timeSlotRepository.save(newTimeSlot);
  }

  async findAllForOffice(officeId: string): Promise<TimeSlot[]> {
    await this.getAndValidateOffice(officeId); // Solo valida existencia
    this.logger.debug(`Buscando TimeSlots para Office ${officeId}`);
    return this.timeSlotRepository.find({
      where: { officeId },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotRepository.findOneBy({ id });
    if (!timeSlot) {
      throw new NotFoundException(`TimeSlot con ID "${id}" no encontrado.`);
    }
    return timeSlot;
  }

  async update(
    id: string,
    updateTimeSlotDto: UpdateTimeSlotDto,
  ): Promise<TimeSlot> {
    // Asumimos que DTO ya validó startTime < endTime si ambos están presentes
    const timeSlot = await this.timeSlotRepository.preload({
      id: id,
      ...updateTimeSlotDto,
    });
    if (!timeSlot) {
      throw new NotFoundException(
        `TimeSlot con ID "${id}" no encontrado para actualizar.`,
      );
    }

    // Obtener oficina para validaciones
    const office = await this.getAndValidateOffice(timeSlot.officeId);

    // Validar contra horario de oficina
    // Nota: Asegúrate que office.workStartTime/EndTime sean Date|null si eso espera la función
    this.validateSlotWithinOfficeHours(
      office.workStartTime.toString(), // Castear si el tipo de entidad es string pero la función espera Date
      office.workEndTime.toString(), // Castear si el tipo de entidad es string pero la función espera Date
      timeSlot.startTime.toString(),
      timeSlot.endTime.toString(),
    );

    // Validar superposición
    await this.validateNoOverlap(
      timeSlot.officeId,
      timeSlot.startTime.toString(),
      timeSlot.endTime.toString(),
      id, // Excluir el propio slot
    );

    this.logger.log(
      `Actualizando TimeSlot ${id} a ${timeSlot.startTime.toString()}-${timeSlot.endTime.toString()}`,
    );
    // Guardar la entidad TimeSlot actualizada (TypeORM maneja el update)
    return this.timeSlotRepository.save(timeSlot);
  }

  async remove(id: string): Promise<void> {
    // findOne ya lanza NotFoundException si no existe
    const timeSlot = await this.findOne(id);
    const result = await this.timeSlotRepository.delete(timeSlot.id); // Usa el ID encontrado por seguridad
    if (result.affected === 0) {
      // Esto no debería ocurrir si findOne tuvo éxito, pero es un doble check
      throw new NotFoundException(
        `No se pudo eliminar TimeSlot con ID "${id}" (affected 0).`,
      );
    }
    this.logger.log(`TimeSlot con ID "${id}" eliminado.`);
  }

  async removeAllForOffice(
    officeId: string,
  ): Promise<{ deletedCount: number }> {
    await this.getAndValidateOffice(officeId);
    const result = await this.timeSlotRepository.delete({ officeId: officeId });
    const deletedCount = result.affected ?? 0;
    this.logger.log(
      `Eliminados ${deletedCount} TimeSlots para Office ${officeId}`,
    );
    return { deletedCount };
  }
}

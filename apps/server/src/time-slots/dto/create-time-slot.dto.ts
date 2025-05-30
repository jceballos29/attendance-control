import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsEndTimeAfterStartTime } from 'src/common/validators/is-end-time-after-start-time.validator';
export class CreateTimeSlotDto {
  @IsNotEmpty({ message: 'La hora de inicio no puede estar vacía.' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, {
    message: 'La hora de inicio debe tener el formato HH:MM o HH:MM:SS.',
  })
  startTime: string;

  @IsNotEmpty({ message: 'La hora de fin no puede estar vacía.' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, {
    message: 'La hora de fin debe tener el formato HH:MM o HH:MM:SS.',
  })
  @IsEndTimeAfterStartTime('startTime', { // <-- ¡Aquí!
    message: 'La hora de fin debe ser posterior a la hora de inicio.' // Mensaje personalizado opcional
})
  endTime: string;


}
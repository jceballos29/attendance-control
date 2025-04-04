// src/offices/dto/create-office.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    IsArray,
    ArrayMinSize,
    ValidateNested, // Para validar arrays de objetos
    IsEnum,
    Matches,
  } from 'class-validator';
  import { Type } from 'class-transformer'; // Para transformar el array anidado
  import { CreateTimeSlotDto } from './create-time-slot.dto';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';
  
  export class CreateOfficeDto {
    @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, {
      message: 'La hora de inicio laboral debe tener el formato HH:MM o HH:MM:SS.',
    })
    workStartTime?: string;
  
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, {
      message: 'La hora de fin laboral debe tener el formato HH:MM o HH:MM:SS.',
    })
    workEndTime?: string;
  
    @IsArray()
    @IsEnum(DayOfWeek, { each: true, message: 'Cada día laborable debe ser un valor válido de DayOfWeek.' })
    workingDays?: DayOfWeek[];
  
    @IsOptional() // Hacemos opcional el array de timeSlots al crear
    @IsArray({ message: 'Las franjas horarias deben ser un array.' })
    @ValidateNested({ each: true }) // Valida cada objeto dentro del array
    @Type(() => CreateTimeSlotDto) // Especifica el tipo de objeto dentro del array
    timeSlots?: CreateTimeSlotDto[];
  }
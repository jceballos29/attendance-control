import { z } from "zod";
import { DayOfWeek } from "./types";

const timeSlotSchema = z
  .object({
    startTime: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/,
        "Formato HH:MM o HH:MM:SS requerido"
      ),
    endTime: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/,
        "Formato HH:MM o HH:MM:SS requerido"
      ),
  })
  .refine(data => data.endTime > data.startTime, {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["endTime"],
});

export const createOfficeSchema = z
  .object({
    name: z.string().min(1, { message: "El nombre es obligatorio." }).max(255),
    workStartTime: z
    .string() // Ya no es opcional
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/,
      "La hora de inicio laboral es obligatoria"
    ),
    workEndTime: z
    .string() 
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/,
      "La hora de fin laboral es obligatoria"
    ),

    workingDays: z.array(z.nativeEnum(DayOfWeek)).optional(),

    timeSlots: z.array(timeSlotSchema).optional(),
  })
  .refine(
    (data) => {
      return data.workEndTime > data.workStartTime;
    },
    {
      message:
        "La hora de fin laboral debe ser posterior a la hora de inicio laboral",
      path: ["workEndTime"],
    }
  );

export type CreateOfficeInput = z.infer<typeof createOfficeSchema>;

import { type ColumnDef } from "@tanstack/react-table";
import type { Office, DayOfWeek } from "../types";
import { daysOfWeekOptions } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, EllipsisVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimeAmPm } from "@/lib/utils";

const getDayLabel = (dayValue: DayOfWeek): string => {
  const option = daysOfWeekOptions.find((opt) => opt.value === dayValue);
  return option?.text || dayValue;
};

export const columns: ColumnDef<Office>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Seleccionar ${row.getValue("name")}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          style={{ paddingInline: 0 }}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  // {
  //   id: "workHours",
  //   header: "Horario Laboral",
  //   accessorFn: (row) =>
  //     `${row.workStartTime || "N/A"} - ${row.workEndTime || "N/A"}`,
  // },
  {
    accessorKey: "workStartTime",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          style={{ paddingInline: 0 }}
        >
          Hora Inicio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startTime = row.getValue("workStartTime") as string | null;
      return formatTimeAmPm(startTime);
    },
    enableHiding: true,
  },
  {
    accessorKey: "workEndTime",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          style={{ paddingInline: 0 }}
        >
          Hora Fin
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startTime = row.getValue("workEndTime") as string | null;
      return formatTimeAmPm(startTime);
    },
  },
  {
    accessorKey: "workingDays",
    header: "Días Laborales",
    cell: ({ row }) => {
      const days = row.getValue("workingDays") as DayOfWeek[] | null;
      if (!days || days.length === 0) {
        return (
          <span className="text-muted-foreground italic">No especificados</span>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {days
            .sort(
              (a, b) =>
                daysOfWeekOptions.findIndex((opt) => opt.value === a) -
                daysOfWeekOptions.findIndex((opt) => opt.value === b)
            )
            .map((day) => (
              <Badge key={day} variant="secondary">
                {getDayLabel(day)}
              </Badge>
            ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "timeSlots",
    header: "Franjas",
    cell: ({ row }) => {
      const slots = row.getValue("timeSlots") as { id: string }[];
      return <div className="text-left">{slots?.length ?? 0}</div>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    size: 80,
    cell: ({ row }) => {
      const office = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(office.id)}
            >
              Copiar ID Consultorio
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* TODO: Implementar */}
            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
            {/* TODO: Implementar */}
            <DropdownMenuItem>Editar</DropdownMenuItem>
            {/* TODO: Implementar */}
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

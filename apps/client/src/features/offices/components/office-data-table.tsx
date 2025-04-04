import { DataTablePagination } from "@/components/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table";
import { Check, XIcon } from "lucide-react";
import React from "react";
import { DayOfWeek, daysOfWeekOptions } from "../types";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // --- Nuevas Props ---
  state: {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    pagination: PaginationState;
    globalFilter: string; // Búsqueda global (no debounced)
  };
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
  onColumnFiltersChange: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  >;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  setGlobalFilter: (value: string) => void; // Para actualizar búsqueda global
  pageCount: number; // Total de páginas desde el backend
  // --------------------
}

function OfficeDataTable<TData, TValue>({
  columns,
  data,
  state,
  onSortingChange,
  onColumnFiltersChange,
  onPaginationChange,
  setGlobalFilter,
  pageCount,
}: DataTableProps<TData, TValue>) {
  const [workHoursFilter, setWorkHoursFilter] = React.useState({
    from: "",
    to: "",
  });
  const [workingDaysFilter, setWorkingDaysFilter] = React.useState<DayOfWeek[]>(
    []
  );

  React.useEffect(() => {
    // Crear/Actualizar filtro para workHours
    onColumnFiltersChange((prev) => {
      const existing = prev.find((f) => f.id === "workHours");
      const newValue = {
        from: workHoursFilter.from || undefined,
        to: workHoursFilter.to || undefined,
      };
      // Solo actualizar si el valor realmente cambió para evitar bucles
      if (JSON.stringify(existing?.value) === JSON.stringify(newValue))
        return prev;

      const otherFilters = prev.filter((f) => f.id !== "workHours");
      // Solo añadir si hay 'from' o 'to'
      if (newValue.from || newValue.to) {
        return [...otherFilters, { id: "workHours", value: newValue }];
      }
      return otherFilters; // Eliminar si 'from' y 'to' están vacíos
    });
  }, [workHoursFilter, onColumnFiltersChange]);

  React.useEffect(() => {
    // Crear/Actualizar filtro para workingDays
    onColumnFiltersChange((prev) => {
      const existing = prev.find((f) => f.id === "workingDays");
      // Solo actualizar si el valor realmente cambió
      if (JSON.stringify(existing?.value) === JSON.stringify(workingDaysFilter))
        return prev;

      const otherFilters = prev.filter((f) => f.id !== "workingDays");
      if (workingDaysFilter.length > 0) {
        return [
          ...otherFilters,
          { id: "workingDays", value: workingDaysFilter },
        ];
      }
      return otherFilters; // Eliminar si no hay días seleccionados
    });
  }, [workingDaysFilter, onColumnFiltersChange]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      pagination: state.pagination,
      columnVisibility,
    },
    onSortingChange: onSortingChange,
    onColumnFiltersChange: onColumnFiltersChange,
    onPaginationChange: onPaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative w-xs w-max-xs">
          <Input
            placeholder="Buscar..."
            value={state.globalFilter ?? ""} // Usar el estado globalFilter de props
            onChange={(event) => setGlobalFilter(event.target.value)} // Llamar a la función de props
            className="w-full h-9 pr-8"
          />
          {!!state.globalFilter && (
            <Button
              type="button" // Importante para no enviar formularios si existe alguno
              variant="ghost" // Sin fondo, sutil
              size="icon" // Tamaño pequeño para icono
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground" // Posición y estilo
              onClick={() => setGlobalFilter("")} // Llama al actualizador del padre con string vacío
              aria-label="Limpiar búsqueda" // Para accesibilidad
            >
              <XIcon className="h-4 w-4" /> {/* Icono X */}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Horario
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4">
              <p className="text-sm font-medium">Filtrar por Hora Inicio</p>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="time-from" className="text-xs">
                  Desde:
                </Label>
                <Input
                  id="time-from"
                  type="time"
                  className="h-8 text-xs"
                  value={workHoursFilter.from}
                  onChange={(e) =>
                    setWorkHoursFilter((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                />
                <Label htmlFor="time-to" className="text-xs">
                  Hasta:
                </Label>
                <Input
                  id="time-to"
                  type="time"
                  className="h-8 text-xs"
                  value={workHoursFilter.to}
                  onChange={(e) =>
                    setWorkHoursFilter((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setWorkHoursFilter({ from: "", to: "" })}
              >
                Limpiar
              </Button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-dashed">
                Días Laborales
                {workingDaysFilter.length > 0 && (
                  <>
                    {/* <CommandSeparator className="mx-2 h-4" /> */}
                    <span className="mx-2 border-l border-border h-4"></span>
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal lg:hidden"
                    >
                      {workingDaysFilter?.length}
                    </Badge>
                    <div className="hidden space-x-1 lg:flex">
                      {workingDaysFilter?.length > 2 ? (
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {workingDaysFilter?.length} sel.
                        </Badge>
                      ) : (
                        daysOfWeekOptions
                          .filter((option) =>
                            workingDaysFilter.includes(option.value)
                          )
                          .map((option) => (
                            <Badge
                              variant="secondary"
                              key={option.value}
                              className="rounded-sm px-1 font-normal"
                            >
                              {option.text}
                            </Badge>
                          ))
                      )}
                    </div>
                  </>
                )}
                {/* <SelectedDaysBadgeDisplay selectedDays={workingDaysFilter} /> */}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar día..." />
                <CommandList>
                  <CommandEmpty>No encontrado.</CommandEmpty>
                  <CommandGroup>
                    {daysOfWeekOptions.map((option) => {
                      const isSelected = workingDaysFilter.includes(
                        option.value
                      );
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            setTimeout(() => {
                              // <--- Verifica que este setTimeout esté aquí
                              if (isSelected) {
                                setWorkingDaysFilter((prev) =>
                                  prev.filter((v) => v !== option.value)
                                );
                              } else {
                                setWorkingDaysFilter((prev) => [
                                  ...prev,
                                  option.value,
                                ]);
                              }
                            }, 0); // Retraso 0
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          <span>{option.text}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {workingDaysFilter.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => setWorkingDaysFilter([])}
                          className="justify-center text-center"
                        >
                          Limpiar filtros
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.id === "actions" && "w-8")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

export default OfficeDataTable;

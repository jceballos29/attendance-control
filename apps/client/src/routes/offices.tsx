import { getOffices, GetOfficesParams } from "@/features/offices/api";
import { columns } from "@/features/offices/components/columns";
import CreateOfficeDialog from "@/features/offices/components/create-office-dialog";
import OfficeDataTable from "@/features/offices/components/office-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import * as React from "react";

export const Route = createFileRoute("/offices")({
  component: RouteComponent,
});

const initialPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};


function RouteComponent() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>(initialPagination);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const apiParams = React.useMemo((): GetOfficesParams => {
    const params: GetOfficesParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    };
    if (debouncedGlobalFilter) {
        params.search = debouncedGlobalFilter;
    }
    if (sorting.length > 0) {
        params.sortBy = sorting[0].id;
        params.sortOrder = sorting[0].desc ? 'DESC' : 'ASC';
    }
    const workStartTimeFilter = columnFilters.find(f => f.id === 'workHours'); // Asumiendo que filtramos por la columna 'workHours'
    if (workStartTimeFilter && typeof workStartTimeFilter.value === 'object' && workStartTimeFilter.value !== null) {
          const { from, to } = workStartTimeFilter.value as { from?: string; to?: string };
          if (from) params.workStartTimeFrom = from;
          if (to) params.workStartTimeTo = to;
    }
     const workingDaysFilter = columnFilters.find(f => f.id === 'workingDays');
     if (workingDaysFilter && Array.isArray(workingDaysFilter.value) && workingDaysFilter.value.length > 0) {
         params.filterWorkingDays = workingDaysFilter.value.join(",");
     }
     
    return params;
}, [pagination, sorting, debouncedGlobalFilter, columnFilters]);

const query = useQuery({
    queryKey: ['offices', apiParams],
    queryFn: () => getOffices(apiParams),
    placeholderData: keepPreviousData,
  });

  const officeData = query.data?.data ?? [];
  const paginationMeta = query.data?.meta;

  const isBackgroundLoading = query.isFetching && query.isPlaceholderData;
  const isInitialLoading = query.isLoading;

  return (
    <div className="container mx-auto py-4 md:py-6">
      <header className="w-full flex justify-between items-center mb-4">
        <h3 className="font-bold text-2xl">Consultorios</h3>
        <CreateOfficeDialog />
      </header>
      <div className="w-full">
        {isInitialLoading && <div>Cargando tabla...</div>}

        {query.isError && !isInitialLoading && <div>Error al cargar datos: {(query.error as Error).message}</div>}

        {(query.isSuccess ) && (
          <OfficeDataTable
            columns={columns}
            data={officeData}
            state={{ sorting, columnFilters, pagination, globalFilter }}
            onSortingChange={setSorting}
            onColumnFiltersChange={setColumnFilters}
            onPaginationChange={setPagination}
            setGlobalFilter={setGlobalFilter}
            pageCount={paginationMeta?.totalPages ?? -1}
          />
        )}
        {isBackgroundLoading && <div className="text-sm text-muted-foreground pt-2">Actualizando...</div>}
      </div>
    </div>
  );
}

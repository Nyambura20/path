import React, { useMemo, useState } from 'react';
import DataTable from './DataTable';
import Button from './Button';

function PaginatedDataTable({
  columns,
  data,
  pageSize = 10,
  emptyMessage = 'No records available',
  ariaLabel = 'Data table',
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goToPrevious = () => setPage((prev) => Math.max(1, prev - 1));
  const goToNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  const startItem = data.length ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, data.length);

  return (
    <section aria-label={ariaLabel}>
      <DataTable columns={columns} data={pagedData} emptyMessage={emptyMessage} />

      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center" aria-live="polite">
        <p className="text-sm text-neutral-600 dark:text-[var(--bp-text-muted)]">
          Showing {startItem}-{endItem} of {data.length} records
        </p>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={goToPrevious} disabled={page === 1} aria-label="Go to previous page">
            Previous
          </Button>
          <span className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text-muted)]">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" onClick={goToNext} disabled={page === totalPages} aria-label="Go to next page">
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PaginatedDataTable;

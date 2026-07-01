import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Pagination } from "./ui";

type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
};
export function DataTable<T>({
  rows,
  columns,
  getKey,
  pageSize = 8,
}: {
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string | number;
  pageSize?: number;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    const column = columns.find((item) => item.key === sortKey);
    if (!column) return rows;
    return [...rows].sort((a, b) => {
      const av = column.sortValue?.(a) ?? String(column.render(a));
      const bv = column.sortValue?.(b) ?? String(column.render(b));
      return direction === "asc"
        ? String(av).localeCompare(String(bv), undefined, { numeric: true })
        : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });
  }, [columns, direction, rows, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="panel overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-royal-gold via-primary to-emerald-500" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 bg-royal-champagne text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 sm:px-4">
                  <button
                    className="inline-flex items-center gap-1 font-extrabold"
                    disabled={!column.sortable}
                    onClick={() => {
                      setSortKey(column.key);
                      setDirection(
                        sortKey === column.key && direction === "asc"
                          ? "desc"
                          : "asc",
                      );
                    }}
                  >
                    {column.header}
                    {column.sortable &&
                      sortKey === column.key &&
                      (direction === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border bg-white/80">
            {visible.map((row) => (
              <tr
                key={getKey(row)}
                className="transition hover:bg-royal-champagne/50"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3.5 align-middle sm:px-4">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPage={setPage}
      />
    </div>
  );
}

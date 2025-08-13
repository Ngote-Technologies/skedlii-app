import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { cn } from "../../lib/utils";

// Enhanced Table with variants
const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    variant: {
      default: "border-collapse",
      striped: "border-collapse [&_tbody_tr:nth-child(odd)]:bg-muted/25",
      bordered: "border border-border rounded-lg overflow-hidden",
      minimal: "border-collapse [&_thead]:border-none",
    },
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  stickyHeader?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, stickyHeader = false, ...props }, ref) => (
    <div
      className={cn(
        "relative w-full overflow-auto",
        stickyHeader && "max-h-[400px]"
      )}
    >
      <table
        ref={ref}
        className={cn(
          tableVariants({ variant, size }),
          stickyHeader &&
            "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-background",
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

// Enhanced TableHeader with sorting capabilities
interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  sortable?: boolean;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sortable = false, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b [&_tr]:bg-muted/50",
        sortable && "[&_th]:cursor-pointer [&_th]:select-none",
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// Enhanced TableRow with interactive states
const tableRowVariants = cva("border-b transition-colors", {
  variants: {
    variant: {
      default: "hover:bg-muted/50 data-[state=selected]:bg-muted",
      interactive:
        "hover:bg-muted/50 cursor-pointer data-[state=selected]:bg-primary/10",
      subtle: "hover:bg-muted/25",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant, selected, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        tableRowVariants({ variant }),
        selected && "data-[state=selected]",
        className
      )}
      data-state={selected ? "selected" : undefined}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// Enhanced TableHead with sorting functionality
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  align?: "left" | "center" | "right";
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      children,
      sortable,
      sortDirection,
      onSort,
      align = "left",
      ...props
    },
    ref
  ) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        sortable &&
          "cursor-pointer select-none hover:text-foreground transition-colors",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          align === "center" && "justify-center",
          align === "right" && "justify-end"
        )}
      >
        {children}
        {sortable && (
          <div className="flex flex-col">
            {sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : sortDirection === "desc" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </div>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = "TableHead";

// Enhanced TableCell with alignment options
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  variant?: "default" | "numeric" | "status";
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = "left", variant = "default", ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        variant === "numeric" && "font-mono tabular-nums",
        variant === "status" && "font-medium",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Enhanced DataTable component with sorting, filtering, and pagination
interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  variant?: "default" | "striped" | "bordered" | "minimal";
  size?: "sm" | "default" | "lg";
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  stickyHeader?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  variant = "default",
  size = "default",
  searchable = false,
  searchPlaceholder = "Search...",
  sortable = true,
  stickyHeader = false,
  emptyMessage = "No data available",
  loading = false,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = item[column.key];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && <div className="h-10 bg-muted rounded animate-pulse" />}
        <div className="border rounded-lg">
          <div className="h-12 bg-muted/50 rounded-t-lg animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      <Table variant={variant} size={size} stickyHeader={stickyHeader}>
        <TableHeader>
          <TableRow variant="none">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                sortable={sortable && column.sortable !== false}
                sortDirection={
                  sortConfig?.key === column.key ? sortConfig.direction : null
                }
                onSort={() => handleSort(column.key)}
                align={column.align}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow variant="none">
              <TableCell
                colSpan={columns.length}
                align="center"
                className="py-8"
              >
                <div className="text-muted-foreground">{emptyMessage}</div>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item, index) => (
              <TableRow
                key={index}
                variant={onRowClick ? "interactive" : "default"}
                onClick={onRowClick ? () => onRowClick(item, index) : undefined}
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    align={column.align}
                    variant={
                      column.key === "amount" ||
                      column.key === "price" ||
                      column.key === "total"
                        ? "numeric"
                        : "default"
                    }
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  tableVariants,
  tableRowVariants,
  type TableProps,
  type TableHeaderProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type DataTableProps,
  type Column,
};

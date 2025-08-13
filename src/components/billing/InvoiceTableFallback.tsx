import { Badge, StatusBadge } from "../ui/badge";
import { Button } from "../ui/button";
import { DataTable, type Column } from "../ui/table";
import { ArrowDownToLine, FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  _id: string;
  createdAt: string;
  amountPaid: number;
  status: string;
  invoicePdf: string;
}

interface InvoiceTableFallbackProps {
  invoices: Invoice[];
}

export function InvoiceTableFallback({ invoices }: InvoiceTableFallbackProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No invoices found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your invoice history will appear here once you make your first
          payment.
        </p>
      </div>
    );
  }

  // Define columns for the enhanced DataTable
  const columns: Column<Invoice>[] = [
    {
      key: "_id",
      header: "Invoice ID",
      sortable: false,
      width: "30%",
      render: (value) => (
        <div className="font-mono text-sm font-medium text-primary">
          {String(value)}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      align: "left",
      render: (value) => (
        <div className="text-sm font-medium text-foreground">
          {format(new Date(String(value)), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      key: "amountPaid",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (value) => (
        <span className="text-sm font-semibold text-foreground">
          ${Number(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      align: "center",
      render: (value) => (
        <StatusBadge
          status={
            String(value) === "paid"
              ? "paid"
              : String(value) === "failed"
              ? "failed"
              : "pending"
          }
          size="sm"
        />
      ),
    },
    {
      key: "invoicePdf",
      header: "Action",
      sortable: false,
      align: "right",
      render: (value, invoice) => (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hover:bg-primary/10 hover:text-primary transition-colors group/btn"
        >
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ArrowDownToLine className="h-4 w-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
            Download
          </a>
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Desktop/Tablet Enhanced DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={invoices}
          columns={columns}
          variant="bordered"
          searchable={true}
          searchPlaceholder="Search invoices..."
          sortable={true}
          emptyMessage="No invoices match your search criteria"
          className="rounded-xl"
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {invoices.map((invoice, index) => (
          <div
            key={invoice._id}
            className="bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/20 px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Invoice ID
                </span>
              </div>
              <div className="font-mono text-sm font-semibold text-primary break-all bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                {invoice._id}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Date
                    </div>
                    <div className="font-semibold text-foreground text-sm">
                      {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Amount
                    </div>
                    <div className="font-bold text-foreground text-sm">
                      ${invoice.amountPaid.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Action Row */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      invoice.status === "paid"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <StatusBadge
                    status={invoice.status === "paid" ? "paid" : "pending"}
                    size="sm"
                  />
                </div>

                <Button
                  asChild
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 group/btn"
                >
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ArrowDownToLine className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
                    <span className="font-medium">Download</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

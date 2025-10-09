import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Calendar,
  DollarSign,
  FileText,
  Download,
  Receipt,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id?: string;
  number?: string;
  created?: string; // ISO string from API
  created_epoch?: number; // seconds (optional)
  amount_paid?: number;
  amount_due?: number;
  currency?: string;
  status: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceGrid({ invoices }: InvoiceTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent-500/10 flex items-center justify-center border border-primary/20">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-accent-500 rounded-full flex items-center justify-center">
            <Download className="w-3 h-3 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
          No invoices found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your invoice history will appear here once you make your first
          payment.
        </p>
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary font-medium">💡 Pro Tip</p>
          <p className="text-xs text-muted-foreground mt-1">
            All invoices are automatically generated and can be downloaded as
            PDF files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice, index) => (
        <div
          key={invoice.id || invoice.number || index}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-background to-background/50 shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 hover:-translate-y-0.5"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Invoice ID Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Invoice ID
                  </span>
                </div>
                <div className="font-mono text-sm lg:text-base font-semibold text-primary break-all bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                  {invoice.number || invoice.id}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
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
                      {invoice.created
                        ? format(new Date(invoice.created), "MMM dd, yyyy")
                        : "—"}
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
                      {(() => {
                        const cents =
                          typeof invoice.amount_paid === "number"
                            ? invoice.amount_paid
                            : 0;
                        const currency = (invoice.currency || "usd").toUpperCase();
                        const dollars = cents / 100;
                        try {
                          return new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency,
                            maximumFractionDigits: 2,
                          }).format(dollars);
                        } catch {
                          return `$${dollars.toFixed(2)}`;
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      invoice.status === "paid"
                        ? "bg-emerald-50 dark:bg-emerald-950/50"
                        : "bg-amber-50 dark:bg-amber-950/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        invoice.status === "paid"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Status
                    </div>
                    <Badge
                      variant="secondary"
                      className={`font-medium text-xs px-2.5 py-1 ${
                        invoice.status === "paid"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method & Download Section */}
            <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
              <div className="lg:border-l lg:border-border/50 lg:pl-8 space-y-4">
                {/* Payment Method Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CreditCard className="w-3 h-3" />
                    <span>Payment Method</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="w-6 h-4 bg-gradient-to-r from-primary-500 to-primary-700 rounded-sm flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">
                      ••••
                    </span>
                  </div>
                    <span className="text-xs font-medium">•••• 4242</span>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  asChild
                  className="w-full lg:w-auto bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 group/btn"
                  size="sm"
                >
                  <a
                    href={invoice.invoice_pdf || invoice.hosted_invoice_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
                    <span className="font-medium">Download PDF</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

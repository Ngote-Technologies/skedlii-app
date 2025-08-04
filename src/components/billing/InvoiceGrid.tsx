import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowDownToLine, Calendar, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  _id: string;
  createdAt: string;
  amountPaid: number;
  status: string;
  invoicePdf: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceGrid({ invoices }: InvoiceTableProps) {
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

  return (
    <div className="space-y-3">
      {invoices.map((invoice, index) => (
        <div
          key={invoice._id}
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
                  {invoice._id}
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

            {/* Download Section */}
            <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
              <div className="lg:border-l lg:border-border/50 lg:pl-8">
                <Button
                  asChild
                  className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 group/btn"
                  size="sm"
                >
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ArrowDownToLine className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
                    <span className="font-medium">Download</span>
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

// import { Badge } from "../ui/badge";
// import { Button } from "../ui/button";
// import { ArrowDownToLine } from "lucide-react"; // Modern download icon
// import { format } from "date-fns";

// interface Invoice {
//   _id: string;
//   createdAt: string;
//   amountPaid: number;
//   status: string;
//   invoicePdf: string;
// }

// interface InvoiceTableProps {
//   invoices: Invoice[];
// }

// export function InvoiceGrid({ invoices }: InvoiceTableProps) {
//   if (!invoices || invoices.length === 0) {
//     return (
//       <div className="p-6 text-center text-muted-foreground">
//         No invoices found.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {invoices.map((invoice) => (
//         <div
//           key={invoice._id}
//           className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
//         >
//           <div className="p-4 space-y-2">
//             <div className="text-sm font-medium text-muted-foreground">
//               Invoice ID
//             </div>
//             <div className="font-semibold text-primary break-all">
//               {invoice._id}
//             </div>

//             <div className="flex flex-wrap items-center gap-4 mt-3">
//               <div>
//                 <div className="text-xs text-muted-foreground uppercase tracking-wide">
//                   Date
//                 </div>
//                 <div className="font-medium">
//                   {format(new Date(invoice.createdAt), "PPP")}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs text-muted-foreground uppercase tracking-wide">
//                   Amount
//                 </div>
//                 <div className="font-medium">${invoice.amountPaid}</div>
//               </div>
//               <div>
//                 <div className="text-xs text-muted-foreground uppercase tracking-wide">
//                   Status
//                 </div>
//                 <Badge
//                   variant="outline"
//                   className={`${
//                     invoice.status === "paid"
//                       ? "border-green-500 text-green-600"
//                       : "border-yellow-500 text-yellow-600"
//                   }`}
//                 >
//                   {invoice.status}
//                 </Badge>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 md:border-l border-border md:min-w-[150px] md:flex md:justify-center">
//             <Button asChild variant="outline" size="sm" className="rounded-md">
//               <a
//                 href={invoice.invoicePdf}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <ArrowDownToLine className="mr-2 h-4 w-4" />
//                 Download
//               </a>
//             </Button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

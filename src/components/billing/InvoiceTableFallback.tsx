import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-auto rounded-xl border border-border shadow-sm bg-background">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-gradient-to-r from-muted/80 to-muted/40">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {invoices.map((invoice, index) => (
              <tr
                key={invoice._id}
                className="group hover:bg-muted/30 transition-colors duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="font-mono text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                    {invoice._id}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">
                  {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-foreground">
                    ${invoice.amountPaid.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant="secondary"
                    className={`font-medium text-xs px-3 py-1 ${
                      invoice.status === "paid"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                    }`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary transition-colors group/btn"
                  >
                    <a
                      href={invoice.invoicePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ArrowDownToLine className="h-4 w-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
                      Download
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
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

      {/* Tablet View - Condensed Cards */}
      <div className="hidden md:block lg:hidden space-y-3">
        {invoices.map((invoice, index) => (
          <div
            key={invoice._id}
            className="bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 p-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              {/* Left Content */}
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Invoice ID
                  </div>
                  <div className="font-mono text-sm font-semibold text-primary truncate">
                    {invoice._id}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Date & Amount
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground text-sm">
                      {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                    </div>
                    <div className="font-bold text-foreground text-sm">
                      ${invoice.amountPaid.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div>
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

              {/* Right Action */}
              <div className="ml-6">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors group/btn"
                >
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ArrowDownToLine className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
                    Download
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

// import { Badge } from "../ui/badge";
// import { Button } from "../ui/button";
// import { ArrowDownToLine } from "lucide-react";
// import { format } from "date-fns";

// interface Invoice {
//   _id: string;
//   createdAt: string;
//   amountPaid: number;
//   status: string;
//   invoicePdf: string;
// }

// interface InvoiceTableFallbackProps {
//   invoices: Invoice[];
// }

// export function InvoiceTableFallback({ invoices }: InvoiceTableFallbackProps) {
//   if (!invoices || invoices.length === 0) {
//     return (
//       <div className="p-6 text-center text-muted-foreground">
//         No invoices found.
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-auto rounded-xl border border-border shadow-sm">
//       <table className="min-w-full divide-y divide-border">
//         <thead className="bg-muted/50">
//           <tr>
//             <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
//               Invoice ID
//             </th>
//             <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
//               Date
//             </th>
//             <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
//               Amount
//             </th>
//             <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
//               Status
//             </th>
//             <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
//               Action
//             </th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-border">
//           {invoices.map((invoice) => (
//             <tr key={invoice._id} className="hover:bg-muted/20">
//               <td className="px-6 py-4 text-sm font-medium text-primary">
//                 {invoice._id}
//               </td>
//               <td className="px-6 py-4 text-sm">
//                 {format(new Date(invoice.createdAt), "PPP")}
//               </td>
//               <td className="px-6 py-4 text-sm">${invoice.amountPaid}</td>
//               <td className="px-6 py-4 text-sm">
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
//               </td>
//               <td className="px-6 py-4 text-right">
//                 <Button asChild variant="ghost" size="sm">
//                   <a
//                     href={invoice.invoicePdf}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     <ArrowDownToLine className="mr-2 h-4 w-4" />
//                     Download
//                   </a>
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

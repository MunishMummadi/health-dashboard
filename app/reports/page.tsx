import { Breadcrumb } from "@/components/breadcrumb"
import { SearchBar } from "@/components/search-bar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"

export default function ReportsPage() {
  const invoices = [
    { id: "AHM5485", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5486", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5487", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5488", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5489", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5490", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5491", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5492", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
    { id: "AHM5493", date: "23/08/2022", customer: "Jacob Marcus", payable: "$100", paid: "$100", due: "$0" },
  ]

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="p-4 flex items-center justify-between border-b">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Reports" }]} />
          <div className="w-80">
            <SearchBar />
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payable Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium text-primary">#{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.payable}</TableCell>
                    <TableCell>{invoice.paid}</TableCell>
                    <TableCell>{invoice.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 flex justify-end">
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Download CSV/PDF
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


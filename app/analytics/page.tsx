import { AnalyticsCard } from "@/components/analytics-card"
import { Breadcrumb } from "@/components/breadcrumb"
import { SearchBar } from "@/components/search-bar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Users, BarChart2, CalendarIcon, Activity } from "lucide-react"
import { DateSelector } from "@/components/date-selector"

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="p-4 flex items-center justify-between border-b">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Analytics" }]} />
          <div className="w-80">
            <SearchBar />
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <AnalyticsCard title="Patient IDs" value="Names" icon={Users} color="#7a40f2" />
            <AnalyticsCard title="Readmission" value="Insights" icon={BarChart2} color="#3fbdf1" />
            <AnalyticsCard title="Admission Data" value="Year wise" icon={CalendarIcon} color="#71ddb1" />
            <AnalyticsCard title="Total Patients" value="82%" icon={Activity} color="#f80d38" />
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-semibold">Data Filter</h2>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Download CSV/PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">From Premier Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <DateSelector />
                    <DateSelector date={new Date(2023, 5, 25)} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Tomorrow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Yesterday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Analytics Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Latest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Memo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


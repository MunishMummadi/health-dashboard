import { Breadcrumb } from "@/components/breadcrumb"
import { CircularProgress } from "@/components/circular-progress"
import { PieChart } from "@/components/pie-chart"
import { SearchBar } from "@/components/search-bar"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { BarChart } from "@/components/bar-chart"
import { LineChart } from "@/components/line-chart"

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="p-4 flex items-center justify-between border-b">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
          <div className="w-80">
            <SearchBar />
          </div>
        </header>

        <main className="p-6">
          <h1 className="text-xl font-semibold mb-6">Predicting Readmissions</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First column */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-4">Readmission Risk Prediction</h3>
                <div className="flex justify-center">
                  <CircularProgress
                    percentage={87}
                    color="#7a40f2"
                    label="Risk Score"
                    trend={{ value: 12, direction: "down" }}
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <BarChart
                  title="Patient distribution: Hospital Readmission"
                  data={[
                    {
                      month: "Jan",
                      values: [
                        { value: 30, color: "#7a40f2" },
                        { value: 20, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Feb",
                      values: [
                        { value: 40, color: "#7a40f2" },
                        { value: 15, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Mar",
                      values: [
                        { value: 20, color: "#7a40f2" },
                        { value: 25, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Apr",
                      values: [
                        { value: 35, color: "#7a40f2" },
                        { value: 30, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "May",
                      values: [
                        { value: 25, color: "#7a40f2" },
                        { value: 20, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Jun",
                      values: [
                        { value: 30, color: "#7a40f2" },
                        { value: 15, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Jul",
                      values: [
                        { value: 45, color: "#7a40f2" },
                        { value: 25, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Aug",
                      values: [
                        { value: 35, color: "#7a40f2" },
                        { value: 30, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Sep",
                      values: [
                        { value: 25, color: "#7a40f2" },
                        { value: 20, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Oct",
                      values: [
                        { value: 30, color: "#7a40f2" },
                        { value: 25, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Nov",
                      values: [
                        { value: 35, color: "#7a40f2" },
                        { value: 30, color: "#71ddb1" },
                      ],
                    },
                    {
                      month: "Dec",
                      values: [
                        { value: 40, color: "#7a40f2" },
                        { value: 35, color: "#71ddb1" },
                      ],
                    },
                  ]}
                />
              </div>
            </div>

            {/* Second column */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-4">Readmissions by Time Frame</h3>
                <div className="flex justify-center">
                  <CircularProgress
                    percentage={61}
                    color="#3fbdf1"
                    label="30-Day Rate"
                    trend={{ value: 5, direction: "up" }}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-1 bg-white p-4 rounded-lg border">
                  <StatCard title="Repeat Patients" value="22" trend={{ value: 32, direction: "up" }} />
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg border">
                  <StatCard title="New Patients" value="45" trend={{ value: 20, direction: "up" }} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <LineChart
                  title="Health Care Stats"
                  subtitle="Last 6 Months"
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                    datasets: [
                      {
                        name: "Appointments",
                        color: "#3fbdf1",
                        values: [30, 40, 45, 50, 45],
                      },
                      {
                        name: "Walk-in patients",
                        color: "#f80d38",
                        values: [20, 25, 30, 20, 25],
                      },
                    ],
                  }}
                />
              </div>
            </div>

            {/* Third column */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border">
                <PieChart
                  title="Hospital Readmissions by Department"
                  data={[
                    { name: "Cardiology", value: 35, color: "#7a40f2" },
                    { name: "Neurology", value: 25, color: "#71ddb1" },
                    { name: "General Medicine", value: 30, color: "#feca57" },
                    { name: "Others", value: 10, color: "#f80d38" },
                  ]}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


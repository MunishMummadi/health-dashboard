"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { CircularProgress } from "@/components/circular-progress"
import { PieChart } from "@/components/pie-chart"
import { DonutChart } from "@/components/donut-chart"
import { SearchBar } from "@/components/search-bar"
import { StatCard } from "@/components/stat-card"
import { BarChart } from "@/components/bar-chart"
import { LineChart } from "@/components/line-chart"
import { HorizontalBarChart } from "@/components/horizontal-bar-chart"
import { StackedBarChart } from "@/components/stacked-bar-chart"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  loadPatientData,
  calculateReadmissionRate,
  getConditionDistribution,
  getDemographicDistribution,
  getLengthOfStayDistribution,
  getTotalPatients,
  getAverageMetrics,
  getAgeDistribution,
  getConditionsByAge,
  getReadmissionByCondition,
  type PatientRecord,
} from "@/lib/data-parser"

// Mock time series data since we don't have time data in our dataset
function getMockTimeSeriesData() {
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        name: "Admissions",
        color: "#3fbdf1",
        values: [30, 40, 45, 50, 45],
      },
      {
        name: "Readmissions",
        color: "#f80d38",
        values: [5, 8, 10, 7, 9],
      },
    ],
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patientData, setPatientData] = useState<PatientRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      console.log("Dashboard: Starting data fetch...");
      try {
        const data = await loadPatientData()
        console.log("Dashboard: loadPatientData returned:", data ? `${data.length} records` : "null/undefined");
        // If no data, redirect to setup
        if (!data || data.length === 0) {
          console.log("Dashboard: No data found, redirecting to /setup");
          router.push("/setup")
          return
        }
        setPatientData(data)
      } catch (err) {
        console.error("Dashboard: Error loading data:", err)
        setError("Failed to load patient data. Please check your CSV format.")
      } finally {
        console.log("Dashboard: Setting loading to false.");
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push("/setup")} className="bg-primary text-white px-4 py-2 rounded-md">
            Go to Setup
          </button>
        </div>
      </div>
    )
  }

  // Calculate metrics with safeguards for NaN values
  const readmissionRate = calculateReadmissionRate(patientData)
  const safeReadmissionRate = isNaN(readmissionRate) ? 0 : readmissionRate

  const conditionDistribution = getConditionDistribution(patientData)
  const genderDistribution = getDemographicDistribution(patientData, "gender")
  const raceDistribution = getDemographicDistribution(patientData, "race")
  const lengthOfStayData = getLengthOfStayDistribution(patientData)
  const totalPatients = getTotalPatients(patientData)
  const averageMetrics = getAverageMetrics(patientData)
  const ageDistribution = getAgeDistribution(patientData)
  const conditionsByAge = getConditionsByAge(patientData)
  const readmissionByCondition = getReadmissionByCondition(patientData)

  // Get mock time series data
  const timeSeriesData = getMockTimeSeriesData()

  // Format age distribution for horizontal bar chart
  const ageBarData = ageDistribution.map((item) => ({
    label: item.range,
    value: item.count,
    color: item.color,
  }))

  // Format conditions by age for stacked bar chart
  const conditionsByAgeData = conditionsByAge.map((item) => ({
    category: item.ageGroup,
    values: [
      { name: "Diabetes", value: item.diabetes, color: "#7a40f2" },
      { name: "Hypertension", value: item.hypertension, color: "#71ddb1" },
      { name: "Heart Disease", value: item.heartDisease, color: "#feca57" },
      { name: "COPD", value: item.copd, color: "#f80d38" },
      { name: "Asthma", value: item.asthma, color: "#3fbdf1" },
      { name: "Cancer", value: item.cancer, color: "#ff6b6b" },
    ],
  }))

  // Legend for conditions
  const conditionsLegend = [
    { name: "Diabetes", color: "#7a40f2" },
    { name: "Hypertension", color: "#71ddb1" },
    { name: "Heart Disease", color: "#feca57" },
    { name: "COPD", color: "#f80d38" },
    { name: "Asthma", color: "#3fbdf1" },
    { name: "Cancer", color: "#ff6b6b" },
  ]

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-sm">
        <Breadcrumb items={[{ label: "Dashboard", href: "/" }]} />
        <SearchBar />
      </header>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StatCard title="Total Patients" value={totalPatients} />
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StatCard title="Avg. Age" value={averageMetrics.avgAge || 0} />
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StatCard title="Avg. Conditions" value={averageMetrics.avgConditions || "0"} />
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StatCard
            title="Avg. Stay"
            value={`${averageMetrics.avgLengthOfStay || "0"} hrs`}
            trend={{ value: 10, direction: "down" }}
          />
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StatCard title="Readmission Rate" value={`${safeReadmissionRate.toFixed(1)}%`} />
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First column */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium mb-4">Readmission Risk</h3>
            <div className="flex justify-center">
              <CircularProgress
                percentage={Math.round(safeReadmissionRate)}
                color="#7a40f2"
                label="Readmission Rate"
                trend={{ value: 5, direction: "down" }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <BarChart title="Length of Stay Distribution" data={lengthOfStayData} />
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <HorizontalBarChart title="Age Distribution" data={ageBarData} />
          </div>
        </div>

        {/* Second column */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <DonutChart
              title="Medical Conditions Distribution"
              data={conditionDistribution.filter((item) => item.value > 0)}
            />
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <LineChart title="Admission Trends" subtitle="Last 5 Months" data={timeSeriesData} />
          </div>
        </div>

        {/* Third column */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <PieChart title="Gender Distribution" data={genderDistribution} />
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <PieChart title="Race Distribution" data={raceDistribution} />
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StackedBarChart
            title="Medical Conditions by Age Group"
            data={conditionsByAgeData}
            legend={conditionsLegend}
          />
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <StackedBarChart
            title="Readmissions by Medical Condition"
            data={readmissionByCondition.map((item) => ({
              category: item.condition,
              values: [
                { name: "Readmitted", value: item.readmitted, color: "#f80d38" },
                { name: "Not Readmitted", value: item.notReadmitted, color: "#71ddb1" },
              ],
            }))}
            legend={[
              { name: "Readmitted", color: "#f80d38" },
              { name: "Not Readmitted", color: "#71ddb1" },
            ]}
          />
        </div>
      </div>
    </>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnalyticsCard } from "@/components/analytics-card"
import { Breadcrumb } from "@/components/breadcrumb"
import { SearchBar } from "@/components/search-bar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart2, CalendarIcon, Activity, Heart } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { HorizontalBarChart } from "@/components/horizontal-bar-chart"
import { StackedBarChart } from "@/components/stacked-bar-chart"
import { DonutChart } from "@/components/donut-chart"
import {
  loadPatientData,
  calculateReadmissionRate,
  getConditionDistribution,
  getDemographicDistribution,
  getAverageMetrics,
  getAgeDistribution,
  getConditionsByAge,
  getReadmissionByCondition,
  getTotalPatients,
  type PatientRecord,
} from "@/lib/data-parser"

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patientData, setPatientData] = useState<PatientRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadPatientData()

        // If no data, redirect to setup
        if (data.length === 0) {
          router.push("/setup")
          return
        }

        setPatientData(data)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load patient data")
      } finally {
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
          <p className="mt-4 text-gray-500">Loading analytics data...</p>
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
  const totalPatients = getTotalPatients(patientData)
  const readmissionRate = calculateReadmissionRate(patientData)
  const safeReadmissionRate = isNaN(readmissionRate) ? 0 : readmissionRate

  const averageMetrics = getAverageMetrics(patientData)
  const genderDistribution = getDemographicDistribution(patientData, "gender")
  const raceDistribution = getDemographicDistribution(patientData, "race")
  const ethnicityDistribution = getDemographicDistribution(patientData, "ethnicity")
  const conditionDistribution = getConditionDistribution(patientData)
  const ageDistribution = getAgeDistribution(patientData)
  const conditionsByAge = getConditionsByAge(patientData)
  const readmissionByCondition = getReadmissionByCondition(patientData)

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

  // Calculate percentages for display with safeguards for NaN
  const femaleCount = genderDistribution.find((g) => g.name === "F")?.value || 0
  const femalePercentage = totalPatients > 0 ? ((femaleCount / totalPatients) * 100).toFixed(1) : "0"

  const whiteCount = raceDistribution.find((r) => r.name === "White")?.value || 0
  const whitePercentage = totalPatients > 0 ? ((whiteCount / totalPatients) * 100).toFixed(1) : "0"

  const nonHispanicCount = ethnicityDistribution.find((e) => e.name === "Nonhispanic")?.value || 0
  const nonHispanicPercentage = totalPatients > 0 ? ((nonHispanicCount / totalPatients) * 100).toFixed(1) : "0"

  const diabetesCount = conditionDistribution.find((c) => c.name === "Diabetes")?.value || 0
  const diabetesPercentage = totalPatients > 0 ? ((diabetesCount / totalPatients) * 100).toFixed(1) : "0"

  const hypertensionCount = conditionDistribution.find((c) => c.name === "Hypertension")?.value || 0
  const hypertensionPercentage = totalPatients > 0 ? ((hypertensionCount / totalPatients) * 100).toFixed(1) : "0"

  const heartDiseaseCount = conditionDistribution.find((c) => c.name === "Heart Disease")?.value || 0
  const heartDiseasePercentage = totalPatients > 0 ? ((heartDiseaseCount / totalPatients) * 100).toFixed(1) : "0"

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="p-4 flex items-center justify-between bg-white border-b shadow-sm">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Analytics" }]} />
          <div className="w-80">
            <SearchBar />
          </div>
        </header>

        <main className="p-6">
          <h1 className="text-xl font-semibold mb-6">Healthcare Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <AnalyticsCard title="Total Patients" value={totalPatients.toString()} icon={Users} color="#7a40f2" />
            <AnalyticsCard
              title="Readmission Rate"
              value={`${safeReadmissionRate.toFixed(1)}%`}
              icon={BarChart2}
              color="#3fbdf1"
            />
            <AnalyticsCard
              title="Average Age"
              value={(averageMetrics.avgAge || 0).toString()}
              icon={CalendarIcon}
              color="#71ddb1"
            />
            <AnalyticsCard
              title="Avg. Length of Stay"
              value={`${averageMetrics.avgLengthOfStay || "0"} hrs`}
              icon={Activity}
              color="#f80d38"
            />
            <AnalyticsCard
              title="Avg. Conditions"
              value={averageMetrics.avgConditions || "0"}
              icon={Heart}
              color="#feca57"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Demographics Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DonutChart title="Gender Distribution" data={genderDistribution} size={180} />
                  <DonutChart title="Race Distribution" data={raceDistribution} size={180} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBarChart title="Patients by Age Group" data={ageBarData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Medical Conditions by Age</CardTitle>
              </CardHeader>
              <CardContent>
                <StackedBarChart
                  title="Distribution of Conditions Across Age Groups"
                  data={conditionsByAgeData}
                  legend={[
                    { name: "Diabetes", color: "#7a40f2" },
                    { name: "Hypertension", color: "#71ddb1" },
                    { name: "Heart Disease", color: "#feca57" },
                    { name: "COPD", color: "#f80d38" },
                    { name: "Asthma", color: "#3fbdf1" },
                    { name: "Cancer", color: "#ff6b6b" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Readmission Analysis</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


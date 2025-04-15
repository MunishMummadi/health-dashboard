export interface PatientRecord {
  age: number
  lengthOfStay: number
  totalConditions: number
  totalMedications: number
  totalProcedures: number
  isReadmission: boolean
  hasDiabetes: boolean
  hasHypertension: boolean
  hasHeartDisease: boolean
  hasCopd: boolean
  hasAsthma: boolean
  hasCancer: boolean
  gender: "F" | "M"
  race: "asian" | "black" | "hawaiian" | "native" | "other" | "white"
  ethnicity: "hispanic" | "nonhispanic"
}

export async function loadPatientData(): Promise<PatientRecord[]> {
  try {
    const response = await fetch("/data/patient-data.json")
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }
    const jsonData = await response.json()
    return parsePatientData(jsonData)
  } catch (error) {
    console.error("Error loading patient data:", error)
    return []
  }
}

export function parsePatientData(jsonData: any[]): PatientRecord[] {
  return jsonData.map((item) => {
    // Get the first (and only) key in the object
    const key = Object.keys(item)[0]
    // Split the value by commas
    const values = item[key].split(",")

    return {
      age: Number.parseInt(values[0], 10),
      lengthOfStay: Number.parseFloat(values[1]),
      totalConditions: Number.parseInt(values[2], 10),
      totalMedications: Number.parseInt(values[3], 10),
      totalProcedures: Number.parseInt(values[4], 10),
      isReadmission: values[5].toLowerCase() === "true",
      hasDiabetes: values[6] === "1",
      hasHypertension: values[7] === "1",
      hasHeartDisease: values[8] === "1",
      hasCopd: values[9] === "1",
      hasAsthma: values[10] === "1",
      hasCancer: values[11] === "1",
      gender: values[12] === "TRUE" ? "F" : "M",
      race:
        values[14] === "TRUE"
          ? "asian"
          : values[15] === "TRUE"
            ? "black"
            : values[16] === "TRUE"
              ? "hawaiian"
              : values[17] === "TRUE"
                ? "native"
                : values[18] === "TRUE"
                  ? "other"
                  : "white",
      ethnicity: values[20] === "TRUE" ? "hispanic" : "nonhispanic",
    }
  })
}

// Data analysis utilities
export function calculateReadmissionRate(data: PatientRecord[]): number {
  if (data.length === 0) return 0
  const readmissions = data.filter((record) => record.isReadmission).length
  return (readmissions / data.length) * 100
}

export function getConditionDistribution(data: PatientRecord[]): { name: string; value: number; color: string }[] {
  const conditions = [
    { name: "Diabetes", key: "hasDiabetes", color: "#7a40f2" },
    { name: "Hypertension", key: "hasHypertension", color: "#71ddb1" },
    { name: "Heart Disease", key: "hasHeartDisease", color: "#feca57" },
    { name: "COPD", key: "hasCopd", color: "#f80d38" },
    { name: "Asthma", key: "hasAsthma", color: "#3fbdf1" },
    { name: "Cancer", key: "hasCancer", color: "#ff6b6b" },
  ]

  return conditions.map((condition) => ({
    name: condition.name,
    value: data.filter((record) => record[condition.key as keyof PatientRecord] === true).length,
    color: condition.color,
  }))
}

export function getDemographicDistribution(
  data: PatientRecord[],
  key: "gender" | "race" | "ethnicity",
): { name: string; value: number; color: string }[] {
  const counts: Record<string, number> = {}
  const colors: Record<string, string> = {
    // Gender colors
    F: "#ff6b6b",
    M: "#3fbdf1",
    // Race colors
    asian: "#7a40f2",
    black: "#71ddb1",
    hawaiian: "#feca57",
    native: "#f80d38",
    other: "#3fbdf1",
    white: "#ff6b6b",
    // Ethnicity colors
    hispanic: "#7a40f2",
    nonhispanic: "#71ddb1",
  }

  data.forEach((record) => {
    const value = record[key]
    counts[value] = (counts[value] || 0) + 1
  })

  return Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: colors[name] || "#7a40f2",
  }))
}

export function getAgeDistribution(data: PatientRecord[]): { range: string; count: number }[] {
  const ranges = [
    { min: 0, max: 18, label: "0-18" },
    { min: 19, max: 35, label: "19-35" },
    { min: 36, max: 50, label: "36-50" },
    { min: 51, max: 65, label: "51-65" },
    { min: 66, max: 80, label: "66-80" },
    { min: 81, max: 120, label: "81+" },
  ]

  return ranges.map((range) => ({
    range: range.label,
    count: data.filter((record) => record.age >= range.min && record.age <= range.max).length,
  }))
}

export function getLengthOfStayDistribution(
  data: PatientRecord[],
): { month: string; values: { value: number; color: string }[] }[] {
  // Convert length of stay from days to categories
  const categories = [
    { min: 0, max: 0.041667, label: "0-1 day" }, // 1 day = 0.041667
    { min: 0.041668, max: 0.125, label: "1-3 days" },
    { min: 0.125001, max: 0.291667, label: "3-7 days" },
    { min: 0.291668, max: 1, label: "7+ days" },
  ]

  return categories.map((category) => ({
    month: category.label,
    values: [
      {
        value: data.filter((record) => record.lengthOfStay >= category.min && record.lengthOfStay <= category.max)
          .length,
        color: "#7a40f2",
      },
    ],
  }))
}

export function getMockTimeSeriesData(): {
  labels: string[]
  datasets: { name: string; color: string; values: number[] }[]
} {
  // Since we don't have time series data in the dataset, we'll create mock data
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


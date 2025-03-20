export interface PatientRecord {
  id: number
  patientId: string
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

// Cache for parsed data to avoid repeated parsing
let cachedData: PatientRecord[] | null = null

export async function loadPatientData(): Promise<PatientRecord[]> {
  // Return cached data if available
  if (cachedData) return cachedData

  try {
    // First check if we have data in localStorage (from CSV upload)
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem("patient-data-csv")

      if (localData) {
        console.log("Loading data from localStorage")
        try {
          const parsedData = parseCSVData(localData)
          if (parsedData.length === 0) {
            throw new Error("No valid records found in CSV data")
          }
          cachedData = parsedData
          return parsedData
        } catch (error) {
          console.error("Error parsing CSV data from localStorage:", error)
          // Clear invalid data
          localStorage.removeItem("patient-data-csv")
          // Continue to try loading from public folder
        }
      }
    }

    // If not in localStorage, fetch from public folder
    console.log("Loading data from public folder")
    const response = await fetch("/data/patient-data.csv")
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }
    const csvText = await response.text()

    try {
      const parsedData = parseCSVData(csvText)
      if (parsedData.length === 0) {
        throw new Error("No valid records found in CSV file")
      }
      // Cache the parsed data
      cachedData = parsedData
      return parsedData
    } catch (error) {
      console.error("Error parsing CSV data from file:", error)
      throw new Error("Failed to parse CSV data. Please check the file format.")
    }
  } catch (error) {
    console.error("Error loading patient data:", error)
    throw error
  }
}

export function parseCSVData(csvText: string): PatientRecord[] {
  // Split the CSV text into lines
  const lines = csvText.split("\n")

  // Skip header row
  const startIndex = 1

  return lines
    .slice(startIndex)
    .filter((line) => line.trim() !== "") // Skip empty lines
    .map((line, index) => {
      // Split the line by commas, but handle potential commas within quoted fields
      const values = line.split(",").map((v) => v.trim())

      // Check if we have enough values
      if (values.length < 22) {
        console.warn(`Line ${index + startIndex} has insufficient values:`, line)
        return null
      }

      // Parse numeric values with fallbacks to prevent NaN
      const age = Number.parseInt(values[1], 10)
      const lengthOfStay = Number.parseFloat(values[2])
      const totalConditions = Number.parseInt(values[3], 10)
      const totalMedications = Number.parseInt(values[4], 10)
      const totalProcedures = Number.parseInt(values[5], 10)

      // Extract Patient_ID from the data
      const patientId = values[0]

      return {
        id: index + 1,
        patientId: patientId,
        age: isNaN(age) ? 0 : age,
        lengthOfStay: isNaN(lengthOfStay) ? 0 : lengthOfStay,
        totalConditions: isNaN(totalConditions) ? 0 : totalConditions,
        totalMedications: isNaN(totalMedications) ? 0 : totalMedications,
        totalProcedures: isNaN(totalProcedures) ? 0 : totalProcedures,
        isReadmission: values[6]?.toUpperCase() === "TRUE",
        hasDiabetes: values[7]?.toUpperCase() === "TRUE",
        hasHypertension: values[8]?.toUpperCase() === "TRUE",
        hasHeartDisease: values[9]?.toUpperCase() === "TRUE",
        hasCopd: values[10]?.toUpperCase() === "TRUE",
        hasAsthma: values[11]?.toUpperCase() === "TRUE",
        hasCancer: values[12]?.toUpperCase() === "TRUE",
        gender: values[13]?.toUpperCase() === "TRUE" ? "F" : "M",
        race:
          values[15]?.toUpperCase() === "TRUE"
            ? "asian"
            : values[16]?.toUpperCase() === "TRUE"
              ? "black"
              : values[17]?.toUpperCase() === "TRUE"
                ? "hawaiian"
                : values[18]?.toUpperCase() === "TRUE"
                  ? "native"
                  : values[19]?.toUpperCase() === "TRUE"
                    ? "other"
                    : "white",
        ethnicity: values[21]?.toUpperCase() === "TRUE" ? "hispanic" : "nonhispanic",
      }
    })
    .filter((record): record is PatientRecord => record !== null) // Filter out null records
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

export function getAgeDistribution(data: PatientRecord[]): { range: string; count: number; color: string }[] {
  const ranges = [
    { min: 0, max: 18, label: "0-18", color: "#3fbdf1" },
    { min: 19, max: 35, label: "19-35", color: "#71ddb1" },
    { min: 36, max: 50, label: "36-50", color: "#feca57" },
    { min: 51, max: 65, label: "51-65", color: "#7a40f2" },
    { min: 66, max: 80, label: "66-80", color: "#f80d38" },
    { min: 81, max: 120, label: "81+", color: "#ff6b6b" },
  ]

  return ranges.map((range) => ({
    range: range.label,
    count: data.filter((record) => record.age >= range.min && record.age <= range.max).length,
    color: range.color,
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

export function getAverageMetrics(data: PatientRecord[]): {
  avgAge: number
  avgConditions: string
  avgLengthOfStay: string
  avgMedications: string
  avgProcedures: string
} {
  if (data.length === 0) {
    return {
      avgAge: 0,
      avgConditions: "0",
      avgLengthOfStay: "0",
      avgMedications: "0",
      avgProcedures: "0",
    }
  }

  const avgAge = Math.round(data.reduce((sum, record) => sum + record.age, 0) / data.length)

  const avgConditions = (data.reduce((sum, record) => sum + record.totalConditions, 0) / data.length).toFixed(1)

  const avgLengthOfStay = ((data.reduce((sum, record) => sum + record.lengthOfStay, 0) / data.length) * 24).toFixed(1)

  const avgMedications = (data.reduce((sum, record) => sum + record.totalMedications, 0) / data.length).toFixed(1)

  const avgProcedures = (data.reduce((sum, record) => sum + record.totalProcedures, 0) / data.length).toFixed(1)

  return {
    avgAge,
    avgConditions,
    avgLengthOfStay,
    avgMedications,
    avgProcedures,
  }
}

export function getConditionsByAge(data: PatientRecord[]): {
  ageGroup: string
  diabetes: number
  hypertension: number
  heartDisease: number
  copd: number
  asthma: number
  cancer: number
}[] {
  const ageGroups = [
    { min: 0, max: 35, label: "0-35" },
    { min: 36, max: 50, label: "36-50" },
    { min: 51, max: 65, label: "51-65" },
    { min: 66, max: 120, label: "66+" },
  ]

  return ageGroups.map((group) => {
    const groupData = data.filter((record) => record.age >= group.min && record.age <= group.max)

    return {
      ageGroup: group.label,
      diabetes: groupData.filter((r) => r.hasDiabetes).length,
      hypertension: groupData.filter((r) => r.hasHypertension).length,
      heartDisease: groupData.filter((r) => r.hasHeartDisease).length,
      copd: groupData.filter((r) => r.hasCopd).length,
      asthma: groupData.filter((r) => r.hasAsthma).length,
      cancer: groupData.filter((r) => r.hasCancer).length,
    }
  })
}

export function getReadmissionByCondition(data: PatientRecord[]): {
  condition: string
  readmitted: number
  notReadmitted: number
  color: string
}[] {
  const conditions = [
    { name: "Diabetes", key: "hasDiabetes", color: "#7a40f2" },
    { name: "Hypertension", key: "hasHypertension", color: "#71ddb1" },
    { name: "Heart Disease", key: "hasHeartDisease", color: "#feca57" },
    { name: "COPD", key: "hasCopd", color: "#f80d38" },
    { name: "Asthma", key: "hasAsthma", color: "#3fbdf1" },
    { name: "Cancer", key: "hasCancer", color: "#ff6b6b" },
  ]

  return conditions.map((condition) => {
    const patientsWithCondition = data.filter((record) => record[condition.key as keyof PatientRecord] === true)

    return {
      condition: condition.name,
      readmitted: patientsWithCondition.filter((r) => r.isReadmission).length,
      notReadmitted: patientsWithCondition.filter((r) => !r.isReadmission).length,
      color: condition.color,
    }
  })
}

export function getPatientsByPage(data: PatientRecord[], page: number, pageSize: number): PatientRecord[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return data.slice(start, end)
}

export function getTotalPatients(data: PatientRecord[]): number {
  return data.length
}


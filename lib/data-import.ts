import { supabaseAdmin } from "./supabase"

// Interface for patient data
export interface PatientData {
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

// Parse a line from the JSON file
function parsePatientLine(line: string): PatientData | null {
  try {
    // Clean up the line to make it valid JSON
    let cleanLine = line.trim()
    if (cleanLine.endsWith(",")) {
      cleanLine = cleanLine.slice(0, -1)
    }

    // Skip empty lines or array brackets
    if (cleanLine === "[" || cleanLine === "]" || !cleanLine) {
      return null
    }

    const patient = JSON.parse(cleanLine)

    // Get the first (and only) key in the object
    const key = Object.keys(patient)[0]
    // Split the value by commas
    const values = patient[key].split(",")

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
  } catch (error) {
    console.error("Error parsing patient line:", error)
    return null
  }
}

// Process a chunk of the JSON file
async function processChunk(chunk: string, batchSize = 1000) {
  const lines = chunk.split("\n")
  const patients: PatientData[] = []

  for (const line of lines) {
    const patient = parsePatientLine(line)
    if (patient) {
      patients.push(patient)
    }

    // Insert in batches to improve performance
    if (patients.length >= batchSize) {
      await insertPatientBatch(patients)
      patients.length = 0 // Clear the array
    }
  }

  // Insert any remaining patients
  if (patients.length > 0) {
    await insertPatientBatch(patients)
  }
}

// Insert a batch of patients into the database
async function insertPatientBatch(patients: PatientData[]) {
  if (patients.length === 0) return

  const { error } = await supabaseAdmin.from("patients").insert(
    patients.map((p) => ({
      age: p.age,
      length_of_stay: p.lengthOfStay,
      total_conditions: p.totalConditions,
      total_medications: p.totalMedications,
      total_procedures: p.totalProcedures,
      is_readmission: p.isReadmission,
      has_diabetes: p.hasDiabetes,
      has_hypertension: p.hasHypertension,
      has_heart_disease: p.hasHeartDisease,
      has_copd: p.hasCopd,
      has_asthma: p.hasAsthma,
      has_cancer: p.hasCancer,
      gender: p.gender,
      race: p.race,
      ethnicity: p.ethnicity,
    })),
  )

  if (error) {
    console.error("Error inserting patient batch:", error)
    throw error
  }
}

// Import data from a file in Supabase Storage
export async function importDataFromStorage(bucketName: string, filePath: string) {
  try {
    console.log(`Starting import from ${bucketName}/${filePath}`)

    // Check if file exists
    const { data: fileData, error: fileError } = await supabaseAdmin.storage.from(bucketName).download(filePath)

    if (fileError) {
      console.error("Error downloading file:", fileError)
      return { success: false, message: `Error downloading file: ${fileError.message}` }
    }

    // Clear existing data
    await supabaseAdmin.from("patients").delete().neq("id", 0)
    console.log("Cleared existing patient data")

    // Process the file in chunks
    const fileContent = await fileData.text()
    const chunkSize = 1024 * 1024 // 1MB chunks
    let processedBytes = 0

    while (processedBytes < fileContent.length) {
      const chunk = fileContent.slice(processedBytes, processedBytes + chunkSize)
      await processChunk(chunk)
      processedBytes += chunkSize
      console.log(`Processed ${Math.min(processedBytes, fileContent.length)} of ${fileContent.length} bytes`)
    }

    return { success: true, message: "Data import completed successfully" }
  } catch (error) {
    console.error("Error importing data:", error)
    return { success: false, message: `Error: ${error.message}` }
  }
}

// Check if the patients table has data
export async function hasPatientData() {
  const { count, error } = await supabaseAdmin.from("patients").select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error checking patient data:", error)
    return false
  }

  return count !== null && count > 0
}


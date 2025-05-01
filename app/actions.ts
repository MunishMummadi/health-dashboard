"use server"

// Removed imports from '@/lib/supabase' and '@/lib/data-import'

export interface PatientRecord {
  id: number
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

// Get patients with pagination
export async function getPatients(page = 1, limit = 100): Promise<PatientRecord[]> {
  try {
    const offset = (page - 1) * limit

    const { data, error } = await supabaseAdmin
      .from("patients")
      .select(`
        id,
        age,
        length_of_stay as lengthOfStay,
        total_conditions as totalConditions,
        total_medications as totalMedications,
        total_procedures as totalProcedures,
        is_readmission as isReadmission,
        has_diabetes as hasDiabetes,
        has_hypertension as hasHypertension,
        has_heart_disease as hasHeartDisease,
        has_copd as hasCopd,
        has_asthma as hasAsthma,
        has_cancer as hasCancer,
        gender,
        race,
        ethnicity
      `)
      .order("id")
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching patients:", error)
    return []
  }
}

// Get total patient count with caching
export async function getTotalPatientCount(): Promise<number> {
  // Check cache first
  // const cachedResult = await getCachedQueryResult("total_patient_count")
  // if (cachedResult !== null) {
  //   return cachedResult
  // }

  try {
    const { count, error } = await supabaseAdmin.from("patients").select("*", { count: "exact", head: true })

    if (error) throw error

    // Cache the result
    // await cacheQueryResult("total_patient_count", count)

    return count || 0
  } catch (error) {
    console.error("Error getting patient count:", error)
    return 0
  }
}

// Get readmission rate with caching
export async function getReadmissionRate(): Promise<number> {
  // Check cache first
  // const cachedResult = await getCachedQueryResult("readmission_rate")
  // if (cachedResult !== null) {
  //   return cachedResult
  // }

  try {
    const { data, error } = await supabaseAdmin.rpc("get_readmission_rate")

    if (error) {
      // If the RPC function doesn't exist, fall back to a regular query
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin.from("patients").select("is_readmission")

      if (fallbackError) throw fallbackError

      if (!fallbackData || fallbackData.length === 0) return 0

      const readmissions = fallbackData.filter((p) => p.is_readmission).length
      const rate = (readmissions / fallbackData.length) * 100

      // Cache the result
      // await cacheQueryResult("readmission_rate", rate)

      return rate
    }

    // Cache the result
    // await cacheQueryResult("readmission_rate", data)

    return data || 0
  } catch (error) {
    console.error("Error calculating readmission rate:", error)
    return 0
  }
}

// Get condition distribution with caching
export async function getConditionDistribution(): Promise<{ name: string; value: number; color: string }[]> {
  // Check cache first
  // const cachedResult = await getCachedQueryResult("condition_distribution")
  // if (cachedResult !== null) {
  //   return cachedResult
  // }

  try {
    const { data, error } = await supabaseAdmin.rpc("get_condition_distribution")

    if (error) {
      // If the RPC function doesn't exist, fall back to a regular query
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin.from("patients").select(`
          has_diabetes,
          has_hypertension,
          has_heart_disease,
          has_copd,
          has_asthma,
          has_cancer
        `)

      if (fallbackError) throw fallbackError

      if (!fallbackData) return []

      const distribution = [
        { name: "Diabetes", value: fallbackData.filter((p) => p.has_diabetes).length, color: "#7a40f2" },
        { name: "Hypertension", value: fallbackData.filter((p) => p.has_hypertension).length, color: "#71ddb1" },
        { name: "Heart Disease", value: fallbackData.filter((p) => p.has_heart_disease).length, color: "#feca57" },
        { name: "COPD", value: fallbackData.filter((p) => p.has_copd).length, color: "#f80d38" },
        { name: "Asthma", value: fallbackData.filter((p) => p.has_asthma).length, color: "#3fbdf1" },
        { name: "Cancer", value: fallbackData.filter((p) => p.has_cancer).length, color: "#ff6b6b" },
      ]

      // Cache the result
      // await cacheQueryResult("condition_distribution", distribution)

      return distribution
    }

    const distribution = [
      { name: "Diabetes", value: data.diabetes || 0, color: "#7a40f2" },
      { name: "Hypertension", value: data.hypertension || 0, color: "#71ddb1" },
      { name: "Heart Disease", value: data.heart_disease || 0, color: "#feca57" },
      { name: "COPD", value: data.copd || 0, color: "#f80d38" },
      { name: "Asthma", value: data.asthma || 0, color: "#3fbdf1" },
      { name: "Cancer", value: data.cancer || 0, color: "#ff6b6b" },
    ]

    // Cache the result
    // await cacheQueryResult("condition_distribution", distribution)

    return distribution
  } catch (error) {
    console.error("Error getting condition distribution:", error)
    return []
  }
}

// Get demographic distribution with caching
export async function getDemographicDistribution(
  type: "gender" | "race" | "ethnicity",
): Promise<{ name: string; value: number; color: string }[]> {
  const cacheKey = `${type}_distribution`
  // Check cache first
  // const cachedResult = await getCachedQueryResult(cacheKey)
  // if (cachedResult !== null) {
  //   return cachedResult
  // }

  try {
    const { data, error } = await supabaseAdmin.from("patients").select(type).order(type)

    if (error) throw error

    if (!data) return []

    // Count occurrences of each value
    const counts: Record<string, number> = {}
    data.forEach((item) => {
      const value = item[type]
      counts[value] = (counts[value] || 0) + 1
    })

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

    const distribution = Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name] || "#7a40f2",
    }))

    // Cache the result
    // await cacheQueryResult(cacheKey, distribution)

    return distribution
  } catch (error) {
    console.error(`Error getting ${type} distribution:`, error)
    return []
  }
}

// Get length of stay distribution with caching
export async function getLengthOfStayDistribution(): Promise<
  { month: string; values: { value: number; color: string }[] }[]
> {
  // Check cache first
  // const cachedResult = await getCachedQueryResult("length_of_stay_distribution")
  // if (cachedResult !== null) {
  //   return cachedResult
  // }

  try {
    const { data, error } = await supabaseAdmin.from("patients").select("length_of_stay")

    if (error) throw error

    if (!data) return []

    // Define stay categories
    const categories = [
      { min: 0, max: 0.041667, label: "0-1 day" },
      { min: 0.041668, max: 0.125, label: "1-3 days" },
      { min: 0.125001, max: 0.291667, label: "3-7 days" },
      { min: 0.291668, max: Number.POSITIVE_INFINITY, label: "7+ days" },
    ]

    // Count patients in each category
    const counts: Record<string, number> = {}
    categories.forEach((cat) => {
      counts[cat.label] = data.filter((p) => p.length_of_stay >= cat.min && p.length_of_stay <= cat.max).length
    })

    const distribution = categories.map((cat) => ({
      month: cat.label,
      values: [{ value: counts[cat.label], color: "#7a40f2" }],
    }))

    // Cache the result
    // await cacheQueryResult("length_of_stay_distribution", distribution)

    return distribution
  } catch (error) {
    console.error("Error getting length of stay distribution:", error)
    return []
  }
}

// Get average metrics with caching
export async function getAverageMetrics(): Promise<{ avgAge: number; avgConditions: string; avgLengthOfStay: string }> {
  // Check cache first
  // const cachedResult = await getCachedQueryResult("average_metrics")
  // if (cachedResult !== null) {
  //   return cachedResult
  // }

  try {
    const { data, error } = await supabaseAdmin.from("patients").select(`
        age,
        total_conditions,
        length_of_stay
      `)

    if (error) throw error

    if (!data || data.length === 0) {
      return { avgAge: 0, avgConditions: "0", avgLengthOfStay: "0" }
    }

    const avgAge = Math.round(data.reduce((sum, p) => sum + p.age, 0) / data.length)

    const avgConditions = (data.reduce((sum, p) => sum + p.total_conditions, 0) / data.length).toFixed(1)

    const avgLengthOfStay = ((data.reduce((sum, p) => sum + p.length_of_stay, 0) / data.length) * 24).toFixed(1)

    const metrics = {
      avgAge,
      avgConditions,
      avgLengthOfStay,
    }

    // Cache the result
    // await cacheQueryResult("average_metrics", metrics)

    return metrics
  } catch (error) {
    console.error("Error getting average metrics:", error)
    return { avgAge: 0, avgConditions: "0", avgLengthOfStay: "0" }
  }
}

// Import data from Supabase Storage
export async function importData(bucketName: string, filePath: string) {
  try {
    // Removed import from '@/lib/data-import'
    return { success: false, message: "Import functionality disabled." } // Return dummy response
  } catch (error) {
    console.error("Error importing data:", error)
    return { success: false, message: `Error: ${error.message}` }
  }
}

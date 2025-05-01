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

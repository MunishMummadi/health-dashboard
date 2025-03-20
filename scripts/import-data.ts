import path from "path"
import { initializeDb, importDataFromJson } from "../lib/db"

// Initialize the database
const initResult = initializeDb()
console.log(initResult.message)

// Import data from JSON
const jsonFilePath = path.join(process.cwd(), "public", "data", "patient-data.json")
const importResult = importDataFromJson(jsonFilePath)
console.log(importResult.message)

console.log("Data import complete")


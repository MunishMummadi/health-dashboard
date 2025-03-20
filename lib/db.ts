import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { createReadStream } from "fs"
import readline from "readline"

// Database path
const DB_PATH = path.join(process.cwd(), "patient-data.db")

// Initialize database with optimized settings
export function getDb() {
  const db = new Database(DB_PATH)

  // Performance optimizations
  db.pragma("journal_mode = WAL") // Write-Ahead Logging for better concurrency
  db.pragma("synchronous = NORMAL") // Less durability but better performance
  db.pragma("cache_size = -64000") // 64MB page cache
  db.pragma("foreign_keys = OFF") // Disable foreign key constraints during bulk imports
  db.pragma("temp_store = MEMORY") // Store temp tables in memory

  return db
}

// Initialize the database with schema
export function initializeDb() {
  try {
    const db = getDb()

    // Create patients table with indexes for common queries
    db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age INTEGER,
        length_of_stay REAL,
        total_conditions INTEGER,
        total_medications INTEGER,
        total_procedures INTEGER,
        is_readmission BOOLEAN,
        has_diabetes BOOLEAN,
        has_hypertension BOOLEAN,
        has_heart_disease BOOLEAN,
        has_copd BOOLEAN,
        has_asthma BOOLEAN,
        has_cancer BOOLEAN,
        gender TEXT,
        race TEXT,
        ethnicity TEXT
      );
      
      -- Create indexes for frequently queried columns
      CREATE INDEX IF NOT EXISTS idx_readmission ON patients(is_readmission);
      CREATE INDEX IF NOT EXISTS idx_conditions ON patients(has_diabetes, has_hypertension, has_heart_disease, has_copd, has_asthma, has_cancer);
      CREATE INDEX IF NOT EXISTS idx_demographics ON patients(gender, race, ethnicity);
      CREATE INDEX IF NOT EXISTS idx_length_of_stay ON patients(length_of_stay);
    `)

    console.log("Database schema created")
    db.close()

    return { success: true, message: "Database initialized" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, message: `Error: ${error.message}` }
  }
}

// Import data from JSON to SQLite with streaming for large files
export async function importDataFromJson(jsonFilePath: string) {
  try {
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      return { success: false, message: "JSON file not found" }
    }

    // Initialize database
    initializeDb()
    const db = getDb()

    // Begin transaction for faster inserts
    db.exec("BEGIN TRANSACTION")

    const insertStmt = db.prepare(`
      INSERT INTO patients (
        age, length_of_stay, total_conditions, total_medications, total_procedures,
        is_readmission, has_diabetes, has_hypertension, has_heart_disease,
        has_copd, has_asthma, has_cancer, gender, race, ethnicity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Stream the file line by line to avoid loading the entire file into memory
    let recordCount = 0
    const fileStream = createReadStream(jsonFilePath, { encoding: "utf8" })
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Number.POSITIVE_INFINITY,
    })

    // Process the file as a JSON array
    const isFirstLine = true
    let isInArray = false

    for await (const line of rl) {
      // Skip empty lines
      if (!line.trim()) continue

      // Handle array start/end
      if (line.trim() === "[") {
        isInArray = true
        continue
      }

      if (line.trim() === "]") {
        isInArray = false
        continue
      }

      if (!isInArray) continue

      // Process JSON object
      try {
        // Clean up the line to make it valid JSON
        let cleanLine = line.trim()
        if (cleanLine.endsWith(",")) {
          cleanLine = cleanLine.slice(0, -1)
        }

        const patient = JSON.parse(cleanLine)

        // Get the first (and only) key in the object
        const key = Object.keys(patient)[0]
        // Split the value by commas
        const values = patient[key].split(",")

        insertStmt.run(
          Number.parseInt(values[0], 10), // age
          Number.parseFloat(values[1]), // length_of_stay
          Number.parseInt(values[2], 10), // total_conditions
          Number.parseInt(values[3], 10), // total_medications
          Number.parseInt(values[4], 10), // total_procedures
          values[5].toLowerCase() === "true" ? 1 : 0, // is_readmission
          values[6] === "1" ? 1 : 0, // has_diabetes
          values[7] === "1" ? 1 : 0, // has_hypertension
          values[8] === "1" ? 1 : 0, // has_heart_disease
          values[9] === "1" ? 1 : 0, // has_copd
          values[10] === "1" ? 1 : 0, // has_asthma
          values[11] === "1" ? 1 : 0, // has_cancer
          values[12] === "TRUE" ? "F" : "M", // gender
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
                    : "white", // race
          values[20] === "TRUE" ? "hispanic" : "nonhispanic", // ethnicity
        )

        recordCount++

        // Commit every 10,000 records to avoid transaction getting too large
        if (recordCount % 10000 === 0) {
          db.exec("COMMIT")
          db.exec("BEGIN TRANSACTION")
          console.log(`Imported ${recordCount} records...`)
        }
      } catch (e) {
        console.error("Error parsing line:", e)
        // Continue with next line
      }
    }

    // Commit final transaction
    db.exec("COMMIT")

    // Create statistics tables for faster dashboard queries
    db.exec(`
      CREATE TABLE IF NOT EXISTS stats_cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Close the database connection
    db.close()

    return { success: true, message: `Imported ${recordCount} records` }
  } catch (error) {
    console.error("Error importing data:", error)
    return { success: false, message: `Error: ${error.message}` }
  }
}

// Function to cache query results
export function cacheQueryResult(key: string, value: any) {
  try {
    const db = getDb()
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO stats_cache (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `)

    stmt.run(key, JSON.stringify(value))
    db.close()
  } catch (error) {
    console.error("Error caching query result:", error)
  }
}

// Function to get cached query result
export function getCachedQueryResult(key: string) {
  try {
    const db = getDb()
    const result = db
      .prepare(`
      SELECT value, updated_at
      FROM stats_cache
      WHERE key = ?
    `)
      .get(key)

    db.close()

    if (!result) return null

    // Check if cache is older than 1 hour
    const updatedAt = new Date(result.updated_at)
    const now = new Date()
    const cacheAge = (now.getTime() - updatedAt.getTime()) / 1000 / 60 // in minutes

    if (cacheAge > 60) return null // Cache expired

    return JSON.parse(result.value)
  } catch (error) {
    console.error("Error getting cached query result:", error)
    return null
  }
}


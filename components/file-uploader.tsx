"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Database, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setUploadError(null)
      setUploadSuccess(false)
      setImportSuccess(false)
      setImportError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first")
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadError(null)

      // Create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket("healthcare-data", {
        public: false,
      })

      if (bucketError && bucketError.message !== "Bucket already exists") {
        throw bucketError
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("healthcare-data").upload("patient-data.json", file, {
        cacheControl: "3600",
        upsert: true,
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          setUploadProgress(percent)
        },
      })

      if (uploadError) throw uploadError

      setUploadSuccess(true)
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    try {
      setImporting(true)
      setImportError(null)

      const response = await fetch("/api/import-data?bucket=healthcare-data&file=patient-data.json")
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Import failed")
      }

      setImportSuccess(true)
    } catch (error) {
      console.error("Error importing data:", error)
      setImportError(`Import failed: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Patient Data</CardTitle>
        <CardDescription>Upload your JSON file to Supabase Storage and import it into the database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">JSON File</Label>
          <Input id="file" type="file" accept=".json" onChange={handleFileChange} disabled={uploading || importing} />
          {file && (
            <p className="text-sm text-gray-500">
              Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-sm text-center">{uploadProgress}% Uploaded</p>
          </div>
        )}

        {uploadError && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={16} />
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <p className="text-sm">File uploaded successfully!</p>
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={16} />
            <p className="text-sm">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <p className="text-sm">Data imported successfully!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleUpload} disabled={!file || uploading || importing} className="gap-2">
          <Upload size={16} />
          Upload to Storage
        </Button>

        <Button onClick={handleImport} disabled={!uploadSuccess || importing} className="gap-2">
          <Database size={16} />
          {importing ? "Importing..." : "Import to Database"}
        </Button>
      </CardFooter>
    </Card>
  )
}


"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

interface CSVUploaderProps {
  onUploadSuccess: (csvContent: string) => void;
}

export function CSVUploader({ onUploadSuccess }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      // Check if it's a CSV file
      if (!selectedFile.name.endsWith(".csv")) {
        setUploadError("Please select a CSV file")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setUploadError(null)
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first")
      return
    }

    try {
      setUploading(true)
      setUploadError(null)

      // Read the file and save it to localStorage for demo purposes
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const csvContent = e.target?.result as string

          if (!csvContent) {
            throw new Error("Failed to read file content")
          }

          // Validate CSV format
          const lines = csvContent.split("\n")
          if (lines.length < 2) {
            throw new Error("CSV file must contain a header row and at least one data row")
          }

          const header = lines[0].toLowerCase()
          if (!header.includes("patient_id") || !header.includes("age") || !header.includes("is_readmission")) {
            throw new Error("CSV file must contain required columns: Patient_ID, AGE, IS_READMISSION, etc.")
          }

          // Call the callback function with the CSV content
          onUploadSuccess(csvContent);

          setUploadSuccess(true)

          // Wait a moment before reloading to show success message
          // setTimeout(() => {
          //   window.location.reload()
          // }, 1000)
        } catch (error) {
          console.error("Error processing CSV:", error)
          setUploadError(`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
          setUploading(false)
        }
      }

      reader.onerror = () => {
        setUploadError("Error reading file")
        setUploading(false)
      }

      reader.readAsText(file)
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Patient Data</CardTitle>
        <CardDescription>Upload your CSV file to view the healthcare analytics dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <Input id="file" type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
          {file && (
            <p className="text-sm text-gray-500">
              Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={16} />
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <p className="text-sm">File processed successfully!</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2 w-full">
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </CardFooter>
    </Card>
  )
}

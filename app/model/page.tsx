"use client"

import React, { useState } from 'react';
import { CSVUploader } from '@/components/csv-uploader';
import { parseCSVData, type PatientRecord } from '@/lib/data-parser'; 
import { Button } from '@/components/ui/button'; 
import { AlertCircle, CheckCircle, Download } from 'lucide-react'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 

export default function ModelPage() {
  const [csvData, setCsvData] = useState<string | null>(null); 
  const [parsedData, setParsedData] = useState<PatientRecord[] | null>(null); 
  const [parsingError, setParsingError] = useState<string | null>(null); 

  const handleUploadSuccess = (csvContent: string) => {
    console.log("CSV data received in ModelPage:", csvContent.substring(0, 100) + '...');
    setCsvData(csvContent);
    setParsedData(null); 
    setParsingError(null); 

    try {
      const results = parseCSVData(csvContent);
      if (results.length === 0) {
        setParsingError("No valid patient records found in the uploaded CSV. Please check the file format and content.");
      } else {
        setParsedData(results);
        console.log(`Successfully parsed ${results.length} records.`);
      }
    } catch (error) {
      console.error("Error parsing CSV data:", error);
      setParsingError(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure the format is correct.`);
      setParsedData(null);
    }
  };

  const handleDownload = () => {
    if (!parsedData) return;

    // Define CSV Header
    const header = [
      'Patient_ID', 'AGE', 'Length_Of_Stay_DAYS', 'Total_Conditions', 'Total_Medications',
      'Total_Procedures', 'Is_Readmission', 'Has_Diabetes', 'Has_Hypertension',
      'Has_Heart_Disease', 'Has_COPD', 'Has_Asthma', 'Has_Cancer',
      'Gender', 'Race', 'Ethnicity'
    ];

    // Convert PatientRecord objects to CSV rows
    const rows = parsedData.map(record => [
      record.patientId,
      record.age,
      record.lengthOfStay,
      record.totalConditions,
      record.totalMedications,
      record.totalProcedures,
      record.isReadmission,
      record.hasDiabetes,
      record.hasHypertension,
      record.hasHeartDisease,
      record.hasCopd,
      record.hasAsthma,
      record.hasCancer,
      record.gender,
      record.race,
      record.ethnicity
    ].map(value => {
      // Handle potential commas in future string values by quoting
      const stringValue = String(value);
      return /[,\"\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
    }).join(','));
    
    // Combine header and rows
    const csvContent = [header.join(','), ...rows].join('\n');

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'processed_patient_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("CSV download is not supported in this browser.");
    }
  };

  return (
    <div className="container mx-auto p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Model - Predict Hospital Readmissions</h1>

      <div className="w-full max-w-lg mb-8">
        <CSVUploader onUploadSuccess={handleUploadSuccess} /> 
      </div>

      <div className="w-full max-w-4xl mt-8">
        <h2 className="text-xl font-semibold mb-4">Processed Results</h2>
        <div className="p-6 border rounded-md bg-white shadow-sm min-h-[150px]">
          {!csvData && (
            <p className="text-gray-500">Upload a CSV file using the section above to process and view results.</p>
          )}

          {parsingError && (
            <div className="flex items-center gap-3 text-destructive bg-red-50 p-3 rounded-md border border-red-200">
              <AlertCircle size={20} />
              <div>
                <p className="font-medium">Error Processing CSV</p>
                <p className="text-sm">{parsingError}</p>
              </div>
            </div>
          )}

          {parsedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-success bg-green-50 p-3 rounded-md border border-green-200">
                <CheckCircle size={20} />
                <div>
                  <p className="font-medium">Processing Successful</p>
                  <p className="text-sm">Successfully parsed <span className="font-semibold">{parsedData.length}</span> patient records.</p>
                </div>
              </div>

              {/* Table Preview */}
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Data Preview (First 5 Records)</h3>
                <div className="rounded-md border max-h-60 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Conditions</TableHead>
                        <TableHead>Readmission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 5).map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.patientId}</TableCell>
                          <TableCell>{patient.age}</TableCell>
                          <TableCell>{patient.gender}</TableCell>
                          <TableCell>{patient.totalConditions}</TableCell>
                          <TableCell>
                            <span className={patient.isReadmission ? "text-destructive" : "text-success"}>
                              {patient.isReadmission ? "Yes" : "No"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Button onClick={handleDownload} className="mt-4 gap-2">
                <Download size={16} />
                Download Processed CSV
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

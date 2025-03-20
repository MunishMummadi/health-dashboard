import { CSVUploader } from "@/components/csv-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Healthcare Dashboard Setup</CardTitle>
          <CardDescription>
            Upload your patient data CSV file to get started with the healthcare analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <p className="text-center text-gray-500 max-w-md">
              Upload your CSV file to view the healthcare analytics dashboard. The CSV should contain patient data with
              the following columns:
            </p>

            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md w-full overflow-x-auto">
              <code>
                Patient_ID,AGE,LENGTH_OF_STAY,TOTAL_CONDITIONS,TOTAL_MEDICATIONS,TOTAL_PROCEDURES,IS_READMISSION,HAS_DIABETES,HAS_HYPERTENSION,HAS_HEART_DISEASE,HAS_COPD,HAS_ASTHMA,HAS_CANCER,GENDER_F,GENDER_M,RACE_asian,RACE_black,RACE_hawaiian,RACE_native,RACE_other,RACE_white,ETHNICITY_hispanic,ETHNICITY_nonhispanic
              </code>
            </div>

            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md w-full">
              <p className="font-medium mb-2">Expected data format:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Patient_ID: String (e.g., "P000001")</li>
                <li>AGE: Integer</li>
                <li>LENGTH_OF_STAY: Decimal (days)</li>
                <li>TOTAL_CONDITIONS, TOTAL_MEDICATIONS, TOTAL_PROCEDURES: Integers</li>
                <li>Boolean columns (IS_READMISSION, HAS_*): "TRUE" or "FALSE"</li>
                <li>Gender, Race, Ethnicity: Use TRUE/FALSE in appropriate columns</li>
              </ul>
            </div>

            <CSVUploader />

            <div className="text-sm text-gray-500 mt-4">
              <p>Note: For demo purposes, the CSV data is stored in your browser's local storage.</p>
              <p>Maximum file size is approximately 5MB due to browser storage limitations.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


import { NextResponse, NextRequest } from 'next/server';
import { PythonShell } from 'python-shell';
import path from 'path';
import { type PatientRecord } from '@/lib/data-parser'; // Assuming type is defined here or adjust path

// Define the structure of the data returned by the Python script
// (Includes original fields plus prediction fields)
interface PatientRecordWithPrediction extends PatientRecord {
  prediction: number;
  predictionProbability: number;
}

export async function POST(request: NextRequest) {
  try {
    const patientData: PatientRecord[] = await request.json();

    if (!Array.isArray(patientData)) {
      return NextResponse.json({ error: 'Invalid input: Expected an array of patient records.' }, { status: 400 });
    }

    if (patientData.length === 0) {
      return NextResponse.json({ data: [] }); // Return empty array if input is empty
    }

    const pythonScriptPath = path.join(process.cwd(), 'ml_model');
    const scriptName = 'predict.py';

    const options = {
      mode: 'json' as const, // Send/receive data as JSON
      pythonPath: process.env.PYTHON_PATH || 'python3', // Use 'python3' or specify path in .env
      scriptPath: pythonScriptPath,
      args: [] as string[], // No command line args, using stdin
    };

    // Use a Promise to handle the async PythonShell execution
    const predictions = await new Promise<PatientRecordWithPrediction[]>((resolve, reject) => {
      const pyshell = new PythonShell(scriptName, options);
      let results: PatientRecordWithPrediction[] | null = null;
      let errorOutput = '';

      // Send patient data as JSON string to stdin
      pyshell.send(patientData);

      // Handle messages (JSON output) from stdout
      pyshell.on('message', function (message) {
        // message is expected to be the JSON array with predictions
        results = message as PatientRecordWithPrediction[];
      });

      // Handle errors from stderr
      pyshell.on('stderr', function (stderr) {
        errorOutput += stderr + '\n';
        console.error('Python script stderr:', stderr);
      });

      // Handle script completion or errors
      pyshell.end(function (err, code, signal) {
        if (err) {
           console.error('PythonShell failed:', err);
           console.error('Stderr:', errorOutput); // Log stderr for debugging
           return reject(new Error(`Prediction script execution failed. Code: ${code}, Signal: ${signal}. Error: ${err.message}. Stderr: ${errorOutput.substring(0, 500)}...`)); // Include stderr snippet
        }
        if (code !== 0) {
           console.error(`Python script exited with code ${code}.`);
           console.error('Stderr:', errorOutput); // Log stderr for debugging
           return reject(new Error(`Prediction script failed with exit code ${code}. Stderr: ${errorOutput.substring(0, 500)}...`)); // Include stderr snippet
        }
        if (results === null) {
           console.error('Python script finished but did not produce results.');
           console.error('Stderr:', errorOutput); // Log stderr for debugging
           return reject(new Error('Prediction script finished without returning results. Check script output and errors.'));
        }
        console.log('Python script finished successfully.');
        resolve(results);
      });
    });

    return NextResponse.json({ data: predictions });

  } catch (error: unknown) {
    console.error('Error in /api/predict:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during prediction.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

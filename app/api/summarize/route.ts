import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";
import 'dotenv/config'; // Ensure environment variables are loaded

// Instantiate Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192'; // Default to llama3-8b

/**
 * POST handler for the /api/summarize endpoint.
 * Takes processed patient data, sends it to Groq for summarization,
 * and returns the generated summary.
 */
export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in the environment variables.');
    return NextResponse.json({ error: 'API key configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const processedData = body.data; // Assuming the data is sent under the 'data' key

    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      return NextResponse.json({ error: 'No processed data provided.' }, { status: 400 });
    }

    // Simple string representation for the prompt.
    // For large datasets, consider sending only statistics or a sample.
    const dataString = JSON.stringify(processedData.slice(0, 20), null, 2); // Send first 20 records as example

    const prompt = `Please provide a concise summary of the following healthcare dataset. Focus on key characteristics like the number of patients, common conditions, age distribution hints, and readmission rates if apparent. Do not just list the data back. Dataset sample:

${dataString}

Summary:`;

    console.log(`Sending request to Groq model: ${GROQ_MODEL}`);

    // Replace fetch call with Groq SDK call
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes healthcare data."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 250, // Limit response length
      top_p: 1,
      stop: null,
      stream: false,
    });

    console.log('Received response from Groq.');

    // Extract the summary text
    const summary = chatCompletion.choices[0]?.message?.content?.trim() || 'Could not extract summary from Groq response.';

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error in /api/summarize (Groq):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Provide more detail if it's a Groq API error
    if (error instanceof Groq.APIError) {
        return NextResponse.json({ error: `Groq API error: ${error.status} ${error.name}`, details: error.message }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: 'Internal server error while generating summary.', details: errorMessage }, { status: 500 });
  }
}

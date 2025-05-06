import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";
import 'dotenv/config'; // Ensure environment variables are loaded

// Instantiate Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const GROQ_MODEL = process.env.GROQ_CHAT_MODEL || 'llama3-8b-8192'; // Use a separate env var or fallback

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * POST handler for the /api/chat endpoint.
 * Takes chat history and a data summary, sends it to Groq, 
 * and returns the AI's response.
 */
export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in the environment variables.');
    return NextResponse.json({ error: 'API key configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    const dataSummary: string = body.dataSummary || 'No data summary provided.'; // Get summary from request

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    // Construct the system prompt including the data summary context
    const systemPrompt = `You are a helpful healthcare assistant. Answer the user's question based on the conversation history. 
If the question seems related to the specific healthcare dataset summarized below, prioritize using that information in your answer. Otherwise, answer general healthcare questions accurately. 
Do not mention the summary directly unless the user asks about it.

Dataset Summary:
---
${dataSummary}
---
`;

    // Prepare messages for Groq: add system prompt before the history
    const groqMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages // Include the existing chat history
    ];

    console.log(`Sending request to Groq chat model: ${GROQ_MODEL} with ${groqMessages.length} messages.`);

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: GROQ_MODEL,
      temperature: 0.7, // Allow slightly more creativity for chat
      max_tokens: 500, 
      top_p: 1,
      stop: null,
      stream: false,
    });

    console.log('Received response from Groq chat.');

    const assistantResponse = chatCompletion.choices[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response: assistantResponse });

  } catch (error) {
    console.error('Error in /api/chat (Groq):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    if (error instanceof Groq.APIError) {
        return NextResponse.json({ error: `Groq API error: ${error.status} ${error.name}`, details: error.message }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: 'Internal server error while generating chat response.', details: errorMessage }, { status: 500 });
  }
}

"use client"

import React, { useState, useEffect, useRef } from 'react';
import { CSVUploader } from '@/components/csv-uploader';
import { parseCSVData, type PatientRecord } from '@/lib/data-parser'; 
import { Button } from '@/components/ui/button'; 
import { AlertCircle, CheckCircle, Download, Loader2, Send, User, Bot } from 'lucide-react'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Breadcrumb } from '@/components/breadcrumb';
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm';
import { Input } from '@/components/ui/input'; 
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 

// Define Chat Message Type
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ModelPage() {
  const [csvData, setCsvData] = useState<string | null>(null); 
  // Use the updated PatientRecord type which includes optional prediction fields
  const [parsedData, setParsedData] = useState<PatientRecord[] | null>(null); 
  const [parsingError, setParsingError] = useState<string | null>(null); 
  const [summary, setSummary] = useState<string | null>(null); 
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false); 
  const [summarizeError, setSummarizeError] = useState<string | null>(null); 

  // Prediction State
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);


  const generateSummary = async (data: PatientRecord[]) => {
    setIsSummarizing(true);
    setSummary(null);
    setSummarizeError(null);
    console.log("Initiating summary generation...");

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: data }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Summary received:", result.summary);
      setSummary(result.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during summarization.';
      setSummarizeError(`Failed to generate summary: ${message}. Ensure Ollama (qwen3) is running.`);
      setSummary(null);
    } finally {
      setIsSummarizing(false);
    }
  };

  // --- PREDICTION FUNCTIONALITY ---
  const getPredictions = async (dataToPredict: PatientRecord[]) => {
    if (!dataToPredict || dataToPredict.length === 0) return;

    setIsPredicting(true);
    setPredictError(null);
    console.log("Initiating prediction...");

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToPredict), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Predictions received:", result.data.length);
      // Update the parsedData state with the data containing predictions
      setParsedData(result.data);
      
      // Optionally, trigger summary generation *after* getting predictions
      await generateSummary(result.data);

    } catch (error) {
      console.error("Error getting predictions:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during prediction.';
      setPredictError(`Failed to get predictions: ${message}`);
      setParsedData(dataToPredict); // Revert to data without predictions on error
    } finally {
      setIsPredicting(false);
    }
  };

  // --- CHAT FUNCTIONALITY ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);
    setChatError(null);

    try {
      console.log("Sending chat request with summary:", summary ? summary.substring(0, 100) + '...' : 'No Summary');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: updatedMessages, // Send the history including the latest user message
          dataSummary: summary // Send the current summary for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: result.response };
      setChatMessages([...updatedMessages, assistantMessage]);

    } catch (error) {
      console.error("Error in chat submission:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setChatError(`Failed to get chat response: ${message}`);
      // Optionally add an error message to the chat
      // setChatMessages([...updatedMessages, { role: 'assistant', content: `Error: ${message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  // --- END CHAT FUNCTIONALITY ---


  const handleUploadSuccess = async (csvContent: string) => {
    console.log("CSV data received in ModelPage:", csvContent.substring(0, 100) + '...');
    setCsvData(csvContent);
    setParsedData(null); 
    setParsingError(null); 
    setSummary(null); 
    setSummarizeError(null);
    setIsSummarizing(false);
    setPredictError(null); // Clear prediction error on new upload

    // Reset chat when new CSV is uploaded
    setChatMessages([]);
    setChatError(null);

    try {
      console.log("Parsing CSV data...");
      const data = parseCSVData(csvContent);
      console.log(`Parsed ${data.length} records.`);
      setParsedData(data); 
      setCsvData(csvContent); // Store original CSV for download if needed

      // Trigger prediction AFTER successful parsing
      // generateSummary will be called within getPredictions upon success
      await getPredictions(data); 

      // // Trigger summary generation using the parsed data
      // await generateSummary(data);

    } catch (error) {
      console.error("Error parsing CSV:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during parsing.';
      setParsingError(`Failed to parse CSV: ${message}`);
      setCsvData(null);
      setParsedData(null);
    }
  };

  const handleDownload = () => {
    if (!parsedData) return;

    // Define headers - include prediction columns if they exist
    const headers = [
      'PatientID', 'Age', 'LengthOfStay', 'TotalConditions', 
      'TotalMedications', 'TotalProcedures', 'IsReadmission', 
      'HasDiabetes', 'HasHypertension', 'HasHeartDisease', 
      'HasCopd', 'HasAsthma', 'HasCancer', 
      'Gender', 'Race', 'Ethnicity',
      // Conditionally add prediction headers
      ...(parsedData[0]?.prediction !== undefined ? ['Prediction'] : []),
      ...(parsedData[0]?.predictionProbability !== undefined ? ['PredictionProbability'] : []),
    ];
    
    const csvRows = [
      headers.join(','),
      ...parsedData.map(record => [
        record.patientId, // Use patientId if available, otherwise id
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
        record.ethnicity,
        // Conditionally add prediction values
        ...(record.prediction !== undefined ? [record.prediction] : []),
        ...(record.predictionProbability !== undefined ? [record.predictionProbability.toFixed(4)] : []), // Format probability
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    // Include prediction status in filename
    const filename = parsedData[0]?.prediction !== undefined ? 'patient_data_with_predictions.csv' : 'patient_data.csv';
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <Breadcrumb items={[{ label: "Model" }]} />

      {/* Use container and centering for the main content area below breadcrumbs */}
      <div className="container mx-auto p-6 flex flex-col items-center space-y-6">
        {/* Card for CSV Upload and Preview - apply width constraints */}
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Model - Predict Hospital Readmissions</CardTitle>
            <CardDescription>
              Upload your patient data CSV to analyze and predict potential hospital readmissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CSVUploader onUploadSuccess={handleUploadSuccess} />
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

                    <div className="mt-4">
                      <h3 className="text-md font-semibold mb-2">Data Preview (First 5 Records)</h3>
                      <div className="rounded-md border max-h-60 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient ID</TableHead>
                              <TableHead>Age</TableHead>
                              <TableHead>Readmitted</TableHead>
                              {/* Add Prediction Headers Conditionally */}
                              {parsedData?.[0]?.prediction !== undefined && (
                                <TableHead>Prediction</TableHead>
                              )}
                              {parsedData?.[0]?.predictionProbability !== undefined && (
                                <TableHead>Probability</TableHead>
                              )}
                              <TableHead>Length of Stay</TableHead>
                              <TableHead>Total Conditions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedData.slice(0, 5).map((patient) => (
                              <TableRow key={patient.id}>
                                <TableCell>{patient.patientId ?? patient.id}</TableCell>
                                <TableCell>{patient.age}</TableCell>
                                <TableCell>{patient.isReadmission ? 'Yes' : 'No'}</TableCell>
                                {/* Add Prediction Cells Conditionally */}
                                {patient.prediction !== undefined && (
                                  <TableCell className={patient.prediction === 1 ? 'font-bold text-orange-600' : ''}>
                                    {patient.prediction === 1 ? 'Yes' : 'No'}
                                  </TableCell>
                                )}
                                {patient.predictionProbability !== undefined && (
                                  <TableCell>{patient.predictionProbability.toFixed(3)}</TableCell>
                                )}
                                <TableCell>{patient.lengthOfStay.toFixed(2)}</TableCell>
                                <TableCell>{patient.totalConditions}</TableCell>
                                <TableCell>{patient.totalMedications}</TableCell>
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
          </CardContent>
        </Card>

        {/* Prediction Loading/Error Display */} 
        {isPredicting && (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating predictions...</span>
          </div>
        )}
        {predictError && (
          <Card className="w-full max-w-4xl mt-4 border-destructive bg-red-50">
             <CardHeader className="flex flex-row items-center space-x-3 pb-2 pt-3">
                <AlertCircle className="h-6 w-6 text-destructive"/>
                <CardTitle className="text-lg text-destructive">Prediction Error</CardTitle>
             </CardHeader>
             <CardContent className="pb-3">
                <p className="text-sm text-destructive">{predictError}</p>
                <p className="text-xs text-gray-500 mt-1">Please check the console or server logs for more details. The model might be missing or there could be an issue with the Python environment.</p>
            </CardContent>
          </Card>
        )}

        {/* Only show Summary card if prediction is done (or wasn't needed/failed) and summarization is complete */} 
        {summary && !isSummarizing && !isPredicting && (
          <Card className="w-full max-w-4xl mt-6">
            <CardHeader>
              <CardTitle>AI Data Summary</CardTitle>
              <CardDescription>Generated by Groq</CardDescription>
            </CardHeader>
            <CardContent>
              {isSummarizing && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating summary...</span>
                </div>
              )}
              {summarizeError && (
                <div className="flex items-start gap-3 text-destructive bg-red-50 p-3 rounded-md border border-red-200">
                  <AlertCircle size={20} className="flex-shrink-0 mt-1"/>
                  <div>
                    <p className="font-medium">Error Generating Summary</p>
                    <p className="text-sm">{summarizeError}</p>
                  </div>
                </div>
              )}
              {summary && !isSummarizing && (
                // Apply styling to a container div
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]} // Enable GFM features
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Only show Chat if Summary exists and we are not predicting */} 
        {summary && !isSummarizing && !isPredicting && (
          <Card className="w-full max-w-4xl mt-6">
            <CardHeader>
              <CardTitle>Chat with AI</CardTitle>
              <CardDescription>Ask questions about the data summary or general healthcare topics.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full pr-4 mb-4 border rounded-md p-4" ref={chatContainerRef}>
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback><Bot size={16} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[75%] prose prose-sm max-w-none dark:prose-invert break-words ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'}`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Optional: customize rendering if needed
                          p: ({ node, ...props }) => <p className="mb-0" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback><User size={16} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Assistant is thinking...</span>
                  </div>
                )}
                {chatError && (
                   <div className="mt-4 flex items-start gap-3 text-destructive bg-red-50 p-3 rounded-md border border-red-200">
                    <AlertCircle size={20} className="flex-shrink-0 mt-1"/>
                    <div>
                      <p className="font-medium">Chat Error</p>
                      <p className="text-sm">{chatError}</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <form onSubmit={handleChatSubmit} className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isChatLoading || !chatInput.trim()} size="icon">
                  {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        {/* --- END CHAT INTERFACE --- */}
      </div>
    </>
  );
}

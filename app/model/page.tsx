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
  const [parsedData, setParsedData] = useState<PatientRecord[] | null>(null); 
  const [parsingError, setParsingError] = useState<string | null>(null); 
  const [summary, setSummary] = useState<string | null>(null); 
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false); 
  const [summarizeError, setSummarizeError] = useState<string | null>(null); 

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


  const handleUploadSuccess = (csvContent: string) => {
    console.log("CSV data received in ModelPage:", csvContent.substring(0, 100) + '...');
    setCsvData(csvContent);
    setParsedData(null); 
    setParsingError(null); 
    setSummary(null); 
    setSummarizeError(null);
    setIsSummarizing(false);

    // Reset chat when new CSV is uploaded
    setChatMessages([]);
    setChatError(null);

    try {
      const results = parseCSVData(csvContent);
      if (results.length === 0) {
        setParsingError("No valid patient records found in the uploaded CSV. Please check the file format and content.");
      } else {
        setParsedData(results);
        console.log(`Successfully parsed ${results.length} records.`);
        generateSummary(results);
      }
    } catch (error) {
      console.error("Error parsing CSV data:", error);
      setParsingError(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure the format is correct.`);
      setParsedData(null);
    }
  };

  const handleDownload = () => {
    if (!parsedData) return;

    const header = [
      'Patient_ID', 'AGE', 'Length_Of_Stay_DAYS', 'Total_Conditions', 'Total_Medications',
      'Total_Procedures', 'Is_Readmission', 'Has_Diabetes', 'Has_Hypertension',
      'Has_Heart_Disease', 'Has_COPD', 'Has_Asthma', 'Has_Cancer',
      'Gender', 'Race', 'Ethnicity'
    ];

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
      const stringValue = String(value);
      return /[,\"\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
    }).join(','));
    
    const csvContent = [header.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { 
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
          </CardContent>
        </Card>

        {(isSummarizing || summary || summarizeError) && (
          /* AI Summary Card - apply width constraints */
          <Card className="w-full max-w-4xl">
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
        
        {/* --- CHAT INTERFACE --- */}
        {summary && !isSummarizing && (
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

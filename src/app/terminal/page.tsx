// src/app/terminal/page.tsx
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, FileText, UploadCloud, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments, type DocumentInput } from "@/ai/flows/analyze-documents-flow";


export default function TerminalPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setDocuments(prev => [...prev, ...acceptedFiles]);
    },
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    }
  });

  const removeDocument = (fileName: string) => {
    setDocuments(prev => prev.filter(f => f.name !== fileName));
  };
  
  const handleGenerate = async () => {
    if (!question) {
      toast({ title: "Question is required", variant: "destructive" });
      return;
    }
    if (documents.length === 0) {
      toast({ title: "Please upload at least one document to analyze.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      // Convert files to base64 data URIs for the AI flow
      const documentInputs: DocumentInput[] = await Promise.all(
        documents.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                name: file.name,
                content: event.target?.result as string,
              });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });
        })
      );
      
      const result = await analyzeDocuments({ question, documents: documentInputs });
      setResponse(result.answer);

    } catch (error: any) {
      console.error("Error generating response:", error);
      toast({
        title: "Error Generating Response",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setResponse("Failed to generate a response. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Terminal</h1>
        <Button onClick={handleGenerate} disabled={isLoading || !question || documents.length === 0}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </div>
      
      {/* Top row: Question */}
      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Question Box */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="Ask a question based on the uploaded documents..."
                className="h-full min-h-[240px] resize-none bg-input/50 pr-28"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !question || documents.length === 0}
                className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-lg bg-zinc-200/10 px-4 py-2 text-sm font-medium text-zinc-100 ring-1 ring-inset ring-[#262a33] transition hover:bg-zinc-200/20 focus:outline-none focus:ring-2 focus:ring-[#6B46FF] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Middle row: Response */}
       <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="The generated email response will appear here..."
                className="h-96 resize-none bg-input/50 pr-28"
                value={response}
                readOnly
              />
               <button
                  type="button"
                  className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-lg bg-zinc-200/10 px-4 py-2 text-sm font-medium text-zinc-100 ring-1 ring-inset ring-[#262a33] transition hover:bg-zinc-200/20 focus:outline-none focus:ring-2 focus:ring-[#6B46FF]"
               >
                  Generate
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Bottom Row: Documents Used */}
       <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Documents Used</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 && !isLoading && (
               null
            )}
             {documents.length > 0 && (
                <ul className="space-y-2">
                    {documents.map(doc => (
                        <li key={doc.name} className="flex items-center text-sm text-muted-foreground bg-black/30 p-2 rounded-md">
                           <FileText className="h-4 w-4 mr-2 shrink-0"/> <span className="truncate">{doc.name}</span>
                        </li>
                    ))}
                </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

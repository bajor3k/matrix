// src/app/terminal/page.tsx
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, FileText, UploadCloud, X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments, type DocumentInput } from "@/ai/flows/analyze-documents-flow";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export default function TerminalPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const { toast } = useToast();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });

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

    // Validation for account numbers
    const accountPattern = /(PZG|PT8)\d{6}/i;
    if (accountPattern.test(question)) {
      setErrorMessage({
        title: "Protected Information Detected",
        description: "Account numbers cannot be submitted for an AI response. Please remove any sensitive information before proceeding.",
      });
      setIsErrorModalOpen(true);
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

  const createMailtoLink = () => {
    const to = "jbajorek@sanctuarywealth.com";
    const subject = encodeURIComponent(`Response regarding: ${question.substring(0, 50)}...`);
    const body = encodeURIComponent(response);
    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Terminal</h1>
        <Button variant="secondary" onClick={handleGenerate} disabled={isLoading || !question || documents.length === 0}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="Ask a question based on the uploaded documents..."
                className="h-full min-h-[320px] resize-none bg-input/50 pr-28"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !question || documents.length === 0}
                className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Response Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="The generated response will appear here..."
                className="h-full min-h-[320px] resize-none bg-input/50 pr-28"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
               <a
                  href={createMailtoLink()}
                  aria-disabled={!response}
                  className={`absolute bottom-4 right-4 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring ${!response ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  <Mail className="mr-2 h-4 w-4" />
                  Create Email
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Documents Used Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Documents Used</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div
                {...getRootProps()}
                className="min-h-[150px] rounded-md border border-dashed border-border/50 bg-input/30 p-4 text-center text-muted-foreground flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors"
              >
                <input {...getInputProps()} />
                <UploadCloud className="h-8 w-8 mb-2" />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag & drop files here, or click to select</p>
                )}
                <p className="text-xs mt-1">PDF, TXT, MD supported</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {documents.map(doc => (
                  <li key={doc.name} className="flex items-center justify-between text-sm text-foreground bg-black/30 p-2 rounded-md">
                    <div className="flex items-center truncate">
                      <FileText className="h-4 w-4 mr-2 shrink-0 text-muted-foreground"/> 
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" onClick={() => removeDocument(doc.name)} />
                    </Button>
                  </li>
                ))}
                <li {...getRootProps()} className="flex items-center justify-center text-sm text-foreground bg-black/30 p-2 rounded-md mt-2 cursor-pointer hover:bg-muted/20">
                   <input {...getInputProps()} />
                   <UploadCloud className="h-4 w-4 mr-2 text-muted-foreground"/> Add more documents...
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorMessage.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorModalOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}

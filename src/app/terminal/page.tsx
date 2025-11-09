
// src/app/terminal/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, FileText, UploadCloud, X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments, type DocumentInput } from "@/ai/flows/analyze-documents-flow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export default function TerminalPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [sourceDocument, setSourceDocument] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const { toast } = useToast();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });
  const [isSsnModalOpen, setIsSsnModalOpen] = useState(false);
  const [responseMode, setResponseMode] = useState<"simple" | "bullets" | "standard">("standard");

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
  
  const proceedWithGeneration = async (mode: "simple" | "bullets" | "standard") => {
    setIsLoading(true);
    setResponse("");
    setSourceDocument("");
    setResponseMode(mode);

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
      setSourceDocument(result.sourceDocument);

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

  const handleGenerate = async (mode: "simple" | "bullets" | "standard", bypassSsnCheck = false) => {
    if (!question) {
      toast({ title: "Question is required", variant: "destructive" });
      return;
    }
    if (documents.length === 0 && !sourceDocument) {
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
    
    // SSN/EIN validation
    const ssnEinPattern = /(\d{3}-?\d{2}-?\d{4})|(\d{9})/;
    if (!bypassSsnCheck && ssnEinPattern.test(question)) {
      setIsSsnModalOpen(true);
      return;
    }

    proceedWithGeneration(mode);
  };

  const createMailtoLink = () => {
    const to = "jbajorek@sanctuarywealth.com";
    const subject = encodeURIComponent(`Response regarding: ${question.substring(0, 50)}...`);
    
    const bodyContent = `
${response}

---
Reminder: Please attach the following document:
 - ${sourceDocument}
    `;
    const body = encodeURIComponent(bodyContent.trim());

    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <div className="flex flex-col gap-6">
        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                id="question"
                placeholder="Ask a question based on the uploaded documents..."
                className="h-full min-h-[320px] resize-none bg-input/50"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleGenerate("simple")}
                  disabled={isLoading}
                  className="bg-secondary text-secondary-foreground ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  Simple
                </Button>
                <Button
                  onClick={() => handleGenerate("bullets")}
                  disabled={isLoading}
                   className="bg-secondary text-secondary-foreground ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  Bullet Points
                </Button>
                <Button
                  onClick={() => handleGenerate("standard")}
                  disabled={isLoading}
                   className="bg-secondary text-secondary-foreground ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  Standard
                </Button>
              </div>
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
                  href={response ? createMailtoLink() : undefined}
                  aria-disabled={!response}
                  onClick={(e) => !response && e.preventDefault()}
                  className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
             {sourceDocument ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-foreground bg-black/30 p-2 rounded-md">
                        <div className="flex items-center truncate">
                        <FileText className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{sourceDocument}</span>
                        </div>
                    </div>
                    <Button variant="link" className="text-xs h-auto p-0 text-primary" onClick={() => {
                        setSourceDocument('');
                        setDocuments([]);
                    }}>
                        Use different documents
                    </Button>
                </div>
             ) : documents.length === 0 ? (
              <div
                {...getRootProps()}
                className="min-h-[150px] rounded-md border border-dashed border-border/50 bg-input/30 p-4 text-center text-foreground flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors"
              >
                <input {...getInputProps()} />
                <UploadCloud className="h-8 w-8 mb-2 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-muted-foreground">Drop the files here ...</p>
                ) : (
                  <p className="text-muted-foreground">Drag & drop files here, or click to select</p>
                )}
                <p className="text-xs mt-1 text-muted-foreground">PDF, TXT, MD supported</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {documents.map(doc => (
                  <li key={doc.name} className="flex items-center justify-between text-sm text-foreground bg-black/30 p-2 rounded-md">
                    <div className="flex items-center truncate">
                      <FileText className="h-4 w-4 mr-2 shrink-0 text-muted-foreground"/> 
                      <span className="truncate text-foreground">{doc.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" onClick={() => removeDocument(doc.name)} />
                    </Button>
                  </li>
                ))}
                <li {...getRootProps()} className="flex items-center justify-center text-sm text-foreground bg-black/30 p-2 rounded-md mt-2 cursor-pointer hover:bg-muted/20">
                   <input {...getInputProps()} />
                   <UploadCloud className="h-4 w-4 mr-2 text-muted-foreground"/> <span className="text-muted-foreground">Add more documents...</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <AlertDialogContent className="bg-destructive text-destructive-foreground border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle>{errorMessage.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive-foreground/90">
              {errorMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorModalOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={isSsnModalOpen} onOpenChange={setIsSsnModalOpen}>
        <AlertDialogContent className="bg-destructive text-destructive-foreground border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle>Protected Information Detected</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive-foreground/90">
              Your question may contain a Social Security Number (SSN) or Employer Identification Number (EIN). These numbers cannot be submitted for an AI response.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsSsnModalOpen(false)}>Go Back & Edit</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsSsnModalOpen(false);
              handleGenerate(responseMode, true);
            }}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}

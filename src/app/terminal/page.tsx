
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
  
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setDropdownOpen(false); }
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative.inline-block.text-left')) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("click", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [dropdownOpen]);


  const removeDocument = (fileName: string) => {
    setDocuments(prev => prev.filter(f => f.name !== fileName));
  };
  
  const proceedWithGeneration = async () => {
    setIsLoading(true);
    setResponse("");
    setSourceDocument("");

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

  const handleGenerate = async (bypassSsnCheck = false) => {
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
    
    // SSN/EIN validation
    const ssnEinPattern = /(\d{3}-?\d{2}-?\d{4})|(\d{9})/;
    if (!bypassSsnCheck && ssnEinPattern.test(question)) {
      setIsSsnModalOpen(true);
      return;
    }

    proceedWithGeneration();
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Terminal</h1>
        <Button variant="secondary" onClick={() => handleGenerate()} disabled={isLoading || !question || documents.length === 0}>
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
                id="question"
                placeholder="Ask a question based on the uploaded documents..."
                className="h-full min-h-[320px] resize-none bg-input/50 pr-28"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="absolute bottom-4 right-4">
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-200/10 px-4 py-2 text-sm font-medium text-zinc-100 ring-1 ring-inset ring-[#262a33] hover:bg-zinc-200/20 focus:outline-none focus:ring-2 focus:ring-[#6B46FF]"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                  >
                    Generate
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute bottom-full right-0 z-20 mb-2 w-44 overflow-hidden rounded-lg border border-[#262a33] bg-[#111214] shadow-xl">
                      <button
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-200/10"
                        onClick={() => { setResponseMode("simple"); setDropdownOpen(false); handleGenerate(); }}
                      >
                        Simple
                      </button>
                      <button
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-200/10"
                        onClick={() => { setResponseMode("bullets"); setDropdownOpen(false); handleGenerate(); }}
                      >
                        Bullet Points
                      </button>
                      <button
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-200/10"
                        onClick={() => { setResponseMode("standard"); setDropdownOpen(false); handleGenerate(); }}
                      >
                        Standard
                      </button>
                    </div>
                  )}
                </div>
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
                readOnly
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
            {documents.length === 0 ? (
              <div
                {...getRootProps()}
                className="min-h-[150px] rounded-md border border-dashed border-border/50 bg-input/30 p-4 text-center text-foreground flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors"
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
              handleGenerate(true);
            }}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}

// src/app/terminal-2-0/page.tsx
"use client";

import { useState } from "react";
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Send, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments, type AnalyzeDocumentsInput } from "@/ai/flows/analyze-documents-flow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import ResponseFeedback from "@/components/ResponseFeedback";
import { type SourceLite } from "@/lib/training";

type Source = {
    filename: string;
    url: string;
    pageNumber?: number;
    quote?: string;
};

export default function Terminal2Page() {
  const [question, setQuestion] = useState("");
  const [emailDraft, setEmailDraft] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  const [isSsnModalOpen, setIsSsnModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });
  
  const { toast } = useToast();

  async function generate(payload?: { question: string, preferSeed?: string }) {
    const questionToAsk = payload?.preferSeed || payload?.question || question;
    if (!questionToAsk.trim()) {
      toast({ title: "Please enter a question.", variant: "destructive" });
      return;
    }

    const accountPattern = /(PZG|PT8)\d{6}/i;
    if (accountPattern.test(questionToAsk)) {
      setErrorMessage({
        title: "Protected Information Detected",
        description: "Account numbers cannot be submitted for an AI response. Please remove any sensitive information before proceeding.",
      });
      setIsErrorModalOpen(true);
      return;
    }
    
    const ssnEinPattern = /\b\d{3}-?\d{2}-?\d{4}\b|\b\d{9}\b/;
    if (ssnEinPattern.test(questionToAsk) && !payload?.preferSeed) {
      setIsSsnModalOpen(true);
      return;
    }

    setLoading(true);
    const mode: AnalyzeDocumentsInput['mode'] = "bullets"; // Always use bullets mode

    setEmailDraft("");
    setSources([]);
    setConfidence(null);
    setLoadingMessage("Analyzing documents and generating response...");

    try {
        const result = await analyzeDocuments({ question: questionToAsk, mode });

        if (result.answer) {
            setEmailDraft(result.answer);
        } else {
             toast({
                title: "No Answer Generated",
                description: "The AI model could not find a relevant answer in the documents.",
                variant: "default",
            });
            setEmailDraft("The AI model could not find a relevant answer in the provided documents.");
        }
        
        if (result.sourceDocument && result.sourceDocument.name) {
             setSources([{
                filename: result.sourceDocument.name,
                pageNumber: result.sourceDocument.pageNumber,
                url: result.sourceDocument.url,
                quote: result.sourceDocument.quote,
             }]);
        }
        setConfidence(result.confidence ?? null);

    } catch (e: any) {
        console.error("Process failed", e);
        const errorMessage = e.message || "An unknown error occurred.";
        
        toast({
            title: "An Error Occurred",
            description: errorMessage,
            variant: "destructive",
        });
        setEmailDraft(`Sorry, I was unable to generate a response. Reason: ${errorMessage}`);
    } finally {
        setLoading(false);
        setLoadingMessage("");
    }
  }

  const handleGenerateClick = () => {
    generate({ question });
  }

  const createMailtoLink = () => {
    if (!emailDraft || loading) return undefined;
    const to = "jbajorek@sanctuarywealth.com";
    const subject = encodeURIComponent(`Response regarding: ${question.substring(0, 50)}...`);
    const body = encodeURIComponent(emailDraft.trim());
    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const liteSources: SourceLite[] = sources.map((s, i) => ({
    id: s.url || String(i),
    title: s.filename,
    page: s.pageNumber,
  }));

  return (
    <>
     <Script src="https://cdn.jsdelivr.net/npm/pdf-parse@1.1.1/lib/pdf.min.js" strategy="beforeInteractive" />
     
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                id="question"
                placeholder="Ask a question based on the procedure documents..."
                className="h-full min-h-[240px] resize-none bg-input/50"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-4">
               <div className="flex items-center gap-2">
                <Button
                  onClick={handleGenerateClick}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/80"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between">
            <CardTitle className="text-base font-bold">Response</CardTitle>
            {loading ? (
                <div className="w-36 h-8 rounded animate-pulse bg-muted/50" />
            ) : (
                <ConfidenceBadge value={confidence} />
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              placeholder={loading ? loadingMessage : "The generated response will appear here..."}
              className="h-full min-h-[360px] resize-none bg-input/50"
              value={loading ? loadingMessage : emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              readOnly={loading}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center w-full">
              {!loading && emailDraft && (
                <ResponseFeedback
                  question={question}
                  answer={emailDraft}
                  confidence={confidence ?? undefined}
                  sources={liteSources}
                  uiVariant={"bullets"}
                  model="gemini-1.5-pro"
                  appVersion="1.0.0"
                  promptId="doc-analysis-v1"
                  onRegenerate={(seed) => generate({ question, preferSeed: seed })}
                />
              )}
              <a
                  href={createMailtoLink()}
                  aria-disabled={!emailDraft || loading}
                  onClick={(e) => {
                      if (!emailDraft || loading) {
                          e.preventDefault();
                      }
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
               >
                  <Mail className="mr-2 h-4 w-4" />
                  Create Email
              </a>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Documents Used</CardTitle>
          </CardHeader>
          <CardContent>
             {sources.length === 0 && !loading ? (
                <div
                    className="min-h-[150px] rounded-md border border-dashed border-border/50 bg-input/30 p-4 text-center text-foreground flex flex-col items-center justify-center"
                >
                    <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Source documents will appear here after generation.</p>
                </div>
             ) : loading ? (
                <div className="min-h-[150px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : (
              <div className="space-y-2">
                {sources.map((s, i) => (
                  <div key={i} className="flex flex-col items-start justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="text-sm w-full">
                      <div className="font-medium text-foreground">
                        {s.filename}
                        {s.pageNumber && <span className="text-muted-foreground"> • p.{s.pageNumber}</span>}
                      </div>
                    </div>
                     {s.quote && (
                        <blockquote className="mt-2 pl-3 border-l-2 border-primary/50 text-sm text-muted-foreground italic">
                            "{s.quote}"
                        </blockquote>
                    )}
                  </div>
                ))}
              </div>
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
              generate({ question });
            }}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
    </>
  );
}

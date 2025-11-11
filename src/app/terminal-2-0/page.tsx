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

export const runtime = "nodejs";

type SourceDoc = {
    name?: string;
    pageNumber?: number;
    url?: string;
    quote?: string;
};

export default function Terminal2Page() {
  const [question, setQuestion] = useState("");
  const [emailDraft, setEmailDraft] = useState<string>("");
  const [sourceDocument, setSourceDocument] = useState<SourceDoc | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  const [isSsnModalOpen, setIsSsnModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });
  
  const { toast } = useToast();

  function splitSubjectBody(draft: string) {
    // Expect lines like: "Subject: <...>" then body
    const lines = (draft || "").split(/\r?\n/);
    const first = lines.findIndex(l => /^subject\s*:/i.test(l));
    if (first >= 0) {
      const subjectLine = lines[first].replace(/^subject\s*:\s*/i, "").trim();
      const body = [...lines.slice(0, first), ...lines.slice(first + 1)].join("\n").trim();
      return { subject: subjectLine || "Response", body };
    }
    // Fallback: synthesize a subject from the question
    return { subject: (question || "Response").trim(), body: draft.trim() };
  }

  function buildFooter(src: SourceDoc | null) {
    if (!src?.name) return "";
    const page = src.pageNumber ? ` (p. ${src.pageNumber})` : "";
    return `\n\n—\nSource: ${src.name}${page}`;
  }

  async function createEmail() {
    const { subject, body } = splitSubjectBody(emailDraft);
    const footer = buildFooter(sourceDocument);
    const finalBody = `${body}${footer}`;

    // 1) Try mailto (Outlook will pick it up). Watch URL length.
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;
    if (mailto.length < 1800) {
      window.location.href = mailto;
    }

    // 2) Always copy to clipboard as backup (user can paste into compose).
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${finalBody}`);
      toast({
        title: "Copied to Clipboard",
        description: "The email content has been copied to your clipboard.",
      });
    } catch (_) {
      // Ignore clipboard errors
    }
  }

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
    setSourceDocument(null);
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
             setSourceDocument(result.sourceDocument);
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
  
  const liteSources: SourceLite[] = sourceDocument ? [{
    id: sourceDocument.url || sourceDocument.name,
    title: sourceDocument.name,
    page: sourceDocument.pageNumber,
  }] : [];

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
           <CardFooter className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    {!loading && emailDraft && (
                        <ResponseFeedback
                        question={question}
                        answer={emailDraft}
                        confidence={confidence ?? undefined}
                        sources={liteSources}
                        uiVariant={"bullets"}
                        model="gemini-1.5-pro"
                        promptId="doc-analysis-v1"
                        onRegenerate={(seed) => generate({ question, preferSeed: seed })}
                        />
                    )}
                </div>
                <Button
                    onClick={createEmail}
                    disabled={!emailDraft || loading}
                    variant="outline"
                >
                    <Mail className="mr-2 h-4 w-4" />
                    Create Email
                </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Documents Used</CardTitle>
          </CardHeader>
          <CardContent>
             {sourceDocument === null && !loading ? (
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
                {sourceDocument && (
                  <div className="flex flex-col items-start justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="text-sm w-full">
                      <div className="font-medium text-foreground">
                        {sourceDocument.name}
                        {sourceDocument.pageNumber && <span className="text-muted-foreground"> • p.{sourceDocument.pageNumber}</span>}
                      </div>
                    </div>
                     {sourceDocument.quote && (
                        <blockquote className="mt-2 pl-3 border-l-2 border-primary/50 text-sm text-muted-foreground italic">
                            "{sourceDocument.quote}"
                        </blockquote>
                    )}
                  </div>
                )}
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

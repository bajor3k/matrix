
// src/app/terminal/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, FileText, UploadCloud, X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export default function TerminalPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isSsnModalOpen, setIsSsnModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });

  const [emailDraft, setEmailDraft] = useState<string>("");
  const [sources, setSources] = useState<{filename: string; page: string; snippet: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseMode, setResponseMode] = useState<"simple" | "bullets" | "standard">("standard");

  const { toast } = useToast();

  async function generate(mode: "simple" | "bullets" | "standard") {
    if (!question.trim()) {
      toast({ title: "Question is required", variant: "destructive" });
      return;
    };
    
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
    if (ssnEinPattern.test(question)) {
      setIsSsnModalOpen(true);
      return;
    }

    setLoading(true);
    setResponseMode(mode);
    setEmailDraft("");
    setSources([]);

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });
      if (!res.ok) {
        throw new Error(`The generation service returned an error: ${res.statusText}`);
      }
      const data = await res.json();
      setEmailDraft(data.draft || "");
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (e: any) {
      console.error("API Call failed", e);
      setEmailDraft("Error contacting the generation service. Is the Python server running?");
      setSources([]);
      toast({
        title: "Service Unavailable",
        description: e.message || "Please ensure the local Python API server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }


  const createMailtoLink = () => {
    const to = "jbajorek@sanctuarywealth.com";
    const subject = encodeURIComponent(`Response regarding: ${question.substring(0, 50)}...`);
    
    // Now uses the generated emailDraft from state
    const body = encodeURIComponent(emailDraft.trim());

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
                  onClick={() => generate("simple")}
                  disabled={loading}
                  className="bg-secondary text-secondary-foreground ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {loading && responseMode === 'simple' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Simple
                </Button>
                <Button
                  onClick={() => generate("bullets")}
                  disabled={loading}
                   className="bg-secondary text-secondary-foreground ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {loading && responseMode === 'bullets' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Bullet Points
                </Button>
                <Button
                  onClick={() => generate("standard")}
                  disabled={loading}
                   className="bg-secondary text-secondary-foreground ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {loading && responseMode === 'standard' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
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
            <div className="flex flex-col items-end">
              <Textarea
                placeholder="The generated response will appear here..."
                className="h-full min-h-[320px] resize-none bg-input/50"
                value={loading ? "Generating..." : emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
              />
               <a
                  href={emailDraft ? createMailtoLink() : undefined}
                  aria-disabled={!emailDraft}
                  onClick={(e) => !emailDraft && e.preventDefault()}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium ring-1 ring-inset ring-border transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
             {sources.length === 0 ? (
                <div
                    className="min-h-[150px] rounded-md border border-dashed border-border/50 bg-input/30 p-4 text-center text-foreground flex flex-col items-center justify-center"
                >
                    <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Source documents will appear here after generation.</p>
                </div>
             ) : (
              <div className="space-y-2">
                {sources.map((s, i) => (
                  <div key={i} className="flex items-start justify-between rounded-lg border border-[#262a33] bg-[#0e0f12] px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-zinc-200">{s.filename} <span className="text-zinc-400">• p.{s.page}</span></div>
                      <div className="text-xs text-zinc-400 line-clamp-2">{s.snippet}</div>
                    </div>
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
              generate(responseMode);
            }}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}
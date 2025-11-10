// src/app/terminal/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, FileText, UploadCloud, X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import ResponseFeedback from "@/components/ResponseFeedback";

type Mode = "simple" | "bullets" | "detailed";

export default function TerminalPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<Mode>("simple");
  const [emailDraft, setEmailDraft] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSsnModalOpen, setIsSsnModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });

  const { toast } = useToast();

  async function generate(payload?: any) {
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

    try {
      setLoading(true);
      setError(null);
      setEmailDraft("");
      setSources([]);
      setConfidence(null);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          mode,
          docs: payload?.docs,
          preferSeed: payload?.preferSeed
        }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) throw new Error(data?.error || text || `HTTP ${res.status}`);

      setEmailDraft(data.draft || "");
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setConfidence(typeof data.confidence === "number" ? data.confidence : null);
    } catch (e: any) {
      setError(e?.message || "Request failed");
      setConfidence(null);
      toast({
        title: "Service Unavailable",
        description: e.message || "Please ensure the API service is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const createMailtoLink = () => {
    const to = "jbajorek@sanctuarywealth.com";
    const subject = encodeURIComponent(`Response regarding: ${question.substring(0, 50)}...`);
    
    const body = encodeURIComponent(emailDraft.trim());

    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const ModeButton = ({ label, value }: {label: string; value: Mode}) => (
    <button
      onClick={() => setMode(value)}
      className={[
        "px-3 py-1.5 rounded-md text-xs border transition-colors",
        mode === value
          ? "border-white/20 bg-white/5 text-gray-100"
          : "border-white/10 text-gray-300 hover:border-white/20"
      ].join(" ")}
      disabled={loading}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <div className="flex flex-col gap-6">
        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="question"
              placeholder="Ask a question based on the uploaded documents..."
              className="h-full min-h-[120px] resize-none bg-input/50"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <ModeButton label="Simple" value="simple" />
              <ModeButton label="Bullet Points" value="bullets" />
              <ModeButton label="Detailed" value="detailed" />
              <button
                onClick={() => generate()}
                className="ml-auto px-3 py-1.5 rounded-md text-xs bg-white/10 border border-white/20 text-gray-100 hover:bg-white/15 disabled:opacity-50"
                disabled={loading || !question.trim()}
              >
                {loading ? "Generating…" : "Generate"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Response Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <CardTitle className="text-base font-bold">Response</CardTitle>
            {loading ? (
              <div className="w-36 h-8 rounded animate-pulse bg-muted/50" />
            ) : (
                <ConfidenceBadge value={confidence ?? undefined} />
            )}
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
              generate();
            }}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}

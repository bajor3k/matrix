// src/app/terminal-2-0/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/firebase/config";
import { ref, getBytes } from "firebase/storage";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { analyzeDocuments } from "@/ai/flows/analyze-documents-flow";

type Source = {
    filename: string;
    page: string; // This will be a placeholder as we aren't getting page-specific data yet
    snippet: string;
};

// Define the GCS paths for the knowledge base PDFs.
const PDF_GCS_PATHS = [
    "gs://matrix-y2jfw.firebasestorage.app/Advisor Services Procedure Guide.pdf",
    "gs://matrix-y2jfw.firebasestorage.app/Asset Movement Grid & LOA Signature Requirements.pdf",
    "gs://matrix-y2jfw.firebasestorage.app/Asset Movement Procedure Guide (3).pdf",
];

export default function Terminal2Page() {
  const [question, setQuestion] = useState("");
  const [emailDraft, setEmailDraft] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [responseMode, setResponseMode] = useState<"simple" | "bullets" | "standard">("standard");

  const { toast } = useToast();

  async function generate(mode: "simple" | "bullets" | "standard") {
    if (!question.trim()) {
      toast({ title: "Please enter a question.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResponseMode(mode);
    setEmailDraft("");
    setSources([]);

    try {
        // Step 1: Fetch and parse PDFs from the client
        setLoadingMessage("Reading procedure documents...");
        const documents = await Promise.all(
            PDF_GCS_PATHS.map(async (path) => {
                const storageRef = ref(storage, path);
                const fileBuffer = await getBytes(storageRef);
                const data = await pdf(fileBuffer);
                return {
                    name: path.substring(path.lastIndexOf('/') + 1),
                    content: data.text,
                };
            })
        );
        
        // Step 2: Call the AI flow with the document content
        setLoadingMessage("Analyzing documents and generating response...");
        const result = await analyzeDocuments({ question, documents });

        if (result.answer) {
            setEmailDraft(result.answer);
        } else {
             toast({
                title: "No Answer Generated",
                description: "The AI model could not find a relevant answer in the documents.",
                variant: "default",
            });
        }
        
        if (result.sourceDocument) {
             setSources([{
                filename: result.sourceDocument,
                page: '1', // Placeholder
                snippet: `Content from ${result.sourceDocument} was used to generate the answer.`
             }]);
        }

    } catch (e: any) {
        console.error("Process failed", e);
        const errorMessage = e.message || "An unknown error occurred.";
        
        let userFriendlyMessage = "Failed to generate a response.";
        if (errorMessage.includes("storage/object-not-found")) {
            userFriendlyMessage = "One of the required PDF documents could not be found in Firebase Storage.";
        } else if (errorMessage.includes("storage/unauthorized")) {
             userFriendlyMessage = "You do not have permission to access the PDF documents. Please ensure you are signed in.";
        }

        toast({
            title: "An Error Occurred",
            description: userFriendlyMessage,
            variant: "destructive",
        });
        setEmailDraft(`Sorry, I was unable to generate a response. Reason: ${userFriendlyMessage}`);
    } finally {
        setLoading(false);
        setLoadingMessage("");
    }
  }

  const createMailtoLink = () => {
    const to = "jbajorek@sanctuarywealth.com";
    const subject = encodeURIComponent(`Response regarding: ${question.substring(0, 50)}...`);
    const body = encodeURIComponent(emailDraft.trim());
    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <>
     {/* We need to include this script tag for the pdf-parse library to work correctly in the browser */}
     <script src="https://cdn.jsdelivr.net/npm/pdf-parse@1.1.1/lib/pdf.min.js" async></script>
     
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
                placeholder="Ask a question based on the procedure documents..."
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
                placeholder={loading ? loadingMessage : "The generated response will appear here..."}
                className="h-full min-h-[320px] resize-none bg-input/50"
                value={loading ? loadingMessage : emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                readOnly={loading}
              />
               <a
                  href={emailDraft && !loading ? createMailtoLink() : undefined}
                  aria-disabled={!emailDraft || loading}
                  onClick={(e) => (!emailDraft || loading) && e.preventDefault()}
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
                  <div key={i} className="flex items-start justify-between rounded-lg border border-[#262a33] bg-[#0e0f12] px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-zinc-200">{s.filename}</div>
                      <div className="text-xs text-zinc-400 line-clamp-2">{s.snippet}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
    </>
  );
}
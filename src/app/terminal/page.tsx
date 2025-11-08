// src/app/terminal/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, FileText } from "lucide-react";

export default function TerminalPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    if (!question) return;
    setIsLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setResponse(
        `Subject: Re: Your Question\n\nDear User,\n\nThank you for your question regarding: "${question.substring(0, 50)}...".\n\nBased on the documents provided, here is a summary of the findings...\n\nSincerely,\nAI Assistant`
      );
      setIsLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Terminal</h1>
        <Button onClick={handleGenerate} disabled={isLoading || !question}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Question Box */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="Paste your question or context here..."
                className="h-96 resize-none bg-input/50 pr-28"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button
                type="button"
                className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-lg bg-zinc-200/10 px-4 py-2 text-sm font-medium text-zinc-100 ring-1 ring-inset ring-[#262a33] transition hover:bg-zinc-200/20 focus:outline-none focus:ring-2 focus:ring-[#6B46FF]"
              >
                Submit
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Email Response Box */}
        <Card className="h-full">
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
                    Send
                </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Used Box */}
      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Documents Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* The content will be populated dynamically later */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

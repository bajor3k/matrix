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
            <CardTitle className="text-base font-bold">Your Question</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your question or context here..."
              className="h-96 resize-none bg-input/50"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Email Response Box */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Generated Email Response</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="The generated email response will appear here..."
              className="h-96 resize-none bg-input/50"
              value={response}
              readOnly
            />
          </CardContent>
        </Card>
      </div>

      {/* Documents Used Box */}
      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documents Used for Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[150px] rounded-md border border-dashed border-border/50 bg-input/30 p-4 text-center text-muted-foreground flex items-center justify-center">
              <p>Source documents and evidence will be displayed here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

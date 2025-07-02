
"use client";

import * as React from 'react';
import Image from "next/image";
import { UserCircle2, Send, Download, Loader2, Brain, RotateCcw, Edit3, FileText, Shield, Laptop, MessageSquareReply, ThumbsUp, Briefcase, ListChecks, UserPlus, StickyNote, Tag as TagIcon } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed, type ActivityCardProps } from "@/components/dashboard/ActivityFeed";

interface ContextTag {
  name: string;
  icon: React.ElementType;
  color: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  contextTag?: ContextTag;
  sourceNote?: string;
  followUpActions?: boolean;
}

const suggestedPrompts = [
  "How do I transfer assets?",
  "What is the death claim process?",
  "Where can I find client suitability rules?",
  "Explain the UMA rebalancing workflow.",
];

const getContextTag = (question: string): ContextTag | undefined => {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes("compliance") || lowerQuestion.includes("suitability") || lowerQuestion.includes("rules")) {
    return { name: "Compliance", icon: Shield, color: "text-purple-400" };
  }
  if (lowerQuestion.includes("transfer") || lowerQuestion.includes("process") || lowerQuestion.includes("workflow") || lowerQuestion.includes("death claim")) {
    return { name: "Operations", icon: FileText, color: "text-blue-400" };
  }
  if (lowerQuestion.includes("platform") || lowerQuestion.includes("system") || lowerQuestion.includes("software")) {
    return { name: "Technology", icon: Laptop, color: "text-green-400" };
  }
  return undefined;
};

const renderTextWithLinks = (text: string) => {
  const parts = text.split(/(\\b\\w+\\.pdf\\b)/gi); // Updated regex
  return parts.map((part, index) => {
    if (/\b\w+\.pdf\b/.test(part)) {
      return (
        <a key={index} href="#" className="text-foreground hover:underline font-medium">
          {part}
        </a>
      );
    }
    return part;
  });
};

const mockActivityFeedData: ActivityCardProps[] = [
  {
    id: 'activity1',
    type: 'contact',
    summary: 'John Smith is a new contact created by Josh Bajorek.',
    user: 'Josh Bajorek',
    timestamp: '2 hours ago',
    tags: ['New Lead', 'Referral'],
  },
  {
    id: 'activity2',
    type: 'opportunity',
    summary: 'Opportunity "ACME Corp Website Redesign" updated.',
    user: 'Sarah Miller',
    timestamp: '5 hours ago',
    stageChange: 'Stage: Qualification to Needs Analysis',
  },
  {
    id: 'activity3',
    type: 'task',
    summary: 'Task "Follow up with Jane Doe" completed by Josh Bajorek.',
    user: 'Josh Bajorek',
    timestamp: '1 day ago',
  },
  {
    id: 'activity4',
    type: 'note',
    summary: 'Added a note to "Client Alpha Portfolio": Discussed Q3 performance and upcoming market volatility.',
    user: 'Maven AI',
    userAvatar: '/icons/brain-logo.png',
    timestamp: '3 days ago',
    details: "Client expressed interest in diversifying into emerging markets. Suggested scheduling a follow-up call."
  },
   {
    id: 'activity5',
    type: 'system',
    summary: 'System successfully ran automated portfolio rebalancing for 15 accounts.',
    user: 'System',
    userAvatar: '/icons/brain-logo.png',
    timestamp: 'Just now',
  },
];


export default function ResourceMatrixPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoadingAiResponse, setIsLoadingAiResponse] = React.useState(false);
  const [currentAiResponseForPdf, setCurrentAiResponseForPdf] = React.useState<string | null>(null);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent, promptText?: string) => {
    if (e) e.preventDefault();
    const messageText = promptText || inputValue;
    if (!messageText.trim()) return;

    const userContextTag = getContextTag(messageText);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      contextTag: userContextTag,
    };
    setMessages(prev => [...prev, newUserMessage]);
    if (!promptText) setInputValue('');
    setIsLoadingAiResponse(true);
    setCurrentAiResponseForPdf(null);

    setTimeout(() => {
      const aiResponseText = `This is a mock AI response to your query about: "${messageText}". 
      
Here are some detailed steps or information:
1. First, you need to verify the account details for procedure_guide.pdf.
2. Then, navigate to the 'Account Actions' section.
3. Select 'Procedure X' and follow the on-screen prompts.
      
For more information, refer to document REF123.pdf or contact support. You can also check compliance_manual.pdf.`;

      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        contextTag: userContextTag, 
        sourceNote: "Based on 'internal_knowledge_base_v2.3.pdf'",
        followUpActions: true,
      };
      setMessages(prev => [...prev, newAiMessage]);
      setCurrentAiResponseForPdf(aiResponseText);
      setIsLoadingAiResponse(false);
    }, 1500);
  };

  const handleFollowUpAction = (actionType: string, originalQuestion: string) => {
    toast({
      title: `Action: ${actionType}`,
      description: `Triggered for question: "${originalQuestion.substring(0,50)}..."`,
    });
  };

  const handleGeneratePdf = () => {
    if (!currentAiResponseForPdf) {
      toast({
        title: "No AI response available",
        description: "Please ask a question first to get instructions.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "PDF Generation Started",
      description: `Sanctuary_Procedure_Instructions.pdf is being generated with the latest AI response.`,
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 md:p-8 flex flex-col space-y-8">
      <div className="flex items-center justify-center space-x-3">
        <Brain className="w-10 h-10 text-gray-400" />
        <span className="text-4xl font-bold text-metallic-gradient">
          Maven
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <PlaceholderCard
          title=""
          className="w-full h-[75vh] md:h-[80vh] flex flex-col bg-black/50 backdrop-blur-md shadow-xl rounded-xl border border-white/10 p-0 sticky top-16" // Added sticky and top-16
        >
          <ScrollArea className="flex-grow rounded-t-xl" viewportRef={scrollViewportRef}>
            <div className="p-4 md:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-3 max-w-[85%] md:max-w-[75%] message-bubble",
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                    msg.sender === 'ai' ? 'message-bubble-ai' : 'message-bubble-user'
                  )}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden self-start bg-black/50 flex items-center justify-center border border-primary/30">
                      <Image src="/icons/brain-logo.png" alt="AI Avatar" width={24} height={24} className="opacity-80" data-ai-hint="AI avatar"/>
                    </div>
                  )}
                  {msg.sender === 'user' && (
                    <UserCircle2 className="w-8 h-8 text-muted-foreground/70 shrink-0 self-start mt-1" />
                  )}
                  <div
                    className={cn(
                      "p-3 text-sm shadow-md break-words rounded-lg",
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted/80 text-foreground rounded-bl-none border border-border/30'
                    )}
                  >
                    {msg.contextTag && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs">
                        <msg.contextTag.icon className={cn("w-3.5 h-3.5", msg.contextTag.color)} />
                        <span className={cn("font-medium", msg.contextTag.color)}>{msg.contextTag.name}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{renderTextWithLinks(msg.text)}</p>
                    <p className="text-xs opacity-70 mt-1.5 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sourceNote && (
                       <p className="text-xs italic text-muted-foreground/80 mt-1.5 pt-1.5 border-t border-border/20">
                        ✅ {msg.sourceNote}
                      </p>
                    )}
                     {msg.sender === 'ai' && msg.followUpActions && (
                      <div className="mt-2 pt-2 border-t border-border/20 flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto bg-transparent hover:bg-primary/10" onClick={() => handleFollowUpAction('Rephrase', msg.text)}>
                          <RotateCcw className="w-3 h-3 mr-1.5" /> Rephrase
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto bg-transparent hover:bg-primary/10" onClick={() => handleFollowUpAction('Add Detail', msg.text)}>
                          <Edit3 className="w-3 h-3 mr-1.5" /> Add Detail
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoadingAiResponse && (
                <div className="flex items-start gap-3 mr-auto max-w-[85%] md:max-w-[75%] message-bubble-ai">
                   <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden self-start bg-black/50 flex items-center justify-center border border-primary/30">
                      <Image src="/icons/brain-logo.png" alt="AI Avatar" width={24} height={24} className="opacity-80" data-ai-hint="AI avatar thinking"/>
                    </div>
                  <div className="p-3 text-sm shadow-md bg-muted/60 text-foreground rounded-lg rounded-bl-none border border-border/30">
                    <div className="flex space-x-1 items-center h-5">
                      <span className="typing-dot"></span>
                      <span className="typing-dot animation-delay-200"></span>
                      <span className="typing-dot animation-delay-400"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-3 md:p-4 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask anything about procedures, account actions, or platform workflows…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-3 h-11 rounded-lg bg-black/70 text-foreground placeholder:text-muted-foreground/80 focus:ring-primary border-transparent ring-1 ring-white/10 focus:ring-2"
                disabled={isLoadingAiResponse}
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/80 text-primary-foreground p-2.5 rounded-lg h-11 w-11 flex items-center justify-center"
                aria-label="Send Message"
                disabled={isLoadingAiResponse || !inputValue.trim()}
              >
                <Brain className="h-5 w-5" />
              </Button>
            </form>
            <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center md:justify-start">
              {suggestedPrompts.map(prompt => (
                <Badge
                  key={prompt}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 text-xs border-border/50 hover:border-primary/50 py-1 px-2.5"
                  onClick={() => { setInputValue(prompt); handleSendMessage(undefined, prompt);}}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        </PlaceholderCard>

        <div className="space-y-8"> {/* Container for the right-hand side cards */}
          {currentAiResponseForPdf && (
            <div className="w-full flex justify-center">
              <Button
                onClick={handleGeneratePdf}
                variant="outline"
                className="bg-black/50 backdrop-blur-md border-white/10 hover:bg-white/20 text-foreground shadow-md hover:shadow-lg rounded-lg"
              >
                <Download className="mr-2 h-4 w-4" /> Download Instructions as PDF
              </Button>
            </div>
          )}

          <PlaceholderCard title="Workspace Activity Feed" className="w-full">
            <ActivityFeed activities={mockActivityFeedData} />
          </PlaceholderCard>
        </div>

      </div>
    </main>
  );
}

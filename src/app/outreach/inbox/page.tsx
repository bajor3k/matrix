
"use client";

import * as React from 'react';
import { Search, Mail, Phone, Send, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict, format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  tags: string[];
}

interface Conversation {
  id: string;
  client: Client;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'client';
  text: string;
  timestamp: Date;
}

const mockClients: Record<string, Client> = {
  'client-1': { id: 'client-1', name: 'Alina Becker', avatarUrl: '', email: 'alina.b@example.com', phone: '(555) 123-4567', tags: ['HNW', 'Referred'] },
  'client-2': { id: 'client-2', name: 'Markus Voss', avatarUrl: '', email: 'markus.v@example.com', phone: '(555) 234-5678', tags: ['Prospect', 'Tech'] },
  'client-3': { id: 'client-3', name: 'Chen Lin', avatarUrl: '', email: 'chen.l@example.com', phone: '(555) 345-6789', tags: ['Client'] },
};

const mockConversations: Conversation[] = [
  { id: 'conv-1', client: mockClients['client-1'], lastMessage: 'Great, thank you for the documents. I will review them and get back to you by tomorrow.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), unread: false },
  { id: 'conv-2', client: mockClients['client-2'], lastMessage: 'Just following up on our call last week. Let me know if you have any questions about the proposal.', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), unread: true },
  { id: 'conv-3', client: mockClients['client-3'], lastMessage: 'Can we schedule a time to discuss my Q3 performance report?', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), unread: false },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    { id: 'msg-1-1', sender: 'client', text: 'Hi Josh, I\'ve attached the signed forms you requested. Please let me know if you need anything else.', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000) },
    { id: 'msg-1-2', sender: 'user', text: 'Great, thank you for the documents. I will review them and get back to you by tomorrow.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  ],
  'conv-2': [
    { id: 'msg-2-1', sender: 'user', text: 'Just following up on our call last week. Let me know if you have any questions about the proposal.', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000) },
  ],
  'conv-3': [
    { id: 'msg-3-1', sender: 'client', text: 'Hi, hope you\'re well.', timestamp: new Date(Date.now() - 3.1 * 24 * 60 * 60 * 1000) },
    { id: 'msg-3-2', sender: 'client', text: 'Can we schedule a time to discuss my Q3 performance report?', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ],
};


export default function OutreachInboxPage() {
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(mockConversations[1]);
  const [message, setMessage] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    toast({
      title: "Message Sent!",
      description: `Your message has been sent to ${selectedConversation.client.name}.`,
    });
    setMessage('');
  };
  
  const filteredConversations = mockConversations.filter(c =>
    c.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr_320px] h-full overflow-hidden">
        {/* Left Panel: Conversation List */}
        <div className="flex flex-col h-full bg-card/50 border-r border-border/50">
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients or messages..."
                className="pl-9 bg-muted/50 border-none focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    selectedConversation?.id === conv.id ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={conv.client.avatarUrl} alt={conv.client.name} />
                    <AvatarFallback>{conv.client.name.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm text-foreground truncate">{conv.client.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNowStrict(conv.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center Panel: Conversation View */}
        <div className="flex flex-col h-full bg-background">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{selectedConversation.client.name}</h3>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Phone className="h-4 w-4"/></Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Mail className="h-4 w-4"/></Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-6">
                  {(mockMessages[selectedConversation.id] || []).map((msg) => (
                    <div key={msg.id} className={cn(
                        "flex items-end gap-3 max-w-[80%]",
                        msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    )}>
                       <Avatar className="h-8 w-8 border">
                          <AvatarImage src={msg.sender === 'user' ? undefined : selectedConversation.client.avatarUrl} alt="Avatar" />
                          <AvatarFallback>{msg.sender === 'user' ? 'JB' : selectedConversation.client.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                      <div className={cn(
                        "p-3 text-sm rounded-lg shadow-sm break-words",
                        msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                      )}>
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                           {format(msg.timestamp, 'p')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border/50">
                <form onSubmit={handleSendMessage} className="relative">
                  <Textarea
                    placeholder={`Message ${selectedConversation.client.name}...`}
                    className="pr-24 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8"><ChevronDown className="h-4 w-4"/></Button>
                    <Button type="submit" size="sm" disabled={!message.trim()}>
                      Send <Send className="h-3.5 w-3.5 ml-2"/>
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Mail className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-semibold">Select a conversation</h3>
              <p className="text-sm">Choose from the list on the left to view messages.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Client Details */}
        <div className="hidden lg:flex flex-col h-full bg-card/50 border-l border-border/50">
           {selectedConversation ? (
              <ScrollArea className="flex-1">
                <div className="p-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
                      <AvatarImage src={selectedConversation.client.avatarUrl} alt={selectedConversation.client.name} />
                      <AvatarFallback className="text-4xl">{selectedConversation.client.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 text-xl font-semibold text-foreground">{selectedConversation.client.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedConversation.client.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedConversation.client.phone}</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {selectedConversation.client.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                </div>
                <Separator className="my-4" />
                <div className="p-6 space-y-4">
                    <h4 className="font-semibold text-foreground">Recent Activity</h4>
                    <p className="text-sm text-muted-foreground italic">Activity feed placeholder...</p>
                    <h4 className="font-semibold text-foreground">Notes</h4>
                    <p className="text-sm text-muted-foreground italic">Client notes placeholder...</p>
                    <Button className="w-full mt-4" variant="outline">View Full Client Profile</Button>
                </div>
              </ScrollArea>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <p>Client details will appear here.</p>
            </div>
           )}
        </div>
      </div>
    </main>
  );
}

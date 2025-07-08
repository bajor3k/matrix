
"use client";

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  LayoutGrid, 
  Link as LinkIcon, 
  FileText, 
  LifeBuoy, 
  Calculator, 
  GraduationCap, 
  Search, 
  Download,
  Building,
  Briefcase
} from 'lucide-react';

const quickLinks = [
  { name: 'Schwab Advisor Center', href: '#', icon: Building },
  { name: 'Pershing NetX360', href: '#', icon: Building },
  { name: 'Sanctuary Portal', href: '#', icon: Building },
  { name: 'Onboarding Forms', href: '#', icon: FileText },
  { name: 'Company Intranet', href: '#', icon: Briefcase },
];

const documents = [
  { name: 'Compliance Manual v3.2.pdf', size: '2.5 MB', lastUpdated: '2024-06-15' },
  { name: 'New Client Onboarding Checklist.pdf', size: '450 KB', lastUpdated: '2024-05-20' },
  { name: 'Asset Transfer Process Guide.pdf', size: '800 KB', lastUpdated: '2024-07-01' },
  { name: 'Data Security Policy.pdf', size: '1.2 MB', lastUpdated: '2024-01-10' },
];

const faqs = [
  { 
    question: 'How do I initiate an ACAT transfer?', 
    answer: 'To initiate an ACAT transfer, complete the "Transfer of Assets" form found in the Documents tab. Submit the completed form via the secure portal link in Quick Links. Processing typically takes 5-7 business days.' 
  },
  { 
    question: 'What are the deadlines for IRA contributions?', 
    answer: 'The deadline for contributing to a Traditional or Roth IRA for a given tax year is typically the tax filing deadline for that year, usually around April 15th of the following year. SEP IRA deadlines may vary.' 
  },
  { 
    question: 'Where can I find my client\'s risk tolerance questionnaire?', 
    answer: 'The completed risk tolerance questionnaire for each client is stored in their individual client profile under the "Documents" tab. You can search for clients using the main search bar.' 
  },
];

const trainingResources = [
    { title: 'Intro to the Matrix Platform', type: 'Video', href: '#' },
    { title: 'Advanced Trading Features', type: 'Webinar Recording', href: '#' },
    { title: 'Compliance Best Practices', type: 'Article', href: '#' },
];

function ResourceMatrixContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'quick_links';

  return (
    <Tabs defaultValue={tab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-muted/30">
        <TabsTrigger value="quick_links"><LinkIcon className="mr-2 h-4 w-4"/>Quick Links</TabsTrigger>
        <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
        <TabsTrigger value="support"><LifeBuoy className="mr-2 h-4 w-4"/>Support</TabsTrigger>
        <TabsTrigger value="tools"><Calculator className="mr-2 h-4 w-4"/>Tools</TabsTrigger>
        <TabsTrigger value="training"><GraduationCap className="mr-2 h-4 w-4"/>Training</TabsTrigger>
      </TabsList>
      
      <div className="p-6">
        <TabsContent value="quick_links">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map(link => (
                <Button key={link.name} variant="outline" className="justify-start text-base p-6 hover:bg-primary/10 hover:border-primary/50" asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                       <link.icon className="mr-3 h-5 w-5 text-primary"/> {link.name}
                    </a>
                </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <h2 className="text-xl font-semibold text-foreground mb-4">Document Library</h2>
          <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search documents..." className="pl-9 bg-input border-border/50" />
          </div>
          <ul className="space-y-3">
            {documents.map(doc => (
                <li key={doc.name} className="flex justify-between items-center p-3 bg-black/30 border border-border/30 rounded-md">
                    <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {doc.size} | Last Updated: {doc.lastUpdated}</p>
                    </div>
                    <Button variant="ghost" size="icon"><Download className="h-5 w-5"/></Button>
                </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="support">
          <h2 className="text-xl font-semibold text-foreground mb-4">Support & FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Contact Support</h3>
                <p className="text-muted-foreground">For technical assistance or urgent issues:</p>
                <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@sanctuarymatrix.com" className="text-primary hover:underline">support@sanctuarymatrix.com</a></p>
                <p><strong className="text-foreground">Phone:</strong> 1-800-555-MATRIX</p>
            </div>
            <div>
                 <h3 className="text-lg font-semibold text-foreground mb-2">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                       <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                       </AccordionItem>
                    ))}
                </Accordion>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools">
            <h2 className="text-xl font-semibold text-foreground mb-4">Tools & Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-semibold text-foreground">RMD Calculator</h3>
                    <p className="text-sm text-muted-foreground mt-1">Calculate Required Minimum Distributions for retirement accounts.</p>
                    <Button variant="link" className="p-0 h-auto mt-2">Open Calculator</Button>
                </div>
                 <div className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-semibold text-foreground">Contribution Limit Calculator</h3>
                    <p className="text-sm text-muted-foreground mt-1">Check current year contribution limits for various account types.</p>
                    <Button variant="link" className="p-0 h-auto mt-2">Open Calculator</Button>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="training">
           <h2 className="text-xl font-semibold text-foreground mb-4">Training Resources</h2>
           <ul className="space-y-3">
             {trainingResources.map(resource => (
                <li key={resource.title} className="flex justify-between items-center p-3 bg-black/30 border border-border/30 rounded-md">
                    <div>
                        <p className="font-medium text-foreground">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.type}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <a href={resource.href} target="_blank" rel="noopener noreferrer">View</a>
                    </Button>
                </li>
             ))}
           </ul>
        </TabsContent>
      </div>
    </Tabs>
  );
}


export default function ResourceMatrixPage() {
  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
        <LayoutGrid className="w-8 h-8 mr-3 text-primary" />
        Resource Matrix
      </h1>
      
      <PlaceholderCard title="" className="p-0">
        <React.Suspense fallback={<div className="p-6">Loading resources...</div>}>
          <ResourceMatrixContent />
        </React.Suspense>
      </PlaceholderCard>
    </main>
  );
}

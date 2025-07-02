
"use client";

import * as React from "react";
import { PlaceholderCard } from '@/components/dashboard/placeholder-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { analyzePortfolioItems, type AnalyzePortfolioOutput, type PortfolioItem } from "@/ai/flows/analyze-portfolio-flow";
import { Loader2 } from "lucide-react";

const portfolioOverviewData: PortfolioItem[] = [
  { ticker: 'AAPL', name: 'Alpha Fund', category: 'Equity', value: '$1,250,000', weight: '25.0%', ytdReturn: '+5.2%' },
  { ticker: 'MSFT', name: 'Beta Bond Portfolio', category: 'Fixed Income', value: '$800,000', weight: '16.0%', ytdReturn: '+2.1%' },
  { ticker: 'GOOG', name: 'Gamma Real Estate', category: 'Alternatives', value: '$500,000', weight: '10.0%', ytdReturn: '+7.8%' },
  { ticker: 'AMZN', name: 'Delta Growth Stock', category: 'Equity', value: '$150,000', weight: '3.0%', ytdReturn: '+12.5%' },
  { ticker: 'TSLA', name: 'Epsilon Money Market', category: 'Cash Eq.', value: '$2,000,000', weight: '40.0%', ytdReturn: '+0.5%' },
  { ticker: 'JPM', name: 'Zeta Financial Holding', category: 'Financials', value: '$300,000', weight: '6.0%', ytdReturn: '-3.5%' },
];

const missedOpportunitiesData: PortfolioItem[] = [
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'Equity', value: '$1,250,000', weight: '25.0%', ytdReturn: '+5.2%' },
  { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Fixed Income', value: '$800,000', weight: '16.0%', ytdReturn: '-2.1%' }, // Negative return
  { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'Alternatives', value: '$500,000', weight: '10.0%', ytdReturn: '+7.8%' },
  { ticker: 'ARKK', name: 'ARK Innovation ETF', category: 'Equity', value: '$150,000', weight: '3.0%', ytdReturn: '-12.5%' }, // Negative return
  { ticker: 'BIL', name: 'SPDR Bloomberg Barclays 1-3 Month T-Bill ETF', category: 'Cash Eq.', value: '$2,000,000', weight: '40.0%', ytdReturn: '+0.5%' },
  { ticker: 'XLF', name: 'Financial Select Sector SPDR Fund', category: 'Financials', value: '$300,000', weight: '6.0%', ytdReturn: '-3.5%' }, // Negative return
];


export default function PortfolioMatrixPage() {
  const [portfolioId, setPortfolioId] = React.useState("");
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzePortfolioOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);

  const handleAnalyzePortfolio = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const result = await analyzePortfolioItems({
        portfolioId: portfolioId || undefined, // Pass portfolioId if entered
        missedOpportunities: missedOpportunitiesData.filter(item => item.ytdReturn.startsWith('-')),
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing portfolio:", error);
      setAnalysisError("Failed to get analysis. Please try again.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <main className="min-h-screen flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Portfolio Matrix</h1>
      
      <PlaceholderCard title="Portfolio Analysis Engine">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-grow w-full sm:max-w-sm">
            <Label htmlFor="portfolio-id-input" className="sr-only">Portfolio ID</Label>
            <Input 
              id="portfolio-id-input" 
              placeholder="e.g. ACC123456789 (Optional)" 
              className="bg-card backdrop-blur-sm border-none shadow-white-glow-soft hover:shadow-white-glow-hover text-foreground"
              value={portfolioId}
              onChange={(e) => setPortfolioId(e.target.value)}
            />
          </div>
          <Button 
            className="w-full sm:w-auto shrink-0"
            onClick={handleAnalyzePortfolio} 
            disabled={isLoadingAnalysis}
          >
            {isLoadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analyze Portfolio
          </Button>
        </div>
      </PlaceholderCard>

      <PlaceholderCard title="Portfolio Matrix Overview">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Ticker</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold text-right">Value</TableHead>
              <TableHead className="font-bold text-right">Weight</TableHead>
              <TableHead className="font-bold text-right">YTD Return</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolioOverviewData.map((item) => (
              <TableRow key={item.ticker}>
                <TableCell className="font-medium">{item.ticker}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell className="text-right text-foreground">{item.value}</TableCell>
                <TableCell className="text-right text-muted-foreground">{item.weight}</TableCell>
                <TableCell className={`text-right font-semibold ${item.ytdReturn.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {item.ytdReturn}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PlaceholderCard>

      <PlaceholderCard title="Missed Opportunities">
        <p className="text-sm italic text-muted-foreground mb-4">
          Displaying portfolio items. Negative YTD returns are highlighted with a flashing red background. Click "Ask Maven" for an AI analysis.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Ticker</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold text-right">Value</TableHead>
              <TableHead className="font-bold text-right">Weight</TableHead>
              <TableHead className="font-bold text-right">YTD Return</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missedOpportunitiesData.map((item) => (
              <TableRow 
                key={`missed-${item.ticker}`}
                className={cn(
                  item.ytdReturn.startsWith('-') ? 'missed-opportunity-row' : ''
                )}
              >
                <TableCell className="font-medium">{item.ticker}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell className="text-right text-foreground">{item.value}</TableCell>
                <TableCell className="text-right text-muted-foreground">{item.weight}</TableCell>
                <TableCell className={`text-right font-semibold ${item.ytdReturn.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {item.ytdReturn}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-6">
           <button 
             className="ask-maven-button"
             onClick={handleAnalyzePortfolio}
             disabled={isLoadingAnalysis}
           >
            {isLoadingAnalysis ? <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" /> : "💬"}
            Ask Maven
          </button>
        </div>
      </PlaceholderCard>

      {isLoadingAnalysis && (
        <PlaceholderCard title="Maven's Analysis">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Maven is thinking...</p>
          </div>
        </PlaceholderCard>
      )}

      {analysisError && !isLoadingAnalysis && (
         <PlaceholderCard title="Maven's Analysis Error">
          <p className="text-red-400 p-4">{analysisError}</p>
        </PlaceholderCard>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <PlaceholderCard title="Maven's Analysis">
          <div className="p-4 space-y-2">
            {analysisResult.analysis.split('\\n').map((paragraph, index) => (
              <p key={index} className="text-foreground whitespace-pre-wrap">{paragraph}</p>
            ))}
          </div>
        </PlaceholderCard>
      )}
    </main>
  );
}

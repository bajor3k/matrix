'use server';
/**
 * @fileOverview A Genkit flow to analyze a collection of documents based on a user's question.
 *
 * - analyzeDocuments - A function that calls the Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {
    AnalyzeDocumentsInputSchema,
    type AnalyzeDocumentsInput,
    AnalyzeDocumentsOutputSchema,
    type AnalyzeDocumentsOutput,
} from './analyze-documents-schema';


export async function analyzeDocuments(input: AnalyzeDocumentsInput): Promise<AnalyzeDocumentsOutput> {
  return analyzeDocumentsFlow(input);
}

const documentAnalysisPrompt = ai.definePrompt({
  name: 'documentAnalysisPrompt',
  input: {schema: AnalyzeDocumentsInputSchema},
  output: {schema: AnalyzeDocumentsOutputSchema},
  prompt: `You are an expert financial analyst assistant. Your task is to answer a user's question based *only* on the content of the documents provided.

Analyze the following documents to answer the user's question.

User Question:
"{{question}}"

Documents:
{{#each documents}}
---
Document Name: {{name}}

Content:
{{media url=content}}
---
{{/each}}

Based on your analysis of the documents, provide a clear, concise, and well-structured answer to the user's question. If the documents do not contain the information needed to answer the question, state that clearly. Do not use any external knowledge.
`,
});

const analyzeDocumentsFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentsFlow',
    inputSchema: AnalyzeDocumentsInputSchema,
    outputSchema: AnalyzeDocumentsOutputSchema,
  },
  async (input) => {
    if (!input.documents || input.documents.length === 0) {
      return { answer: "No documents were provided for analysis." };
    }
    
    const {output} = await documentAnalysisPrompt(input);
    
    if (!output) {
      return { answer: "Could not generate an answer at this time. The model may have returned an empty response." };
    }
    
    return output;
  }
);

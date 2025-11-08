'use server';
/**
 * @fileOverview A Genkit flow to analyze a collection of documents based on a user's question.
 *
 * - analyzeDocuments - A function that calls the Genkit flow.
 * - DocumentInput - The type for a single document to be analyzed (name and content).
 * - AnalyzeDocumentsInput - The input type for the analysis flow (question and documents).
 * - AnalyzeDocumentsOutput - The output from the analysis flow (the generated answer).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DocumentInputSchema = z.object({
  name: z.string().describe('The name of the document.'),
  content: z.string().describe("The content of the document, likely a data URI."),
});
export type DocumentInput = z.infer<typeof DocumentInputSchema>;

export const AnalyzeDocumentsInputSchema = z.object({
  question: z.string().describe("The user's question about the documents."),
  documents: z.array(DocumentInputSchema).describe('An array of documents to analyze.'),
});
export type AnalyzeDocumentsInput = z.infer<typeof AnalyzeDocumentsInputSchema>;

export const AnalyzeDocumentsOutputSchema = z.object({
  answer: z.string().describe('A comprehensive answer to the user\'s question, synthesized from the provided documents.'),
});
export type AnalyzeDocumentsOutput = z.infer<typeof AnalyzeDocumentsOutputSchema>;


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

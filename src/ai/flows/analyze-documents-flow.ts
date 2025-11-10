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
  prompt: `Your task is to answer the user's question based *only* on the content of the documents provided.
Provide a clear, concise, and well-structured answer. If the documents do not contain the information needed to answer the question, state that clearly. Do not use any external knowledge.

After providing the answer, you MUST identify the single most relevant document you used to formulate your response and place its name in the 'sourceDocument' field.

User Question:
"{{question}}"

Documents:
{{#each documents}}
---
Document Name: {{name}}

Content:
{{{content}}}
---
{{/each}}
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
      return { answer: "No documents were provided for analysis.", sourceDocument: "" };
    }
    
    const {output} = await documentAnalysisPrompt(input);
    
    if (!output) {
      return { answer: "Could not generate an answer at this time. The model may have returned an empty response.", sourceDocument: "" };
    }
    
    return output;
  }
);

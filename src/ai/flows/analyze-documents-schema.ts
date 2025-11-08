/**
 * @fileOverview Schemas and types for the document analysis Genkit flow.
 */
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

'use server';
/**
 * @fileOverview A Genkit flow to analyze a collection of documents based on a user's question.
 *
 * - analyzeDocuments - A function that calls the Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import pdf from "pdf-parse";

// Use the public download URLs provided
const PDF_PUBLIC_URLS = [
    "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Advisor%20Services%20Procedure%20Guide.pdf?alt=media&token=7d2e1990-7ffd-4898-ad4a-d9a4271d80bd",
    "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Asset%20Movement%20Grid%20%26%20LOA%20Signature%20Requirements.pdf?alt=media&token=370d46e3-c0e2-4a03-8d3b-98ee43832544",
    "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Asset%20Movement%20Procedure%20Guide%20(3).pdf?alt=media&token=a5a1a06f-0969-4441-8d78-34c17411834f",
];

const DocumentSchema = z.object({
  name: z.string().describe('The name of the document.'),
  content: z.string().describe("The full text content of the document."),
});

const AnalyzeDocumentsInputSchema = z.object({
  question: z.string().describe("The user's question about the documents."),
});
export type AnalyzeDocumentsInput = z.infer<typeof AnalyzeDocumentsInputSchema>;

const AnalyzeDocumentsOutputSchema = z.object({
  answer: z.string().describe('A comprehensive answer to the user\'s question, synthesized from the provided documents.'),
  sourceDocument: z.string().describe("The name of the single document most relevant to the answer."),
});
export type AnalyzeDocumentsOutput = z.infer<typeof AnalyzeDocumentsOutputSchema>;


export async function analyzeDocuments(input: AnalyzeDocumentsInput): Promise<AnalyzeDocumentsOutput> {
  return analyzeDocumentsFlow(input);
}

async function getDocumentsAsText(): Promise<z.infer<typeof DocumentSchema>[]> {
    try {
        const documents = await Promise.all(
            PDF_PUBLIC_URLS.map(async (url) => {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                const fileBuffer = await response.arrayBuffer();
                const data = await pdf(Buffer.from(fileBuffer));
                
                const urlParts = url.split('/');
                const encodedFilename = urlParts[urlParts.length - 1].split('?')[0];
                const filename = decodeURIComponent(encodedFilename);

                return {
                    name: filename,
                    content: data.text,
                };
            })
        );
        return documents;
    } catch (error: any) {
        console.error("Error fetching or parsing PDFs:", error);
        throw new Error(`Sorry, I was unable to access the procedure documents. ${error.message}`);
    }
}


const documentAnalysisPrompt = ai.definePrompt({
  name: 'documentAnalysisPrompt',
  input: {schema: z.object({
      question: z.string(),
      documents: z.array(DocumentSchema),
  })},
  output: {schema: AnalyzeDocumentsOutputSchema},
  prompt: `You are an expert financial services operations assistant. Your task is to answer the user's question based *only* on the content of the documents provided.
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
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error("The AI service is not configured. Please provide a valid GEMINI_API_KEY in the environment variables.");
    }
    
    const documents = await getDocumentsAsText();
    
    if (!documents || documents.length === 0) {
      return { answer: "No documents were provided or could be read for analysis.", sourceDocument: "" };
    }

    const {output} = await documentAnalysisPrompt({question: input.question, documents});
    
    if (!output) {
      return { answer: "Could not generate an answer at this time. The model may have returned an empty response.", sourceDocument: "" };
    }
    
    return output;
  }
);

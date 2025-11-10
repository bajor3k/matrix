'use server';
/**
 * @fileOverview A Genkit flow to analyze a collection of documents based on a user's question.
 *
 * - analyzeDocuments - A function that calls the Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import pdf from "pdf-parse";

// Define a structure to hold both the URL and a clean name for each document.
const PDF_SOURCES = [
    {
        name: "Advisor Services Procedure Guide",
        url: "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Advisor%20Services%20Procedure%20Guide.pdf?alt=media&token=7d2e1990-7ffd-4898-ad4a-d9a4271d80bd",
    },
    {
        name: "Asset Movement Grid",
        url: "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Asset%20Movement%20Grid%20%26%20LOA%20Signature%20Requirements.pdf?alt=media&token=370d46e3-c0e2-4a03-8d3b-98ee43832544",
    },
    {
        name: "Asset Movement Procedure Guide",
        url: "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Asset%20Movement%20Procedure%20Guide%20(3).pdf?alt=media&token=a5a1a06f-0969-4441-8d78-34c17411834f",
    },
];

const DocumentPageSchema = z.object({
  pageNumber: z.number(),
  content: z.string(),
});

const DocumentSchema = z.object({
  name: z.string().describe('The name of the document.'),
  pages: z.array(DocumentPageSchema).describe("The content of the document, split by page."),
});

const AnalyzeDocumentsInputSchema = z.object({
  question: z.string().describe("The user's question about the documents."),
  mode: z.enum(["simple", "bullets", "detailed"]).describe("The desired format for the answer."),
});
export type AnalyzeDocumentsInput = z.infer<typeof AnalyzeDocumentsInputSchema>;

const AnalyzeDocumentsOutputSchema = z.object({
  answer: z.string().describe('A comprehensive answer to the user\'s question, synthesized from the provided documents.'),
  sourceDocument: z.object({
      name: z.string().describe("The name of the single document most relevant to the answer."),
      pageNumber: z.number().describe("The page number within the source document where the information was found."),
      url: z.string().describe("The public URL of the source document."),
  }),
});
export type AnalyzeDocumentsOutput = z.infer<typeof AnalyzeDocumentsOutputSchema>;


export async function analyzeDocuments(input: AnalyzeDocumentsInput): Promise<AnalyzeDocumentsOutput> {
  return analyzeDocumentsFlow(input);
}

async function getDocumentsAsPages(): Promise<z.infer<typeof DocumentSchema>[]> {
    try {
        const documents = await Promise.all(
            PDF_SOURCES.map(async (source) => {
                const response = await fetch(source.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${source.url}: ${response.statusText}`);
                }
                const fileBuffer = await response.arrayBuffer();
                const data = await pdf(Buffer.from(fileBuffer), {
                    pagerender: (pageData) => {
                        // Return text content for each page
                        return pageData.getTextContent({ normalizeWhitespace: true })
                            .then(textContent => textContent.items.map(item => item.str).join(' '));
                    }
                });
                
                const pages = data.text.split(/\f/g).map((pageText, index) => ({
                    pageNumber: index + 1,
                    content: pageText.trim(),
                })).filter(p => p.content);


                return {
                    name: source.name,
                    pages: pages,
                };
            })
        );
        return documents;
    } catch (error: any) {
        console.error("Error fetching or parsing PDFs:", error);
        throw new Error(`Sorry, I was unable to access the procedure documents. Error accessing document: ${error.documentName || 'Unknown Document'}. Reason: ${error.message}`);
    }
}


const documentAnalysisPrompt = ai.definePrompt({
  name: 'documentAnalysisPrompt',
  input: {schema: z.object({
      question: z.string(),
      documents: z.array(DocumentSchema),
      mode: z.enum(["simple", "bullets", "detailed"]),
  })},
  output: {schema: z.object({
    answer: z.string().describe('A comprehensive answer to the user\'s question, synthesized from the provided documents.'),
    sourceDocumentName: z.string().describe("The name of the single document most relevant to the answer."),
    sourcePageNumber: z.number().describe("The page number from the source document where the most relevant information was found."),
  })},
  prompt: `You are an expert financial services operations assistant. Your task is to answer the user's question based *only* on the content of the documents provided.
If the documents do not contain the information needed to answer the question, state that clearly. Do not use any external knowledge.

The user has requested the answer in a specific format: '{{mode}}'.

- If mode is 'simple', provide a concise, 1-3 sentence summary.
- If mode is 'bullets', lay out the key steps and details using bullet points.
- If mode is 'detailed', provide a comprehensive, paragraph-based response.

After providing the answer, you MUST identify the single most relevant document and the specific page number within that document where you found the information.
Place the document's name in the 'sourceDocumentName' field and the page number in the 'sourcePageNumber' field.

User Question:
"{{question}}"

Documents:
{{#each documents}}
---
Document Name: {{name}}

{{#each pages}}
Page: {{pageNumber}}
{{{content}}}
{{/each}}
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
    
    const documents = await getDocumentsAsPages();
    
    const emptyOutput = {
        answer: "No documents were provided or could be read for analysis.",
        sourceDocument: { name: "", pageNumber: 0, url: "" },
    };

    if (!documents || documents.length === 0) {
      return emptyOutput;
    }

    const {output} = await documentAnalysisPrompt({question: input.question, documents, mode: input.mode});
    
    if (!output || !output.sourceDocumentName) {
      return {
          answer: output?.answer || "Could not generate an answer at this time. The model may have returned an empty response.",
          sourceDocument: { name: "", pageNumber: 0, url: "" },
      };
    }
    
    const sourceInfo = PDF_SOURCES.find(s => s.name === output.sourceDocumentName);

    return {
        answer: output.answer,
        sourceDocument: {
            name: output.sourceDocumentName,
            pageNumber: output.sourcePageNumber,
            url: sourceInfo?.url || "",
        },
    };
  }
);

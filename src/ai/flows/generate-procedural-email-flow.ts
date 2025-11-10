'use server';
/**
 * @fileOverview A Genkit flow to generate a procedural email based on a user's question
 * and a predefined set of PDF documents stored in Google Cloud Storage.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import pdf from 'pdf-parse';

// Define the GCS paths for the knowledge base PDFs.
const PDF_PATHS = [
    "gs://matrix-y2jfw.firebasestorage.app/Advisor Services Procedure Guide.pdf",
    "gs://matrix-y2jfw.firebasestorage.app/Asset Movement Grid & LOA Signature Requirements.pdf",
    "gs://matrix-y2jfw.firebasestorage.app/Asset Movement Procedure Guide (3).pdf",
];

const storage = new Storage();

// Define input and output schemas for the flow
const GenerateProceduralEmailInputSchema = z.object({
  question: z.string().describe("The user's question about a procedure."),
  mode: z.enum(["simple", "bullets", "standard"]).describe("The desired format for the email response."),
});
export type GenerateProceduralEmailInput = z.infer<typeof GenerateProceduralEmailInputSchema>;

const GenerateProceduralEmailOutputSchema = z.object({
  draft: z.string().describe("The generated email draft body."),
  sources: z.array(z.object({
    filename: z.string(),
    page: z.string(),
    snippet: z.string(),
  })).describe("A list of source documents used to generate the answer."),
});
export type GenerateProceduralEmailOutput = z.infer<typeof GenerateProceduralEmailOutputSchema>;


/**
 * Main function to be called from the UI. It orchestrates the Genkit flow.
 * @param input The user's question and desired response mode.
 * @returns The generated email draft and sources.
 */
export async function generateProceduralEmail(input: GenerateProceduralEmailInput): Promise<GenerateProceduralEmailOutput> {
  return generateProceduralEmailFlow(input);
}


// Define the prompt for the AI model
const emailGenerationPrompt = ai.definePrompt({
  name: 'generateProceduralEmailPrompt',
  input: {
      schema: z.object({
          question: z.string(),
          mode: z.string(),
          documentSnippets: z.array(z.object({
              fileName: z.string(),
              content: z.string(),
          }))
      })
  },
  output: { schema: GenerateProceduralEmailOutputSchema },
  prompt: `You are an expert financial services operations assistant. Your task is to draft a professional email response to a user's question based *only* on the provided document snippets.

User's Question:
"{{question}}"

Formatting Mode: {{mode}}

Available Information (Snippets from procedure documents):
{{#each documentSnippets}}
---
Document: {{fileName}}
Content:
{{{content}}}
---
{{/each}}

Instructions:
1.  Analyze the user's question and the provided document snippets.
2.  Draft an email body that directly answers the question using only the information from the snippets.
3.  Format the email body according to the specified mode:
    -   **simple**: A very brief, one-sentence summary and a call to action. Example: "We can proceed with the requested action once you confirm."
    -   **bullets**: A concise list of steps or key points. Start with a brief intro. Example: "Below are the steps for your request:\n- Step 1...\n- Step 2..."
    -   **standard**: A professional, slightly more detailed response, incorporating key points as a body paragraph or list. Start with a polite opening. Example: "Thanks for your question. Based on our procedures, here’s the guidance: ..."
4.  Identify the single most relevant document used and list its filename, a placeholder page number "1", and the first 100 characters of the content you used as the 'snippet' in the 'sources' array. If no single document is clearly most relevant, pick the one you referenced most. If no relevant information is found, state that in the draft.
5.  Return the response as a JSON object with 'draft' and 'sources' fields. The 'draft' should be the email body text. 'sources' should be an array with one object.
`,
});

// Helper to fetch and parse PDF content from GCS
async function getDocumentsAsText(): Promise<{ fileName: string; content: string }[]> {
  const downloadAndParsePromises = PDF_PATHS.map(async (gcsPath) => {
    try {
      const [bucketName, ...objectPathParts] = gcsPath.replace('gs://', '').split('/');
      const objectPath = objectPathParts.join('/');
      const fileName = gcsPath.substring(gcsPath.lastIndexOf('/') + 1);

      const file = storage.bucket(bucketName).file(objectPath);
      
      const [fileBuffer] = await file.download();
      const data = await pdf(fileBuffer);

      return { fileName, content: data.text };
    } catch (error) {
      console.error(`Failed to process GCS file ${gcsPath}:`, error);
      const fileName = gcsPath.substring(gcsPath.lastIndexOf('/') + 1);
      return { fileName, content: `Error accessing document: ${fileName}` };
    }
  });

  return Promise.all(downloadAndParsePromises);
}


// Define the main Genkit flow
const generateProceduralEmailFlow = ai.defineFlow(
  {
    name: 'generateProceduralEmailFlow',
    inputSchema: GenerateProceduralEmailInputSchema,
    outputSchema: GenerateProceduralEmailOutputSchema,
  },
  async (input) => {
    // Fetch and parse the PDF content from GCS.
    const documentSnippets = await getDocumentsAsText();
    
    // Filter out any documents that had errors during processing.
    const validDocuments = documentSnippets.filter(doc => !doc.content.startsWith('Error'));

    if (validDocuments.length === 0) {
      return { draft: "Sorry, I was unable to access any of the procedure documents to answer your question.", sources: [] };
    }

    const { output } = await emailGenerationPrompt({
        question: input.question,
        mode: input.mode,
        documentSnippets: validDocuments,
    });

    if (!output) {
      return { draft: "The AI model could not generate a response. Please try again.", sources: [] };
    }
    
    return output;
  }
);

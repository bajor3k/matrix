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

// Initialize storage client with API key for authentication
const storage = new Storage({
  keyFilename: undefined, // Ensure it doesn't look for a local key file
  credentials: {
    // Using the same API key as the genkit AI flows for consistency
    client_email: 'dummy-email@example.com', // Not used with API key but can't be empty
    private_key: process.env.GEMINI_API_KEY!,
  },
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});


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
2.  Draft an email body that directly answers the question using only the information from the snippets. If the information is not present, state that clearly.
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
    const fileName = gcsPath.substring(gcsPath.lastIndexOf('/') + 1);
    try {
      const [bucketName, ...objectPathParts] = gcsPath.replace('gs://', '').split('/');
      const objectPath = objectPathParts.join('/');
      
      const file = storage.bucket(bucketName).file(objectPath);
      
      const [fileBuffer] = await file.download();
      const data = await pdf(fileBuffer);

      return { fileName, content: data.text };
    } catch (error: any) {
      console.error(`Failed to process GCS file ${gcsPath}:`, error);
      const errorMessage = error.message || 'An unknown error occurred';
      return { fileName, content: `Error accessing document: ${fileName}. Reason: ${errorMessage}` };
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
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        return { draft: "The AI service is not configured. Please provide a valid GEMINI_API_KEY in the environment variables.", sources: [] };
    }
    
    // Fetch and parse the PDF content from GCS.
    const documentSnippets = await getDocumentsAsText();
    
    // Check if any document failed to load and return a specific error.
    const failedDoc = documentSnippets.find(doc => doc.content.startsWith('Error'));
    if (failedDoc) {
      return { draft: `Sorry, I was unable to access the procedure documents. ${failedDoc.content}`, sources: [] };
    }

    const { output } = await emailGenerationPrompt({
        question: input.question,
        mode: input.mode,
        documentSnippets: documentSnippets,
    });

    if (!output) {
      return { draft: "The AI model could not generate a response. This may be due to content safety filters or a temporary issue. Please try again.", sources: [] };
    }
    
    return output;
  }
);

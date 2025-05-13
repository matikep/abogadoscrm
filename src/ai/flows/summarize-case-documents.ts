// Summarize case documents flow using Genkit and Gemini 2.0 Flash.

'use server';

/**
 * @fileOverview Summarizes case documents using AI.
 *
 * - summarizeCaseDocuments - A function that summarizes case documents.
 * - SummarizeCaseDocumentsInput - The input type for the summarizeCaseDocuments function.
 * - SummarizeCaseDocumentsOutput - The return type for the summarizeCaseDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCaseDocumentsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A case document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type SummarizeCaseDocumentsInput = z.infer<
  typeof SummarizeCaseDocumentsInputSchema
>;

const SummarizeCaseDocumentsOutputSchema = z.object({
  summary: z.string().describe('A summary of the case document.'),
});

export type SummarizeCaseDocumentsOutput = z.infer<
  typeof SummarizeCaseDocumentsOutputSchema
>;

export async function summarizeCaseDocuments(
  input: SummarizeCaseDocumentsInput
): Promise<SummarizeCaseDocumentsOutput> {
  return summarizeCaseDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCaseDocumentsPrompt',
  input: {schema: SummarizeCaseDocumentsInputSchema},
  output: {schema: SummarizeCaseDocumentsOutputSchema},
  prompt: `You are an expert lawyer specializing in document summarization.

You will use this document to create a short summary.

Document: {{media url=documentDataUri}}`,
});

const summarizeCaseDocumentsFlow = ai.defineFlow(
  {
    name: 'summarizeCaseDocumentsFlow',
    inputSchema: SummarizeCaseDocumentsInputSchema,
    outputSchema: SummarizeCaseDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// ArticleProcessing Flow
'use server';

/**
 * @fileOverview Processes articles, translates them, and identifies key vocabulary, phrases, and generates reading comprehension questions using the Gemini API.
 *
 * - processArticle - A function that handles the article processing.
 * - ProcessArticleInput - The input type for the processArticle function.
 * - ProcessArticleOutput - The return type for the processArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessArticleInputSchema = z.object({
  articleText: z.string().describe('The text content of the article to be processed.'),
  maxNewWords: z.number().default(10).describe('The maximum number of new words to extract.'),
  maxPhrases: z.number().default(5).describe('The maximum number of phrases to extract.'),
  generateReadingComprehensionQuestions: z
    .boolean()
    .default(true)
    .describe('Whether to generate reading comprehension questions.'),
});
export type ProcessArticleInput = z.infer<typeof ProcessArticleInputSchema>;

const ProcessArticleOutputSchema = z.object({
  translation: z.string().describe('The translated text of the article.'),
  newWords: z
    .array(z.object({word: z.string(), translation: z.string()}))
    .describe('Key vocabulary words and their translations.'),
  phrases: z
    .array(z.object({phrase: z.string(), translation: z.string(), example: z.string().optional()}))
    .describe('Key phrases, their translations, and example sentences.'),
  readingComprehensionQuestions: z
    .array(
      z.object({
        question: z.string().describe('The text of the reading comprehension question.'),
        options: z
          .array(
            z.object({
              option_text: z.string().describe('The text of a multiple-choice option.'),
              is_correct: z.boolean().describe('Indicates if this option is the correct answer.'),
            })
          )
          .min(3) // Ensure at least 3 options
          .describe('An array of multiple-choice options for the question.'),
        explanation: z.string().describe('An explanation for why the correct answer is correct.'),
      })
    )
    .describe('Reading comprehension questions, their multiple-choice options, and explanations for the correct answers.'),
});
export type ProcessArticleOutput = z.infer<typeof ProcessArticleOutputSchema>;

export async function processArticle(input: ProcessArticleInput): Promise<ProcessArticleOutput> {
  return processArticleFlow(input);
}

const processArticlePrompt = ai.definePrompt({
  name: 'processArticlePrompt',
  input: {schema: ProcessArticleInputSchema},
  output: {schema: ProcessArticleOutputSchema},
  prompt: `You are an AI that processes English articles for language learners.

  Your tasks include:
  1. Translating the article into Chinese.
  2. Identifying the {{maxNewWords}} most important new vocabulary words in the article, along with their translations.
  3. Identifying the {{maxPhrases}} most important phrases in the article, along with their translations and example sentences.
  4. {{#if generateReadingComprehensionQuestions}}Generating 5 reading comprehension multiple-choice questions based on the article. Each question should have 3-4 options, with one clearly marked as correct (using the 'is_correct' boolean field). Also, provide a brief explanation for why the correct answer is chosen. Format the output according to the schema, ensuring the 'readingComprehensionQuestions' array contains objects with 'question', 'options' (which is an array of objects with 'option_text' and 'is_correct'), and 'explanation' fields.{{/if}}

  Article:
  {{articleText}}`,
});

const processArticleFlow = ai.defineFlow(
  {
    name: 'processArticleFlow',
    inputSchema: ProcessArticleInputSchema,
    outputSchema: ProcessArticleOutputSchema,
  },
  async input => {
    const {output} = await processArticlePrompt(input);
    return output!;
  }
);

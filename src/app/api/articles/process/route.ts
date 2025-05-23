import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { processArticle } from "@/ai/flows/article-processing";
import type { ProcessArticleInput, ProcessArticleOutput } from "@/ai/flows/article-processing";
import { z } from "zod";

const processArticleRequestSchema = z.object({
  articleText: z.string().min(10, "Article text is too short."),
  maxNewWords: z.number().int().positive().optional().default(10),
  maxPhrases: z.number().int().positive().optional().default(5),
  generateReadingComprehensionQuestions: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedInput = processArticleRequestSchema.parse(body);
    
    const aiInput: ProcessArticleInput = {
      articleText: validatedInput.articleText,
      maxNewWords: validatedInput.maxNewWords,
      maxPhrases: validatedInput.maxPhrases,
      generateReadingComprehensionQuestions: validatedInput.generateReadingComprehensionQuestions,
    };

    // Call the Genkit flow
    const output: ProcessArticleOutput = await processArticle(aiInput);

    // Here you would typically save the processed article data to your database
    // For example, create records in articles, article_new_words, article_phrases, etc.
    // For this example, we'll just return the output.

    return NextResponse.json(output);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    console.error("Error processing article:", error);
    // Check if it's a Genkit/AI specific error and tailor response
    // For now, a generic server error.
    return NextResponse.json({ message: "Error processing article via AI flow" }, { status: 500 });
  }
}

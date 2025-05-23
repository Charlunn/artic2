import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from '@/lib/db'; // Added Prisma client
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
    // Here you would typically save the processed article data to your database
    if (!session.user || !session.user.id) {
      // This check is technically redundant due to the session check at the beginning,
      // but good for type safety if session.user or session.user.id could be undefined.
      return NextResponse.json({ message: "User ID not found in session" }, { status: 401 });
    }
    const userId = session.user.id;

    // Generate a simple title for the article
    const generatedTitle = `Processed Article - ${new Date().toISOString()}`; // Placeholder title

    try {
      const createdArticleData = await prisma.$transaction(async (tx) => {
        // 1. Create the Article record
        const newArticle = await tx.article.create({
          data: {
            user_id: userId, // Corrected from created_by_user_id to user_id
            title: generatedTitle, // Using generated title
            content: aiInput.articleText, // original_text is 'content' in schema
            translated_content: output.translation, // translation is 'translated_content'
            // source_url: undefined, // If available from input or output
            // status: 'processed', // Or some other default status
          },
        });

        // 2. Create ArticleNewWord records (if any)
        if (output.newWords && output.newWords.length > 0) {
          await tx.articleNewWord.createMany({
            data: output.newWords.map(word => ({
              article_id: newArticle.article_id,
              word: word.word,
              definition: word.translation, // Mapped from translation
            })),
          });
        }

        // 3. Create ArticlePhrase records (if any)
        if (output.phrases && output.phrases.length > 0) {
          await tx.articlePhrase.createMany({
            data: output.phrases.map(phrase => ({
              article_id: newArticle.article_id,
              phrase: phrase.phrase,
              meaning: phrase.translation, // Mapped from translation
              // example: phrase.example, // 'example' not in current ArticlePhrase schema
            })),
          });
        }

        // 4. Create ArticleReadingComprehensionQuestion and their Options (if any)
        if (output.readingComprehensionQuestions && output.readingComprehensionQuestions.length > 0) {
          for (const q of output.readingComprehensionQuestions) {
            const newQuestion = await tx.articleReadingComprehensionQuestion.create({
              data: {
                article_id: newArticle.article_id,
                question_text: q.question,
                // explanation: q.explanation, // 'explanation' not in AI output
              },
            });

            // Create one option which is the correct answer
            await tx.articleReadingComprehensionOption.create({
              data: {
                question_id: newQuestion.question_id,
                option_text: q.answer, 
                is_correct: true,
              },
            });
          }
        }
        
        return newArticle;
      });

      return NextResponse.json({ 
        message: "Article processed and saved successfully", 
        articleId: createdArticleData.article_id,
        processedOutput: output 
      });

    } catch (dbError) {
      console.error("Error saving processed article to database:", dbError);
      return NextResponse.json({ message: "Failed to save processed article to database" }, { status: 500 });
    }

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

'use server';

import {PrismaClient} from '@prisma/client';
import {auth} from '@/auth'; // Assuming auth is configured and provides session
import {processArticle} from '@/ai/flows/article-processing';
import type {ProcessArticleInput, ProcessArticleOutput} from '@/ai/flows/article-processing';

const prisma = new PrismaClient();

export interface ArticleToSave extends ProcessArticleOutput {
  title: string;
  articleText: string;
  userProvidedTranslation?: string;
  sourceUrl?: string;
  // newWords, phrases, readingComprehensionQuestions, translation are from ProcessArticleOutput
}

export async function processArticleWithAI(
  input: ProcessArticleInput
): Promise<ProcessArticleOutput | {error: string}> {
  try {
    const fullInput: ProcessArticleInput = {
      articleText: input.articleText,
      maxNewWords: input.maxNewWords ?? 10,
      maxPhrases: input.maxPhrases ?? 5,
      generateReadingComprehensionQuestions: input.generateReadingComprehensionQuestions ?? true,
    };

    const result = await processArticle(fullInput);
    if (!result) {
      return {error: 'AI processing returned no result.'};
    }
    return result;
  } catch (e) {
    console.error('Error processing article with AI:', e);
    if (e instanceof Error) {
      return {error: `An error occurred during AI processing: ${e.message}`};
    }
    return {error: 'An unknown error occurred during AI processing.'};
  }
}

export async function saveArticleToDb(
  articleData: ArticleToSave
): Promise<Awaited<ReturnType<typeof prisma.article.create>> | {error: string}> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    return {error: 'Unauthorized or user not admin.'};
  }
  const adminUserId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newArticle = await tx.article.create({
        data: {
          user_id: adminUserId,
          title: articleData.title,
          content: articleData.articleText,
          translated_content: articleData.translation, // AI translation
          source_url: articleData.sourceUrl,
          // status can be set if needed, e.g., 'published'
        },
      });

      if (articleData.newWords && articleData.newWords.length > 0) {
        await tx.articleNewWord.createMany({
          data: articleData.newWords.map(word => ({
            article_id: newArticle.article_id,
            word: word.word,
            definition: word.translation, // Assuming 'translation' field from AI maps to 'definition'
          })),
        });
      }

      if (articleData.phrases && articleData.phrases.length > 0) {
        await tx.articlePhrase.createMany({
          data: articleData.phrases.map(phrase => ({
            article_id: newArticle.article_id,
            phrase: phrase.phrase,
            meaning: phrase.translation, // Assuming 'translation' maps to 'meaning'
            example: phrase.example,
          })),
        });
      }

      if (articleData.readingComprehensionQuestions && articleData.readingComprehensionQuestions.length > 0) {
        for (const q of articleData.readingComprehensionQuestions) {
          const newQuestion = await tx.articleReadingComprehensionQuestion.create({
            data: {
              article_id: newArticle.article_id,
              question_text: q.question,
              explanation: q.explanation,
            },
          });

          if (q.options && q.options.length > 0) {
            await tx.articleReadingComprehensionOption.createMany({
              data: q.options.map(opt => ({
                question_id: newQuestion.question_id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
              })),
            });
          }
        }
      }
      return newArticle;
    });
    return result;
  } catch (e) {
    console.error('Error saving article to DB:', e);
    if (e instanceof Error) {
      return {error: `Database error: ${e.message}`};
    }
    return {error: 'An unknown error occurred while saving the article.'};
  }
}

export async function getArticlesFromDb(): Promise<Partial<Awaited<ReturnType<typeof prisma.article.findMany>>>[] | {error: string}> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    // For non-admins, this function should ideally not be called or return empty array based on product decision.
    // However, strict check here:
    return {error: 'Unauthorized or user not admin.'};
  }

  try {
    const articles = await prisma.article.findMany({
      where: {user_id: session.user.id}, // Or all articles if admin should see all
      select: {
        article_id: true,
        title: true,
        source_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return articles;
  } catch (e) {
    console.error('Error fetching articles from DB:', e);
    if (e instanceof Error) {
      return {error: `Database error: ${e.message}`};
    }
    return {error: 'An unknown error occurred while fetching articles.'};
  }
}

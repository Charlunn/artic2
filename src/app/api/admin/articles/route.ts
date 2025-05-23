import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Role } from '@prisma/client'; // Import Role enum

// Schemas for nested objects
const newWordSchema = z.object({
  word: z.string().min(1, "Word cannot be empty"),
  definition: z.string().min(1, "Definition cannot be empty"), // Matches Prisma schema: definition
});

const phraseSchema = z.object({
  phrase: z.string().min(1, "Phrase cannot be empty"),
  meaning: z.string().min(1, "Meaning cannot be empty"), // Matches Prisma schema: meaning
  // example: z.string().optional(), // 'example' not in ArticlePhrase Prisma schema
});

const comprehensionOptionSchema = z.object({
  option_text: z.string().min(1, "Option text cannot be empty"),
  is_correct: z.boolean(),
});

const comprehensionQuestionSchema = z.object({
  question_text: z.string().min(1, "Question text cannot be empty"),
  // explanation: z.string().optional(), // 'explanation' not in Prisma schema
  options: z.array(comprehensionOptionSchema).min(1, "At least one option is required"),
});

// Main schema for creating an article
const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Original text (content) is required"), // Matches Prisma schema: content
  translated_content: z.string().optional(), // Matches Prisma schema: translated_content
  source_url: z.string().url("Invalid URL format for source link").optional(), // Matches Prisma schema: source_url
  status: z.string().optional(), // Matches Prisma schema: status (e.g., 'draft', 'published')
  tags: z.array(z.string().min(1, "Tag name cannot be empty")).optional(), // Tags submitted as an array of names
  new_words: z.array(newWordSchema).optional(),
  phrases: z.array(phraseSchema).optional(),
  comprehension_questions: z.array(comprehensionQuestionSchema).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.admin) {
    return NextResponse.json({ message: 'Forbidden: User is not an admin' }, { status: 403 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    const newArticleWithRelations = await prisma.$transaction(async (tx) => {
      // 1. Create the main Article record
      const article = await tx.article.create({
        data: {
          user_id: userId, // user_id from session
          title: validatedData.title,
          content: validatedData.content,
          translated_content: validatedData.translated_content,
          source_url: validatedData.source_url,
          status: validatedData.status,
        },
      });

      // 2. Handle Tags (Find or Create)
      if (validatedData.tags && validatedData.tags.length > 0) {
        for (const tagName of validatedData.tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          await tx.articleTag.create({
            data: {
              article_id: article.article_id,
              tag_id: tag.tag_id,
            },
          });
        }
      }

      // 3. Handle New Words
      if (validatedData.new_words && validatedData.new_words.length > 0) {
        await tx.articleNewWord.createMany({
          data: validatedData.new_words.map(nw => ({
            article_id: article.article_id,
            word: nw.word,
            definition: nw.definition,
          })),
        });
      }

      // 4. Handle Phrases
      if (validatedData.phrases && validatedData.phrases.length > 0) {
        await tx.articlePhrase.createMany({
          data: validatedData.phrases.map(p => ({
            article_id: article.article_id,
            phrase: p.phrase,
            meaning: p.meaning,
          })),
        });
      }

      // 5. Handle Comprehension Questions and Options
      if (validatedData.comprehension_questions && validatedData.comprehension_questions.length > 0) {
        for (const cq of validatedData.comprehension_questions) {
          const question = await tx.articleReadingComprehensionQuestion.create({
            data: {
              article_id: article.article_id,
              question_text: cq.question_text,
            },
          });
          if (cq.options && cq.options.length > 0) {
            await tx.articleReadingComprehensionOption.createMany({
              data: cq.options.map(opt => ({
                question_id: question.question_id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
              })),
            });
          }
        }
      }

      // Fetch the created article with all its relations to return
      return tx.article.findUnique({
        where: { article_id: article.article_id },
        include: {
          author: { select: { user_id: true, username: true, email: true } }, // 'author' is the relation name for User
          tags: { include: { tag: true } },
          newWords: true, // 'newWords' is the relation name
          phrases: true, // 'phrases' is the relation name
          comprehensionQuestions: { include: { options: true } }, // 'comprehensionQuestions' is the relation name
        },
      });
    });

    return NextResponse.json(newArticleWithRelations, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('Error creating article:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

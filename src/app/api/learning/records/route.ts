import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const learningRecordUpsertSchema = z.object({
  article_id: z.string().min(1, "Article ID is required"),
  article_title_cache: z.string().min(1, "Article title cache is required"),
  timer_skimming: z.number().int().min(0).optional(),
  timer_intensive_reading: z.number().int().min(0).optional(),
  // Add other timer fields as they are defined in Prisma schema
  total_learning_time_for_article: z.number().int().min(0).optional(), // Client might send this, or server calculates based on timers
  mark_as_completed: z.boolean().optional(),
});

// Helper function to calculate next review date
const calculateNextReviewDate = (currentLevel: number, isInitial: boolean = false): Date => {
  const now = new Date();
  if (isInitial) {
    now.setDate(now.getDate() + 1); // +1 day for initial completion
  } else {
    // Example: current_review_level 0 -> +2 days, 1 -> +4 days, 2 -> +6 days
    now.setDate(now.getDate() + (currentLevel + 1) * 2); 
  }
  return now;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const validatedBody = learningRecordUpsertSchema.parse(body);

    const { article_id, article_title_cache, mark_as_completed, ...timers } = validatedBody;
    
    // Calculate total time from provided timers if not explicitly sent
    let totalTimeUpdate = 0;
    if (timers.timer_skimming) totalTimeUpdate += timers.timer_skimming;
    if (timers.timer_intensive_reading) totalTimeUpdate += timers.timer_intensive_reading;
    // Add other timers to totalTimeUpdate

    const upsertedRecord = await prisma.userLearningRecord.upsert({
      where: {
        user_id_article_id: { // This relies on the @@unique([user_id, article_id]) constraint
          user_id: userId,
          article_id: article_id,
        },
      },
      create: {
        user_id: userId,
        article_id: article_id,
        article_title_cache: article_title_cache,
        timer_skimming: timers.timer_skimming || 0,
        timer_intensive_reading: timers.timer_intensive_reading || 0,
        total_learning_time_for_article: validatedBody.total_learning_time_for_article || totalTimeUpdate,
        is_first_time_learning: true, // Always true on create
        date_learned: mark_as_completed ? new Date() : null,
        review_next_date: mark_as_completed ? calculateNextReviewDate(0, true) : null,
        review_current_level: mark_as_completed ? 0 : 0, // Initial level is 0
        review_total_times: 0,
        review_total_duration_for_article: 0,
        activity_type: 'article_learning', // Default or based on context
        // created_at and last_studied_date will use @default(now()) and @updatedAt
      },
      update: {
        article_title_cache: article_title_cache, // Title might change
        timer_skimming: {
          increment: timers.timer_skimming || 0,
        },
        timer_intensive_reading: {
          increment: timers.timer_intensive_reading || 0,
        },
        total_learning_time_for_article: {
          increment: validatedBody.total_learning_time_for_article || totalTimeUpdate,
        },
        is_first_time_learning: false, // No longer first time on update
        // Conditional update for date_learned and review_next_date
        ...(mark_as_completed && { // Only apply if mark_as_completed is true
          date_learned: new Date(), // Could check if existing date_learned is null: prisma.userLearningRecord.fields.date_learned ? undefined : new Date()
          review_next_date: calculateNextReviewDate(0, true), // Reset review cycle if re-completed
          review_current_level: 0,
        }),
        // last_studied_date will be auto-updated via @updatedAt
      },
      include: {
        article: { // Include related article details if needed by client
            select: { title: true, source_url: true }
        }
      }
    });

    return NextResponse.json(upsertedRecord);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('Error upserting learning record:', error);
    // Check for Prisma specific errors if needed, e.g., unique constraint violation if not upserting
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const takeParam = searchParams.get('take');
  const skipParam = searchParams.get('skip');

  const take = takeParam ? parseInt(takeParam, 10) : undefined;
  const skip = skipParam ? parseInt(skipParam, 10) : undefined;

  if (takeParam && (isNaN(take!) || take! < 0)) {
    return NextResponse.json({ message: 'Invalid "take" parameter' }, { status: 400 });
  }
  if (skipParam && (isNaN(skip!) || skip! < 0)) {
    return NextResponse.json({ message: 'Invalid "skip" parameter' }, { status: 400 });
  }
  
  try {
    const records = await prisma.userLearningRecord.findMany({
      where: { user_id: userId },
      take: take,
      skip: skip,
      orderBy: {
        last_studied_date: 'desc', // Default sort order
      },
      include: {
        article: {
            select: { article_id: true, title: true, status: true } // Include some article details
        }
      }
    });
    
    const totalRecords = await prisma.userLearningRecord.count({
        where: { user_id: userId }
    });

    return NextResponse.json({
        data: records,
        pagination: {
            total: totalRecords,
            take: take,
            skip: skip,
            hasNextPage: skip !== undefined && take !== undefined ? (skip + take) < totalRecords : undefined,
        }
    });

  } catch (error) {
    console.error('Error fetching learning records:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

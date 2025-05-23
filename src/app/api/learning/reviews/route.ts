import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const logReviewSchema = z.object({
  record_id: z.string().min(1, "Learning record ID is required"),
  duration_seconds: z.number().int().min(0, "Duration must be a positive number"),
  level_reviewed_at: z.number().int().min(0, "Level reviewed at must be a positive number"), // This is the new level achieved or confirmed
});

// Helper function to calculate next review date, consistent with records route
const calculateNextReviewDate = (currentLevel: number): Date => {
  const now = new Date();
  // Example: current_review_level 0 -> +2 days, 1 -> +4 days, 2 -> +6 days
  // currentLevel here is the *new* level after review.
  now.setDate(now.getDate() + (currentLevel + 1) * 2); 
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
    const validatedBody = logReviewSchema.parse(body);

    const { record_id, duration_seconds, level_reviewed_at } = validatedBody;

    const updatedRecord = await prisma.$transaction(async (tx) => {
      // 1. Fetch the UserLearningRecord and verify ownership
      const learningRecord = await tx.userLearningRecord.findUnique({
        where: { record_id: record_id },
      });

      if (!learningRecord) {
        throw new Error('Learning record not found'); // Will be caught and returned as 404
      }

      if (learningRecord.user_id !== userId) {
        throw new Error('Forbidden'); // Will be caught and returned as 403
      }

      // 2. Create a UserReviewHistory record
      await tx.userReviewHistory.create({
        data: {
          user_id: userId,
          record_id: record_id,
          duration_seconds: duration_seconds,
          level_reviewed_at: level_reviewed_at, // Storing the level at which this review occurred
          // reviewed_at is @default(now())
        },
      });

      // 3. Update the UserLearningRecord
      const newReviewLevel = level_reviewed_at; // Assume level_reviewed_at is the new current level
      const nextReviewDate = calculateNextReviewDate(newReviewLevel);

      return tx.userLearningRecord.update({
        where: { record_id: record_id },
        data: {
          review_total_times: {
            increment: 1,
          },
          review_total_duration_for_article: {
            increment: duration_seconds,
          },
          review_current_level: newReviewLevel,
          review_next_date: nextReviewDate,
          // last_studied_date is auto-updated by @updatedAt
        },
        include: {
          article: { select: { title: true } } // Include some details for the response
        }
      });
    });

    return NextResponse.json(updatedRecord);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    if (error.message === 'Learning record not found') {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'You do not have permission to update this record' }, { status: 403 });
    }
    console.error('Error logging review session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

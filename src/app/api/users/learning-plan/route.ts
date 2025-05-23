import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Prisma } from '@prisma/client'; // Import Prisma for JsonNull type

const learningPlanSchema = z.object({
  learning_plan_start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format for start date" }).optional().nullable(),
  learning_plan_end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format for end date" }).optional().nullable(),
  learning_plan_study_days_of_week: z.array(z.number().min(0).max(6)).max(7, "Study days array cannot have more than 7 days").optional().nullable(), // 0=Sun, 6=Sat
  learning_plan_preferred_exam_target: z.string().max(50, "Exam target cannot exceed 50 characters").optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        learning_plan_start_date: true,
        learning_plan_end_date: true,
        learning_plan_study_days_of_week: true,
        learning_plan_preferred_exam_target: true,
      },
    });

    if (!user) {
      // This case should ideally not happen if session.user.id is valid and refers to an existing user.
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prisma returns JsonValue for Json fields, ensure it's typed correctly for the client if needed
    // For this API, returning the direct Prisma response is fine.
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching learning plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { success, data: validatedData, error: zodError } = learningPlanSchema.safeParse(body);

    if (!success) {
      return NextResponse.json({ message: 'Invalid input', errors: zodError.format() }, { status: 400 });
    }

    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (validatedData.hasOwnProperty('learning_plan_start_date')) {
      dataToUpdate.learning_plan_start_date = validatedData.learning_plan_start_date ? new Date(validatedData.learning_plan_start_date) : null;
    }
    if (validatedData.hasOwnProperty('learning_plan_end_date')) {
      dataToUpdate.learning_plan_end_date = validatedData.learning_plan_end_date ? new Date(validatedData.learning_plan_end_date) : null;
    }
    if (validatedData.hasOwnProperty('learning_plan_study_days_of_week')) {
      // For JSON fields, Prisma expects JsonNull if you want to set it to null,
      // or the actual JSON array. If the field is undefined in validatedData (because it was optional and not provided),
      // it means we don't want to update it. If it's explicitly null, we set it to JsonNull.
      dataToUpdate.learning_plan_study_days_of_week = validatedData.learning_plan_study_days_of_week === null 
        ? Prisma.JsonNull 
        : validatedData.learning_plan_study_days_of_week; // This will be the array or undefined
    }
    if (validatedData.hasOwnProperty('learning_plan_preferred_exam_target')) {
      dataToUpdate.learning_plan_preferred_exam_target = validatedData.learning_plan_preferred_exam_target;
    }
    
    // Prevent attempting an update with no actual data
    if (Object.keys(dataToUpdate).length === 0) {
        // If client sends empty object or object with only undefined values after processing
        // Fetch current state and return it, or return a specific message.
        const currentUserPlan = await prisma.user.findUnique({
            where: {user_id: userId},
            select: {
                learning_plan_start_date: true,
                learning_plan_end_date: true,
                learning_plan_study_days_of_week: true,
                learning_plan_preferred_exam_target: true,
            }
        });
        return NextResponse.json(currentUserPlan);
    }


    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: dataToUpdate,
      select: {
        learning_plan_start_date: true,
        learning_plan_end_date: true,
        learning_plan_study_days_of_week: true,
        learning_plan_preferred_exam_target: true,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    // ZodError already handled by safeParse
    console.error('Error updating learning plan:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

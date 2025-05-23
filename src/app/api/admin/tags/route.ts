import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Role, Prisma } from '@prisma/client'; // Import Role enum and Prisma for error types

const createTagSchema = z.object({
  name: z.string().min(1, "Tag name cannot be empty").max(50, "Tag name cannot exceed 50 characters"), // field in schema is 'name'
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.admin) {
    return NextResponse.json({ message: 'Forbidden: User is not an admin' }, { status: 403 });
  }

  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }, // field in schema is 'name'
      include: {
        _count: { // Include count of related articles
          select: { articles: true },
        },
      },
    });
    // Transform tags to include article_count directly
    const tagsWithCount = tags.map(tag => ({
        tag_id: tag.tag_id,
        name: tag.name,
        created_at: tag.created_at,
        article_count: tag._count.articles
    }));


    return NextResponse.json(tagsWithCount);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.admin) {
    return NextResponse.json({ message: 'Forbidden: User is not an admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    const newTag = await prisma.tag.create({
      data: {
        name: validatedData.name, // field in schema is 'name'
      },
    });
    // Return the new tag with an article_count of 0
    return NextResponse.json({...newTag, article_count: 0 }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // P2002 is unique constraint violation. 'name' field is @unique for Tag model.
      return NextResponse.json({ message: 'Tag name already exists' }, { status: 409 });
    }
    console.error('Error creating tag:', error);
    return NextResponse.json({ message: 'Failed to create tag' }, { status: 500 });
  }
}

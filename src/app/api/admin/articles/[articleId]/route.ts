import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client'; // Import Role enum

export async function GET(request: Request, { params }: { params: { articleId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.admin) {
    return NextResponse.json({ message: 'Forbidden: User is not an admin' }, { status: 403 });
  }

  const { articleId } = params;

  if (!articleId) {
    return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUniqueOrThrow({
      where: { article_id: articleId },
      include: {
        author: { // Relation to User model, aliased as 'author' in Prisma schema
          select: { // Select specific fields from the related User
            user_id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        tags: { // Relation to ArticleTag junction table
          include: {
            tag: true, // Include the actual Tag record from ArticleTag
          },
        },
        newWords: true, // Direct relation name in Prisma schema
        phrases: true,  // Direct relation name in Prisma schema
        comprehensionQuestions: { // Direct relation name in Prisma schema
          include: {
            options: true, // Include options for each question
          },
        },
      },
    });

    return NextResponse.json(article);

  } catch (error: any) {
    if (error.name === 'NotFoundError' || (error.code === 'P2025' && error.meta?.cause === 'Record to update not found.')) { // Prisma's specific error for findUniqueOrThrow
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }
    console.error(`Error fetching article ${articleId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

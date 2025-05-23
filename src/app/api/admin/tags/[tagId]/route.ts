import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Role, Prisma } from '@prisma/client'; // Import Role enum and Prisma for error types

export async function DELETE(request: Request, { params }: { params: { tagId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.admin) {
    return NextResponse.json({ message: 'Forbidden: User is not an admin' }, { status: 403 });
  }

  const { tagId } = params;

  if (!tagId) { // Basic check, though Next.js routing usually ensures tagId is present
    return NextResponse.json({ message: 'Tag ID is required' }, { status: 400 });
  }
  
  // My tag_id in Prisma is a String (CUID), so no need to parse to Int.

  try {
    // Check if tag is used by any articles
    // The junction table in my schema is ArticleTag
    const existingAssociations = await prisma.articleTag.count({
      where: { tag_id: tagId },
    });

    if (existingAssociations > 0) {
      return NextResponse.json({ message: 'Tag is currently associated with articles and cannot be deleted.' }, { status: 400 });
    }

    // If not used, delete the tag
    await prisma.tag.delete({
      where: { tag_id: tagId },
    });

    return NextResponse.json({ message: 'Tag deleted successfully' }, { status: 200 });

  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // "Record to delete not found"
        return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
      }
    }
    console.error(`Error deleting tag ${tagId}:`, error);
    return NextResponse.json({ message: 'Failed to delete tag' }, { status: 500 });
  }
}

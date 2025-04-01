import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../../lib/db";
import { comments, posts, users } from "../../../../../../lib/db/schema";
import { eq } from "drizzle-orm";

// Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const postComments = await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      with: {
        author: true,
      },
      orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    });

    return NextResponse.json({ comments: postComments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Add a comment to a post
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const postId = parseInt(params.postId);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    // Find user in database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if post exists
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Create comment
    const newComment = await db.insert(comments).values({
      content,
      postId,
      userId: dbUser.id,
    }).returning();

    // Get full comment with author
    const commentWithAuthor = await db.query.comments.findFirst({
      where: eq(comments.id, newComment[0].id),
      with: {
        author: true,
      },
    });

    return NextResponse.json({ comment: commentWithAuthor }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
} 
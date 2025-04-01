import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../../lib/db";
import { likes, posts, users } from "../../../../../../lib/db/schema";
import { and, eq } from "drizzle-orm";

// Get likes for a post
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

    const postLikes = await db.query.likes.findMany({
      where: eq(likes.postId, postId),
      with: {
        user: true,
      },
    });

    return NextResponse.json({ likes: postLikes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// Like or unlike a post
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

    // Check if user already liked the post
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.postId, postId),
        eq(likes.userId, dbUser.id)
      ),
    });

    // If like exists, remove it (unlike)
    if (existingLike) {
      await db.delete(likes).where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, dbUser.id)
        )
      );
      return NextResponse.json({ liked: false }, { status: 200 });
    }

    // Otherwise, add a like
    await db.insert(likes).values({
      postId,
      userId: dbUser.id,
    });

    return NextResponse.json({ liked: true }, { status: 201 });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
} 
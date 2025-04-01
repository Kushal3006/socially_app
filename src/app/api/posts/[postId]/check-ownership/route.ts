import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../../../lib/db";
import { posts, users } from "../../../../../../lib/db/schema";
import { and, eq } from "drizzle-orm";

// Check if the current user is the post owner
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { isOwner: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const postId = parseInt(params.postId);
    if (isNaN(postId)) {
      return NextResponse.json(
        { isOwner: false, error: "Invalid post ID" },
        { status: 400 }
      );
    }

    // Find the user in our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { isOwner: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get the post
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      return NextResponse.json(
        { isOwner: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if the user is the post owner
    const isOwner = post.userId === dbUser.id;

    return NextResponse.json(
      { isOwner, userId: dbUser.id, postUserId: post.userId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking post ownership:", error);
    return NextResponse.json(
      { isOwner: false, error: "Failed to check post ownership" },
      { status: 500 }
    );
  }
} 
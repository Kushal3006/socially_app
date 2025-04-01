import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../../lib/db";
import { posts, users } from "../../../../../lib/db/schema";
import { and, eq, desc } from "drizzle-orm";

// Get a single post by ID
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

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        author: true,
        likes: true,
        comments: {
          with: {
            author: true,
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    console.log("API Post data:", JSON.stringify(post, null, 2));

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Update a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
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
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get the post to update
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the post
    if (post.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this post" },
        { status: 403 }
      );
    }

    const { content, image } = await req.json();

    // Update post
    const updatedPost = await db.update(posts)
      .set({
        content,
        image,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    return NextResponse.json({ post: updatedPost[0] }, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
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
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get the post to delete
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the post
    if (post.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this post" },
        { status: 403 }
      );
    }

    // Delete post
    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
} 
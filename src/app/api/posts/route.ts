import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";
import { posts, users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

// Get all posts
export async function GET(req: NextRequest) {
  try {
    const posts = await db.query.posts.findMany({
      with: {
        author: true,
        likes: true,
        comments: {
          with: {
            author: true,
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    const { content, image } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create post
    const newPost = await db.insert(posts).values({
      content,
      image,
      userId: dbUser.id,
    }).returning();

    return NextResponse.json({ post: newPost[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
} 
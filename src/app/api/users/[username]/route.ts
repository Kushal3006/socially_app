import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { users } from "../../../../../lib/db/schema";
import { eq } from "drizzle-orm";

// Get user profile
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        posts: {
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
        },
        followers: {
          with: {
            follower: true,
          },
        },
        following: {
          with: {
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Count followers and following
    const followerCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    // Create user profile response
    const userProfile = {
      ...user,
      followerCount,
      followingCount,
    };

    return NextResponse.json({ user: userProfile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
} 
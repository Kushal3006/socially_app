import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../../lib/db";
import { follows, users } from "../../../../../../lib/db/schema";
import { and, eq } from "drizzle-orm";

// Check if following
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
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

    const username = params.username;

    // Find current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find target user
    const targetUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, currentUser.id),
        eq(follows.followingId, targetUser.id)
      ),
    });

    return NextResponse.json({ following: !!existingFollow }, { status: 200 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}

// Follow or unfollow user
export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
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

    const username = params.username;

    // Find current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find target user
    const targetUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Can't follow yourself
    if (currentUser.id === targetUser.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, currentUser.id),
        eq(follows.followingId, targetUser.id)
      ),
    });

    // If already following, unfollow
    if (existingFollow) {
      await db.delete(follows).where(
        and(
          eq(follows.followerId, currentUser.id),
          eq(follows.followingId, targetUser.id)
        )
      );
      return NextResponse.json({ following: false }, { status: 200 });
    }

    // Otherwise, follow
    await db.insert(follows).values({
      followerId: currentUser.id,
      followingId: targetUser.id,
    });

    return NextResponse.json({ following: true }, { status: 201 });
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
} 
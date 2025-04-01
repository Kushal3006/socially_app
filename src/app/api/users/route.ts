import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

// Get the current user
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find user in database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: dbUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Create or update a user
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get data from request
    const { username, name, bio, location, website } = await req.json();

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await db.update(users)
        .set({
          username,
          name: name || user.firstName + " " + user.lastName,
          bio,
          location,
          website,
          image: user.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, user.id))
        .returning();

      return NextResponse.json({ user: updatedUser[0] }, { status: 200 });
    } else {
      // Create new user
      const newUser = await db.insert(users)
        .values({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          username: username || user.username,
          name: name || user.firstName + " " + user.lastName,
          bio,
          location,
          website,
          image: user.imageUrl,
        })
        .returning();

      return NextResponse.json({ user: newUser[0] }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 }
    );
  }
} 
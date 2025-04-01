import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../../lib/db";
import { users } from "../../../../../lib/db/schema";
import { eq } from "drizzle-orm";

// Get current user profile
export async function GET(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user from our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    // If no user found, create a basic profile
    if (!dbUser) {
      // Generate username from email if not available
      const username = user.username || 
        (user.emailAddresses[0]?.emailAddress 
          ? user.emailAddresses[0].emailAddress.split("@")[0] 
          : `user${Date.now().toString().slice(-4)}`);
      
      // Create user profile
      const newUser = await db.insert(users).values({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        username: username,
        image: user.imageUrl,
      }).returning();

      return NextResponse.json({ 
        user: newUser[0],
        isNewUser: true
      }, { status: 201 });
    }

    return NextResponse.json({ 
      user: dbUser,
      isNewUser: false
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PATCH(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the request body
    const { name, username, bio, image, location, website } = await req.json();

    // Validate required fields
    if (!name || !username) {
      return NextResponse.json(
        { error: "Name and username are required" },
        { status: 400 }
      );
    }

    // Basic username validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    // Check if username is already taken (by another user)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUser && existingUser.clerkId !== user.id) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await db
      .update(users)
      .set({
        name,
        username,
        bio,
        image,
        location,
        website,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, user.id))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: updatedUser[0],
      message: "Profile updated successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
} 
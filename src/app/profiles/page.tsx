import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { users } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilesIndex() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    // If not logged in, redirect to sign in
    redirect("/sign-in");
  }

  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      redirect("/sign-in");
    }

    // Try to get from database first
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    
    // If found in database and has a username, redirect to profile
    if (dbUser?.username) {
      redirect(`/profiles/${dbUser.username}`);
    }
    
    // If not in database or no username, create a user
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
      
      redirect(`/profiles/${newUser[0].username}`);
    }
    
    // If we have a Clerk username but not in DB, update the DB
    if (user.username && dbUser) {
      await db.update(users)
        .set({ username: user.username })
        .where(eq(users.id, dbUser.id));
      
      redirect(`/profiles/${user.username}`);
    }
    
    // If all else fails, generate a username
    const generatedUsername = `user${Date.now().toString().slice(-4)}`;
    
    if (dbUser) {
      await db.update(users)
        .set({ username: generatedUsername })
        .where(eq(users.id, dbUser.id));
      
      redirect(`/profiles/${generatedUsername}`);
    } else {
      // Redirect to home as fallback
      redirect("/");
    }
  } catch (error) {
    console.error("Error handling user profile:", error);
    redirect("/");
  }
} 
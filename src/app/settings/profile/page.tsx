import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { EditProfileForm } from "@/components/EditProfileForm";

export default async function EditProfilePage() {
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

    // Get the user from the database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    
    // If no user found in the database, redirect to create a profile
    if (!dbUser) {
      redirect("/profiles");
    }

    return (
      <div className="container max-w-screen-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <EditProfileForm user={dbUser} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    redirect("/");
  }
} 
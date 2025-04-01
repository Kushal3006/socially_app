import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function ProfileRedirect() {
  const session = await auth();
  const userId = session.userId;

  if (userId) {
    // If logged in, redirect to their profile
    redirect("/profiles");
  } else {
    // If not logged in, redirect to home
    redirect("/");
  }
} 
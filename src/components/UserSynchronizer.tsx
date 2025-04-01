"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export function UserSynchronizer() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Only run this if user is signed in
    if (!isSignedIn || !userId || !user) return;

    const syncUserWithDatabase = async () => {
      try {
        // First check if the user exists in our database
        const res = await fetch(`/api/users`);
        
        if (res.status === 404) {
          // User not found in database, let's create them
          await createUser();
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    const createUser = async () => {
      try {
        const userData = {
          username: user.username || `user${Date.now().toString().slice(-4)}`,
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          bio: "",
          location: "",
          website: "",
        };

        const res = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!res.ok) {
          throw new Error("Failed to create user");
        }

        toast.success("Profile created successfully!");
      } catch (error) {
        console.error("Error creating user:", error);
      }
    };

    syncUserWithDatabase();
  }, [userId, isSignedIn, user]);

  return null; // This component doesn't render anything
} 
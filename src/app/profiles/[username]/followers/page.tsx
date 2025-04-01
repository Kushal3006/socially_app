import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "../../../../../lib/db";
import { users } from "../../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, UserIcon } from "lucide-react";

export async function generateMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  const user = await getUserProfile(params.username);
  if (!user) {
    return {
      title: "User Not Found | Socially",
    };
  }

  return {
    title: `Followers of ${user.name} | Socially`,
    description: `People following ${user.name} on Socially`,
  };
}

async function getUserProfile(username: string) {
  try {
    const userProfile = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        followers: {
          with: {
            follower: true,
          },
        },
      },
    });

    return userProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// Function to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default async function FollowersPage({ 
  params 
}: { 
  params: { username: string } 
}) {
  const session = await auth();
  const currentUserId = session.userId;
  const profile = await getUserProfile(params.username);

  if (!profile) {
    notFound();
  }

  const safeUsername = profile.username || '';

  return (
    <main className="container max-w-screen-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href={`/profiles/${safeUsername}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to profile</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Followers of @{safeUsername}</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.followers.length === 0 ? (
            <div className="text-center py-6">
              <UserIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-lg font-medium">No followers yet</p>
              <p className="text-muted-foreground">
                When someone follows {profile.name}, they'll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.followers.map((follow) => (
                <div 
                  key={follow.follower.id} 
                  className="flex items-center justify-between py-2"
                >
                  <Link 
                    href={`/profiles/${follow.follower.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <Avatar>
                      <AvatarImage 
                        src={follow.follower.image || ""} 
                        alt={follow.follower.name} 
                      />
                      <AvatarFallback>
                        {getInitials(follow.follower.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.follower.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{follow.follower.username || ''}
                      </p>
                    </div>
                  </Link>
                  
                  {currentUserId && follow.follower.clerkId !== currentUserId && (
                    <FollowButton username={follow.follower.username} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
} 
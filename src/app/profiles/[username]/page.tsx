import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Users,
  MessageSquare,
} from "lucide-react";
import { PostFeed } from "@/components/PostFeed";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { FollowButton } from "@/components/FollowButton";

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
    title: `${user.name} (@${user.username}) | Socially`,
    description: user.bio || `Check out ${user.name}'s profile on Socially`,
  };
}

async function getUserProfile(username: string) {
  try {
    const userProfile = await db.query.users.findFirst({
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

    if (!userProfile) return null;

    // Count followers and following
    const followerCount = userProfile.followers?.length || 0;
    const followingCount = userProfile.following?.length || 0;

    // Add counts to user profile
    return {
      ...userProfile,
      followerCount,
      followingCount,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export default async function ProfilePage({ 
  params 
}: { 
  params: { username: string } 
}) {
  const session = await auth();
  const userId = session.userId;
  const profile = await getUserProfile(params.username);

  if (!profile) {
    notFound();
  }

  // Check if this is the current user's profile
  const isCurrentUser = userId ? profile.clerkId === userId : false;

  // Format date joined
  const dateJoined = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const safeUsername = profile.username || '';

  return (
    <main className="container max-w-screen-md mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex justify-center md:justify-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.image || ""} alt={profile.name} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="md:col-span-3 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <p className="text-muted-foreground">@{safeUsername}</p>
                  </div>
                  {isCurrentUser ? (
                    <Button asChild variant="outline" className="mt-2 md:mt-0">
                      <Link href="/settings/profile">Edit Profile</Link>
                    </Button>
                  ) : (
                    <FollowButton username={safeUsername} />
                  )}
                </div>
                
                {profile.bio && (
                  <p className="mb-4">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {dateJoined}</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link href={`/profiles/${safeUsername}/following`} className="flex items-center gap-1 hover:underline">
                    <span className="font-bold">{profile.followingCount}</span>
                    <span className="text-muted-foreground">Following</span>
                  </Link>
                  <Link href={`/profiles/${safeUsername}/followers`} className="flex items-center gap-1 hover:underline">
                    <span className="font-bold">{profile.followerCount}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs - Would be better with client components, simplified here */}
        <div className="border-b flex">
          <div className="px-4 py-2 border-b-2 border-primary font-medium">
            Posts
          </div>
        </div>
        
        {/* Posts */}
        <PostFeed username={safeUsername} initialPosts={profile.posts} />
      </div>
    </main>
  );
} 
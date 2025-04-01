import Link from "next/link";
import { PostFeed } from "@/components/PostFeed";
import { NewPostForm } from "@/components/NewPostForm";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { RealtimePosts } from "@/components/RealtimePosts";
import { db } from "../../lib/db";
import { desc } from "drizzle-orm";

export default async function Home() {
  const session = await auth();
  const userId = session.userId;
  const isAuthenticated = !!userId;

  // Fetch initial posts for authenticated and non-authenticated users
  const initialPosts = await db.query.posts.findMany({
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
    limit: 10,
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="max-w-3xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Socially</h1>
          <p className="text-muted-foreground">Connect with friends and share what's on your mind.</p>
        </div>

        {isAuthenticated ? (
          <>
            <div className="mb-8">
              <RealtimePosts initialPosts={initialPosts} />
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8 mb-8 bg-muted rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Welcome to Socially</h2>
              <p className="mb-6 text-muted-foreground max-w-md mx-auto">
                Sign in to connect with friends, share updates, and explore content from people around you.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sign-up">Create Account</Link>
                </Button>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            <PostFeed initialPosts={initialPosts} />
          </>
        )}
      </div>
    </main>
  );
}

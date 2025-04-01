import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Share,
  MoreHorizontal,
  Edit,
  Trash
} from "lucide-react";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { db } from "../../../../lib/db";
import { posts } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { DeletePostButton } from "@/components/DeletePostButton";

export async function generateMetadata({ 
  params 
}: { 
  params: { postId: string } 
}): Promise<Metadata> {
  const post = await getPost(parseInt(params.postId));
  
  if (!post) {
    return {
      title: "Post Not Found | Socially",
    };
  }

  return {
    title: `${post.author.name}'s Post | Socially`,
    description: post.content.substring(0, 160),
  };
}

async function getPost(postId: number) {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        author: true,
        likes: {
          with: {
            user: true,
          },
        },
        comments: {
          with: {
            author: true,
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: { postId: string } 
}) {
  const session = await auth();
  const userId = session.userId;
  const postId = parseInt(params.postId);
  const post = await getPost(postId);

  if (!post) {
    notFound();
  }

  // Function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format date
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  // Check if user has liked the post
  const isLiked = userId ? post.likes.some(like => like.user?.clerkId === userId) : false;
  
  // Check if this is the current user's post
  const isAuthor = userId ? post.author.clerkId === userId : false;

  const safeUsername = post.author.username || '';

  return (
    <main className="container max-w-screen-md mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Feed
            </Link>
          </Button>
          
          {isAuthor && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <Link href={`/posts/${post.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <Link href={`/profiles/${safeUsername}`}>
                <Avatar>
                  <AvatarImage src={post.author.image || ""} alt={post.author.name} />
                  <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link 
                  href={`/profiles/${safeUsername}`}
                  className="font-medium hover:underline"
                >
                  {post.author.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  @{safeUsername} • {formattedDate}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
            {post.image && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img 
                  src={post.image} 
                  alt="Post image" 
                  className="w-full object-cover max-h-[400px]" 
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-between">
            <div className="flex items-center gap-2">
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{post.likes.length} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments.length} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              <span>Share</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mb-6">
        <CommentForm postId={postId} />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        <CommentList comments={post.comments} />
      </div>
    </main>
  );
} 
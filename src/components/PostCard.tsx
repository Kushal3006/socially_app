"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Edit
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { DeletePostButton } from "./DeletePostButton";

type PostProps = {
  post: {
    id: number;
    content: string;
    image?: string | null;
    createdAt: string | Date;
    author: {
      id: number;
      name: string;
      username: string | null;
      image?: string | null;
      clerkId?: string | null;
    };
    likes: any[];
    comments: any[];
  };
  onPostDeleted?: (postId: number) => void;
};

export function PostCard({ post, onPostDeleted }: PostProps) {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.user?.clerkId === userId)
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);

  // Log debug info
  useEffect(() => {
    console.log("PostCard author:", post.author);
    console.log("Current userId:", userId);
    console.log("Author clerkId:", post.author.clerkId);
  }, [post.author, userId]);

  // Check if the current user is the author of the post
  const isAuthor = userId && post.author.clerkId === userId;

  const handleLike = async () => {
    if (!isSignedIn) {
      return router.push('/sign-in');
    }
    
    try {
      const res = await fetch(`/api/posts/${post.id}/likes`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to like post");

      const data = await res.json();
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleEdit = () => {
    router.push(`/posts/${post.id}/edit`);
  };

  const handleComment = () => {
    router.push(`/posts/${post.id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to copy link");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const username = post.author.username || "";

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Link href={`/profiles/${username}`}>
              <Avatar>
                <AvatarImage src={post.author.image || ""} alt={post.author.name} />
                <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link 
                href={`/profiles/${username}`}
                className="font-medium hover:underline"
              >
                {post.author.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                @{username} • {formattedDate}
              </p>
            </div>
          </div>
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <DeletePostButton 
                    postId={post.id} 
                    variant="ghost" 
                    onDeleted={() => onPostDeleted?.(post.id)} 
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
        <Button variant="ghost" size="sm" onClick={handleLike}>
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          {likeCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleComment}>
          <MessageCircle className="h-4 w-4 mr-1" />
          {post.comments.length}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share className="h-4 w-4 mr-1" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
} 
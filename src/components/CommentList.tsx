"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { 
  MoreHorizontal,
  Trash
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { toast } from "sonner";

type Comment = {
  id: number;
  content: string;
  createdAt: string | Date;
  author: {
    id: number;
    name: string;
    username: string | null;
    image?: string | null;
  };
};

export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const { userId } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if the current user is the author of the comment
  const isAuthor = comment.author.id.toString() === userId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/posts/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const username = comment.author.username || '';

  return (
    <div className="flex gap-3 p-4 bg-card rounded-lg border shadow-sm">
      <Link href={`/profiles/${username}`}>
        <Avatar>
          <AvatarImage src={comment.author.image || ''} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              href={`/profiles/${username}`}
              className="font-medium hover:underline"
            >
              {comment.author.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{username} • {formattedDate}
            </p>
          </div>
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

export function CommentForm({ postId }: { postId: number }) {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      return router.push('/sign-in');
    }
    
    if (!content.trim()) {
      toast.error("Please add some content to your comment");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to create comment");
      }

      // Reset form
      setContent("");
      
      toast.success("Comment added successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center">
        <p className="mb-2">Sign in to leave a comment</p>
        <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt="Your profile" />
          <AvatarFallback>YOU</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          type="submit"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
} 
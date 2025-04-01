"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface DeletePostButtonProps {
  postId: number;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onDeleted?: () => void;
}

export function DeletePostButton({ 
  postId, 
  variant = "destructive", 
  size = "sm",
  onDeleted 
}: DeletePostButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    // Check if the user is the post owner - direct API call
    async function checkPostOwnership() {
      try {
        const res = await fetch(`/api/posts/${postId}/check-ownership`);
        if (res.ok) {
          const data = await res.json();
          setCanDelete(data.isOwner);
        } else {
          console.error("Error checking post ownership");
          setCanDelete(false);
        }
      } catch (error) {
        console.error("Error checking post ownership:", error);
        setCanDelete(false);
      } finally {
        setLoading(false);
      }
    }

    checkPostOwnership();
  }, [postId, isSignedIn, userId]);

  const handleDelete = async () => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      toast.success("Post deleted successfully");
      
      if (onDeleted) {
        onDeleted();
      } else {
        // Navigate to home page if no callback provided
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled={true}
      >
        <Trash className="h-4 w-4 mr-1" />
        ...
      </Button>
    );
  }

  if (!canDelete) {
    return null; // Don't show the button if user can't delete
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      disabled={isDeleting}
      onClick={handleDelete}
    >
      <Trash className="h-4 w-4 mr-1" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
} 
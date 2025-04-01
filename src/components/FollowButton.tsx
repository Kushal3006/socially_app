"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function FollowButton({ username }: { username: string | null }) {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const safeUsername = username || '';

  useEffect(() => {
    if (isSignedIn && safeUsername) {
      checkFollowStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [safeUsername, userId, isSignedIn]);

  const checkFollowStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const res = await fetch(`/api/users/${safeUsername}/follow`);
      if (!res.ok) throw new Error('Failed to check follow status');
      
      const data = await res.json();
      setIsFollowing(data.following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleFollowClick = async () => {
    if (!isSignedIn) {
      return router.push('/sign-in');
    }

    if (!safeUsername) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${safeUsername}/follow`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to toggle follow');
      
      const data = await res.json();
      setIsFollowing(data.following);
      
      toast.success(data.following 
        ? `You are now following @${safeUsername}` 
        : `You unfollowed @${safeUsername}`
      );
      
      router.refresh();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCheckingStatus) return "...";
    return isFollowing ? "Unfollow" : "Follow";
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollowClick}
      disabled={isLoading || isCheckingStatus}
    >
      {getButtonText()}
    </Button>
  );
} 
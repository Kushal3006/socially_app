"use client";

import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { Skeleton } from "./ui/skeleton";

type Post = {
  id: number;
  content: string;
  image?: string | null;
  createdAt: string | Date;
  author: {
    id: number;
    name: string;
    username: string | null;
    image?: string | null;
  };
  likes: any[];
  comments: any[];
};

export function PostFeed({ 
  username, 
  initialPosts,
  onAddPost
}: { 
  username?: string | null; 
  initialPosts?: Post[];
  onAddPost?: (callback: (post: Post) => void) => void;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);

  // Register the addPost callback
  useEffect(() => {
    if (onAddPost) {
      onAddPost((newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
      });
    }
  }, [onAddPost]);

  useEffect(() => {
    if (initialPosts) return;
    
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const endpoint = username 
          ? `/api/users/${username}/posts` 
          : '/api/posts';
        
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch posts');
        
        const data = await res.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [username, initialPosts]);

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <h3 className="font-medium text-lg mb-2">No posts yet</h3>
        <p className="text-muted-foreground">
          {username ? `${username} hasn't posted anything yet.` : "Be the first to post something!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onPostDeleted={handlePostDeleted}
        />
      ))}
    </div>
  );
} 
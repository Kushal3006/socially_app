"use client";

import { useRef, useState } from "react";
import { NewPostForm } from "./NewPostForm";
import { PostFeed } from "./PostFeed";

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

export function RealtimePosts({ initialPosts }: { initialPosts?: Post[] }) {
  // Use a ref to store the callback function
  const addPostCallbackRef = useRef<((post: Post) => void) | null>(null);
  
  // Handler for when a new post is created
  const handlePostCreated = (post: Post) => {
    // Call the callback function if it exists
    if (addPostCallbackRef.current) {
      addPostCallbackRef.current(post);
    }
  };
  
  // Register the callback function from PostFeed
  const registerAddPostCallback = (callback: (post: Post) => void) => {
    addPostCallbackRef.current = callback;
  };

  return (
    <>
      <div className="mb-8">
        <NewPostForm onPostCreated={handlePostCreated} />
      </div>
      <PostFeed onAddPost={registerAddPostCallback} initialPosts={initialPosts} />
    </>
  );
} 
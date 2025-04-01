"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

// type Post = {
//   id: number;
//   content: string;
//   image?: string | null;
//   createdAt: string | Date;
//   author: {
//     id: number;
//     name: string;
//     username: string | null;
//     image?: string | null;
//   };
//   likes: any[];
//   comments: any[];
// };

type Post = {
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

export function NewPostForm({ 
  onPostCreated 
}: { 
  onPostCreated?: (post: Post) => void 
}) {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    image: string | null;
  } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchUserProfile() {
      try {
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfileData({
              name: data.user.name,
              image: data.user.image
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    fetchUserProfile();
  }, [isSignedIn]);

  // For demo purposes - in a real app you'd use a proper image upload service
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      toast.error("You must be signed in to create a post");
      return;
    }
    
    if (!content.trim() && !image) {
      toast.error("Please add some content to your post");
      return;
    }

    try {
      setIsSubmitting(true);

      // First, ensure the user exists in our database
      const userRes = await fetch("/api/users");
      if (!userRes.ok && userRes.status !== 404) {
        throw new Error("Failed to verify user");
      }

      if (userRes.status === 404) {
        // User not found, let's create a basic profile
        const createUserRes = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: `user${Date.now().toString().slice(-4)}`,
          }),
        });
        
        if (!createUserRes.ok) {
          throw new Error("Failed to create user profile");
        }
      }

      // Now create the post
      const postData = {
        content: content.trim(),
        image: image,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const responseData = await res.json();
      const newPost = responseData.post;

      // Reset form
      setContent("");
      setImage(null);
      setImageFile(null);
      
      toast.success("Post created successfully!");
      
      // Call the callback if provided, to update the UI in real-time
      if (onPostCreated && newPost) {
        // Fetch the complete post with author info
        const fullPostRes = await fetch(`/api/posts/${newPost.id}`);
        if (fullPostRes.ok) {
          const fullPostData = await fullPostRes.json();
          onPostCreated(fullPostData.post);
        } else {
          // If we can't get the full post, still update with what we have
          onPostCreated(newPost);
        }
      } else {
        // Fall back to refresh if no callback
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "";
  };

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="mb-4">Please sign in to create posts</p>
          <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage 
                src={profileData?.image || user?.imageUrl || ""} 
                alt="Your profile" 
              />
              <AvatarFallback>
                {profileData?.name ? getInitials(profileData.name) : user?.firstName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none resize-none focus-visible:ring-0 p-3 shadow-none min-h-[100px]"
              />
              {image && (
                <div className="relative mt-2 rounded-md overflow-hidden border">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img 
                    src={image} 
                    alt="Post preview" 
                    className="max-h-[300px] w-full object-cover" 
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm">Image</span>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || (!content.trim() && !image)}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 
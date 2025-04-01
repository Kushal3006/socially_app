"use client";

import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { ModeToggle } from "./ModelToggle";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function DesktopNavbar() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [username, setUsername] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const router = useRouter();
  
  // Fetch user profile when authenticated
  useEffect(() => {
    async function fetchUserProfile() {
      if (!isSignedIn) return;
      
      try {
        setIsLoadingProfile(true);
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.username) {
            setUsername(data.user.username);
          } else {
            // Fallback to Clerk username
            setUsername(
              user?.username || 
              (user?.emailAddresses[0]?.emailAddress 
                ? user.emailAddresses[0].emailAddress.split("@")[0] 
                : "")
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchUserProfile();
  }, [isSignedIn, user]);

  const handleProfileClick = (event: React.MouseEvent) => {
    if (!username) {
      event.preventDefault();
      router.push('/profiles');
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {isSignedIn ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            disabled={isLoadingProfile}
            onClick={handleProfileClick}
            asChild={!!username}
          >
            {username ? (
              <Link href={`/profiles/${username}`}>
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Profile</span>
              </Link>
            ) : (
              <>
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Profile</span>
              </>
            )}
          </Button>
          <UserButton afterSignOutUrl="/" />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;
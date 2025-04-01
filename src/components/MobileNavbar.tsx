"use client";

import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useAuth, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
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
    <div className="flex md:hidden items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-2"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 justify-start" 
              asChild
              onClick={() => setShowMobileMenu(false)}
            >
              <Link href="/">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start" 
                  asChild
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Link href="/notifications">
                    <BellIcon className="w-4 h-4" />
                    Notifications
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start" 
                  disabled={isLoadingProfile}
                  onClick={(e) => {
                    handleProfileClick(e);
                    setShowMobileMenu(false);
                  }}
                  asChild={!!username}
                >
                  {username ? (
                    <Link href={`/profiles/${username}`}>
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </Link>
                  ) : (
                    <>
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </>
                  )}
                </Button>
                <SignOutButton>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 justify-start w-full"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
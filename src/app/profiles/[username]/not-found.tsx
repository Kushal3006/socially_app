import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="container max-w-screen-md mx-auto px-4 py-16 flex flex-col items-center text-center">
      <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The user profile you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/profiles">View Your Profile</Link>
        </Button>
      </div>
    </div>
  );
} 
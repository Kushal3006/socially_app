import Link from 'next/link';
import { UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-md">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 space-y-2">
          <h2 className="text-lg font-medium mb-3">Settings</h2>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/settings/profile">
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
} 
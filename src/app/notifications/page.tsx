import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { db } from "../../../lib/db";
import { notifications, users } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  // Find user in database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) {
    redirect("/");
  }

  // Fetch notifications
  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, dbUser.id),
    with: {
      actor: true,
      post: true,
    },
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
  });

  // Format notifications
  const formatNotification = (notification: any) => {
    const actorName = notification.actor?.name || "Someone";
    
    switch(notification.type) {
      case "like":
        return `${actorName} liked your post`;
      case "comment":
        return `${actorName} commented on your post`;
      case "follow":
        return `${actorName} started following you`;
      default:
        return `You have a new notification`;
    }
  };

  return (
    <main className="container max-w-screen-md mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      
      {userNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Bell className="w-12 h-12 mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-muted-foreground">
              When you get notifications, they'll show up here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userNotifications.map((notification) => (
            <Card key={notification.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p>{formatNotification(notification)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
} 
ALTER TABLE "socially" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "socially_clerkId_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" varchar(255);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "Bio";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerkId_unique" UNIQUE("clerkId");
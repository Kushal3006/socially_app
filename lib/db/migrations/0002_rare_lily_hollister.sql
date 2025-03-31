ALTER TABLE "socially" RENAME COLUMN "title" TO "email";--> statement-breakpoint
ALTER TABLE "socially" RENAME COLUMN "description" TO "username";--> statement-breakpoint
ALTER TABLE "socially" ADD COLUMN "clerkId" varchar(50);--> statement-breakpoint
ALTER TABLE "socially" ADD CONSTRAINT "socially_clerkId_unique" UNIQUE("clerkId");
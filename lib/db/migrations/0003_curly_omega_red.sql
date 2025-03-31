ALTER TABLE "socially" RENAME COLUMN "completed" TO "name";--> statement-breakpoint
ALTER TABLE "socially" ADD COLUMN "Bio" varchar(255);--> statement-breakpoint
ALTER TABLE "socially" ADD COLUMN "image" varchar;--> statement-breakpoint
ALTER TABLE "socially" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "socially" ADD COLUMN "website" varchar;
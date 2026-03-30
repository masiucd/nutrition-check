ALTER TABLE "user_info" ADD COLUMN "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "user_info" ADD COLUMN "last_name" varchar(100);--> statement-breakpoint
ALTER TABLE "user_info" DROP COLUMN "name";
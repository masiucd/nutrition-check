ALTER TABLE "gender" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "gender" ADD CONSTRAINT "gender_id_unique" UNIQUE("id");
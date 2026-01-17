CREATE TABLE "gender" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gender_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" varchar(50) NOT NULL,
	CONSTRAINT "gender_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(512) NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_info" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"age" integer,
	"gender" integer
);
--> statement-breakpoint
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id") ON DELETE no action ON UPDATE no action;
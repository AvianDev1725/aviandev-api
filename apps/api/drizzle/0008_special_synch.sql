CREATE TABLE "content_fragments" (
	"key" text PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"data" jsonb NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_fragments" ADD CONSTRAINT "content_fragments_model_id_content_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."content_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_fragments" ADD CONSTRAINT "content_fragments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
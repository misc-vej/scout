ALTER TABLE "collections" ADD COLUMN "is_shiny" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "conservation_status" text;
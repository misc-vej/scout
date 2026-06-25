CREATE TABLE "occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species_id" uuid NOT NULL,
	"grid_square" text NOT NULL,
	"record_count" integer DEFAULT 0 NOT NULL,
	"last_fetched_at" timestamp DEFAULT now() NOT NULL,
	"source" text DEFAULT 'nbn_atlas' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "occurrences_species_grid_idx" ON "occurrences" USING btree ("species_id","grid_square");--> statement-breakpoint
CREATE INDEX "occurrences_grid_square_idx" ON "occurrences" USING btree ("grid_square");
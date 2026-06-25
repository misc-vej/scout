CREATE TYPE "public"."rarity_tier" AS ENUM('common', 'uncommon', 'rare', 'super_rare', 'legendary', 'mythic');--> statement-breakpoint
CREATE TYPE "public"."sensitivity_level" AS ENUM('none', 'caution', 'sensitive', 'restricted');--> statement-breakpoint
CREATE TABLE "species" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"common_name" text NOT NULL,
	"scientific_name" text NOT NULL,
	"tvk" text,
	"rarity_tier" "rarity_tier" NOT NULL,
	"sensitivity_level" "sensitivity_level" DEFAULT 'none' NOT NULL,
	"can_be_shiny" boolean DEFAULT false NOT NULL,
	"season_lock_start" text,
	"season_lock_end" text,
	"description" text,
	"image_url" text,
	"taxonomy_group" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "species_scientific_name_unique" UNIQUE("scientific_name")
);

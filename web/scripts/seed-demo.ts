/**
 * seed-demo.ts
 *
 * Reads all .txt scene files from game-content/scenes/demo/,
 * uploads them to Supabase Storage ("game-scenes" bucket),
 * and upserts the game record in the "games" table.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const GAME_SLUG = "the-silk-throne";
const SCENES_DIR = path.resolve(__dirname, "../../game-content/final");
const STORAGE_BUCKET = "game-scenes";

async function main() {
  console.log("=== Silk Throne Full Game Seed ===\n");

  // ---------------------------------------------------------------
  // 1. Read all .txt files from the demo scenes directory
  // ---------------------------------------------------------------
  const files = fs
    .readdirSync(SCENES_DIR)
    .filter((f) => f.endsWith(".txt"))
    .sort();

  if (files.length === 0) {
    console.error(`No .txt files found in ${SCENES_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} scene files: ${files.join(", ")}\n`);

  // ---------------------------------------------------------------
  // 2. Upload each file to Supabase Storage
  // ---------------------------------------------------------------
  console.log(`Uploading to storage bucket "${STORAGE_BUCKET}"...\n`);

  for (const file of files) {
    const filePath = path.join(SCENES_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const storagePath = `${GAME_SLUG}/${file}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, content, {
        contentType: "text/plain; charset=utf-8",
        upsert: true,
      });

    if (error) {
      console.error(`  FAIL  ${storagePath}: ${error.message}`);
    } else {
      console.log(`  OK    ${storagePath} (${content.length} bytes)`);
    }
  }

  // ---------------------------------------------------------------
  // 3. Upsert the game record
  // ---------------------------------------------------------------
  console.log("\nUpserting game record...\n");

  const gameRecord = {
    slug: GAME_SLUG,
    title: "The Silk Throne",
    tagline: "A 300,000-word epic of power, betrayal, and empire",
    description:
      "You are the Grand Vizier of the Khazaran Empire — the second most powerful person in a realm inspired by Mughal India, the Ottoman Empire, and the Silk Road. Your predecessor died under mysterious circumstances. The young Emperor is being manipulated by rival factions. And a conspiracy threatens to tear the empire apart. Navigate deadly court politics, forge alliances, uncover the truth, and determine the fate of the Silk Throne.",
    price_inr: 29900,
    price_usd: 499,
    genre: "Historical Fantasy",
    word_count: 300000,
    scene_list: [
      "startup", "scene2", "scene3", "scene4", "scene5",
      "scene6", "scene7", "scene8", "scene9", "scene10",
      "scene11", "scene12", "scene13", "scene14", "scene15",
      "scene16", "scene17", "scene18", "scene19", "scene20",
      "scene21", "scene22", "scene23", "scene24", "scene25",
      "scene26", "scene27", "scene28", "scene29", "scene30",
      "epilogue", "choicescript_stats",
    ],
    free_scene_list: [
      "startup", "scene2", "scene3", "scene4",
      "scene5", "scene6", "scene7", "scene8",
      "choicescript_stats",
    ],
    is_published: true,
  };

  const { data, error } = await supabase
    .from("games")
    .upsert(gameRecord, { onConflict: "slug" })
    .select()
    .single();

  if (error) {
    console.error(`Failed to upsert game record: ${error.message}`);
    process.exit(1);
  }

  console.log(`Game record upserted successfully.`);
  console.log(`  ID:    ${data.id}`);
  console.log(`  Slug:  ${data.slug}`);
  console.log(`  Title: ${data.title}`);
  console.log(`  Price: INR ${data.price_inr / 100} / USD ${data.price_usd / 100}`);
  console.log(`  Scenes:      ${data.scene_list.join(", ")}`);
  console.log(`  Free scenes: ${data.free_scene_list.join(", ")}`);
  console.log(`  Published:   ${data.is_published}`);

  console.log("\n=== Seed complete ===");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

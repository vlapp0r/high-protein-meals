import fs from "fs";
import path from "path";

const postSlug  = process.env.POST_SLUG;
const altText   = process.env.ALT_TEXT || "Recipe photo";
const heroUrl   = process.env.HERO_URL || "";
const ingredUrl = process.env.INGREDIENT_URL || "";
const finishedUrl = process.env.FINISHED_URL || "";

if (!postSlug) {
  console.error("POST_SLUG environment variable is required");
  process.exit(1);
}

// ── Find the markdown file ────────────────────────────────────────────────────
const postsDir = path.join("content", "posts");
const mdFile = path.join(postsDir, `${postSlug}.md`);

if (!fs.existsSync(mdFile)) {
  console.error(`Post file not found: ${mdFile}`);
  console.error("Available posts:");
  fs.readdirSync(postsDir).forEach(f => console.error(" -", f));
  process.exit(1);
}

let content = fs.readFileSync(mdFile, "utf8");

// ── Build image markdown snippets ─────────────────────────────────────────────
const imgBase = `/images/posts/${postSlug}`;

const heroMd = heroUrl
  ? `![${altText}](${imgBase}/hero.jpg)\n\n`
  : "";

const ingredMd = ingredUrl
  ? `\n![Ingredients for ${altText}](${imgBase}/ingredients.jpg)\n`
  : "";

const finishedMd = finishedUrl
  ? `\n![${altText} finished dish](${imgBase}/finished.jpg)\n`
  : "";

// ── Inject hero image: right after the front matter closing --- ───────────────
// Front matter ends at the second ---
if (heroMd) {
  const frontMatterEnd = content.indexOf("---", 4); // skip opening ---
  if (frontMatterEnd !== -1) {
    const insertAt = frontMatterEnd + 3; // after closing ---
    // Only add if not already present
    if (!content.includes(`${imgBase}/hero.jpg`)) {
      content =
        content.slice(0, insertAt) +
        "\n\n" + heroMd.trim() +
        content.slice(insertAt);
      console.log("Hero image injected after front matter");
    } else {
      console.log("Hero image already present — skipping");
    }
  }
}

// ── Inject ingredients image: right before the ## Ingredients heading ─────────
if (ingredMd && !content.includes(`${imgBase}/ingredients.jpg`)) {
  const ingredHeading = content.indexOf("## Ingredients");
  if (ingredHeading !== -1) {
    content =
      content.slice(0, ingredHeading) +
      ingredMd.trim() + "\n\n" +
      content.slice(ingredHeading);
    console.log("Ingredients image injected before ## Ingredients");
  }
}

// ── Inject finished dish image: right before the ## Nutrition heading ─────────
if (finishedMd && !content.includes(`${imgBase}/finished.jpg`)) {
  const nutritionHeading = content.indexOf("## Nutrition");
  if (nutritionHeading !== -1) {
    content =
      content.slice(0, nutritionHeading) +
      finishedMd.trim() + "\n\n" +
      content.slice(nutritionHeading);
    console.log("Finished dish image injected before ## Nutrition");
  } else {
    // Fallback: append before ## Tips
    const tipsHeading = content.indexOf("## Tips");
    if (tipsHeading !== -1) {
      content =
        content.slice(0, tipsHeading) +
        finishedMd.trim() + "\n\n" +
        content.slice(tipsHeading);
      console.log("Finished dish image injected before ## Tips");
    }
  }
}

// ── Write updated file ────────────────────────────────────────────────────────
fs.writeFileSync(mdFile, content, "utf8");
console.log(`Updated: ${mdFile}`);

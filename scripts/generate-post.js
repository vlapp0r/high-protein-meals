import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── 60-topic pool ────────────────────────────────────────────────────────────
// Organised by cluster. Script picks randomly — over time all topics get covered.
const TOPIC_POOL = [
  // ── Ground Beef & Turkey ──────────────────────────────────────────────────
  "hot honey ground beef bowl high protein under 2.50",
  "korean ground beef rice bowl budget meal prep",
  "high protein lasagna soup ground beef budget",
  "french onion meatballs cheap high protein dinner",
  "ground beef stroganoff high protein budget",
  "budget ground turkey meal prep bowls",
  "high protein turkey chili under 3 dollars",
  "egg roll in a bowl ground turkey budget",
  "ground beef and rice skillet one pan dinner",
  "cheap high protein beef and bean tacos",

  // ── Chicken ───────────────────────────────────────────────────────────────
  "budget chicken thigh meal prep high protein",
  "high protein chicken burrito bowl under 3 dollars",
  "rotisserie chicken meal prep 5 ways",
  "sheet pan chicken fajitas high protein budget",
  "slow cooker chicken thighs budget meal prep",
  "high protein chicken banh mi bowl budget",
  "air fryer chicken thighs cheap high protein",
  "one pot chicken and rice high protein budget",
  "chicken mince burgers high protein cheap",
  "crockpot chicken fajita bowls budget high protein",

  // ── Eggs ──────────────────────────────────────────────────────────────────
  "high protein egg fried rice budget meal",
  "cottage cheese scrambled eggs high protein",
  "high protein egg muffins meal prep budget",
  "turkish eggs cilbir high protein budget breakfast",
  "egg and bean breakfast burrito high protein cheap",
  "high protein frittata budget ingredients",
  "cheesy eggs on toast high protein cheap breakfast",
  "high protein shakshuka budget dinner",

  // ── Cottage Cheese ────────────────────────────────────────────────────────
  "cottage cheese bread 2 ingredients high protein",
  "cottage cheese bowl ideas high protein meal prep",
  "cottage cheese pancakes high protein budget breakfast",
  "high protein cottage cheese pasta sauce budget",
  "cottage cheese pizza crust high protein cheap",
  "cottage cheese chocolate mousse high protein dessert budget",

  // ── Beans & Lentils ───────────────────────────────────────────────────────
  "high protein lentil soup budget meal prep",
  "black bean rice bowl high protein vegetarian budget",
  "chickpea curry high protein under 2 dollars",
  "white bean and turkey chili budget high protein",
  "red lentil dahl high protein cheap dinner",
  "high protein bean and cheese quesadillas budget",
  "budget black bean tacos high protein vegetarian",
  "lentil bolognese high protein cheap pasta",

  // ── Canned Fish ───────────────────────────────────────────────────────────
  "high protein tuna rice bowl under 2 dollars",
  "budget sardine rice bowl high protein",
  "tuna pasta high protein cheap dinner",
  "canned salmon patties high protein budget",
  "tuna and white bean salad high protein cheap lunch",

  // ── Greek Yogurt ──────────────────────────────────────────────────────────
  "high protein overnight oats greek yogurt budget",
  "greek yogurt chicken marinade budget meal prep",
  "high protein greek yogurt bowl 5 minutes",
  "greek yogurt protein muffins budget breakfast",

  // ── Pillar and informational ──────────────────────────────────────────────
  "cheapest high protein foods ranked by cost per gram",
  "7 day high protein budget meal plan under 50 dollars",
  "high protein meal prep for the week under 50 dollars",
  "budget meal prep for muscle gain bulking",
  "high protein lunch meal prep 5 days budget",
  "best protein sources under 1 dollar per serving",
  "how to hit 150 grams protein on a budget",
  "high protein snacks under 1 dollar budget",
  "budget grocery list for high protein diet",
  "high protein meals under 500 calories budget",
];

// Pick a random topic
const topic = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];

const SYSTEM_PROMPT = `You are a recipe blogger writing for "Gains on a Dime" — a blog about high-protein meals on a budget.
Your writing is friendly, practical, and direct. You write for home cooks aged 22–40 who want to hit their protein goals without overspending on groceries.
Always write in a warm, conversational tone. Never use excessive filler phrases. Get to the recipe quickly.`;

const USER_PROMPT = `Write a complete Hugo blog post about: ${topic}

The post MUST be formatted as a valid Hugo Markdown file with this exact front matter structure at the top:

---
title: "TITLE HERE"
date: ${new Date().toISOString().split("T")[0]}
description: "SEO meta description here — 140-160 characters, include main keyword naturally"
categories: ["Recipes"]
tags: ["high protein", "budget meals", "meal prep"]
draft: false
---

After the front matter, write the full blog post body in Markdown. Include:

1. A short intro paragraph (2-3 sentences) — hook the reader, state the protein count and cost per serving upfront
2. ## Why This Recipe Works — 2-3 sentences on what makes it great
3. ## Ingredients — a Markdown list with amounts. Keep it under 10 ingredients. Note cost per serving at the end.
4. ## Instructions — numbered steps, clear and simple. 5-8 steps.
5. ## Nutrition (Per Serving) — a simple Markdown table with: Calories, Protein, Carbs, Fat, Cost Per Serving
6. ## Tips — 3-4 bullet points with practical tips
7. ## Related Recipes — 3 bullet points with placeholder internal links in this format: [Recipe Name](https://gainsonadime.com/posts/recipe-slug/)
8. A short closing paragraph (1-2 sentences) encouraging the reader.

Rules:
- Protein per serving must be 25g or higher
- Cost per serving must be under $3.00
- All measurements in US customary (cups, tbsp, oz, lb)
- Keep the whole post between 600-900 words
- Do not use em-dashes. Use commas or rewrite the sentence instead.
- Output ONLY the raw Markdown file content. No explanations, no code fences, no preamble. Start directly with ---`;

async function generatePost() {
  console.log(`Generating post for topic: ${topic}`);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: USER_PROMPT }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const postContent = content.text.trim();

  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);

  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-${slug}.md`;
  const outputPath = path.join("content", "posts", filename);

  fs.mkdirSync(path.join("content", "posts"), { recursive: true });
  fs.writeFileSync(outputPath, postContent, "utf8");

  console.log(`Post written to: ${outputPath}`);
  console.log(`Word count: ~${postContent.split(/\s+/).length} words`);
}

generatePost().catch((err) => {
  console.error("Failed to generate post:", err);
  process.exit(1);
});

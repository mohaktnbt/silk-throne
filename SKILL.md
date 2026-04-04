---
name: game-script-builder
description: >
  Build complete interactive fiction games using the ChoiceScript engine — branching narratives
  with variables, stats, achievements, and multiple endings. Use this skill whenever the user
  wants to create, write, design, or outline a text-based game, interactive story, choose-your-own-adventure,
  branching narrative, visual novel script, ChoiceScript game, or any interactive fiction project.
  Also trigger when the user asks to convert a story into an interactive format, design a decision tree
  for a game, build a game script with choices and consequences, or wants help with ChoiceScript syntax.
  Even if the user says "game" or "story with choices" without mentioning ChoiceScript specifically,
  use this skill — it covers the full pipeline from concept to playable ChoiceScript files.
---

# Game Script Builder

You are an expert interactive fiction author and ChoiceScript developer. Your job is to help the user
go from a game concept — even a vague one — to a complete set of playable ChoiceScript scene files.

## How this skill works

When the user describes a game idea, you walk them through a structured creative process that produces
real, runnable `.txt` scene files in ChoiceScript format. The output is not a design document — it's
the actual game. You write narrative prose, dialogue, branching choices, variable logic, and stat
systems, all in valid ChoiceScript.

Read `references/choicescript-reference.md` for the complete ChoiceScript command reference before
writing any game code. Read `references/game-design-patterns.md` for proven structural patterns
drawn from published Choice of Games titles.

## The creative process

### Step 1: Understand the game concept

Start by getting clear on these fundamentals. If the user has already described their idea in detail,
extract what you can and only ask about what's missing.

**Must-haves before writing:**
- **Genre and setting** (fantasy kingdom, sci-fi colony, modern thriller, historical drama, etc.)
- **Core premise** — the one-sentence hook. What's the central tension? (e.g., "Your father stole his throne. The true heir has returned. Whose side are you on?")
- **Player role** — who is the reader? What's their position in this world?
- **Approximate scope** — short (3-5 scenes, ~10K words), medium (6-10 scenes, ~30K words), or large (10+ scenes, ~60K+ words)

**Nice-to-haves (offer defaults if not specified):**
- Number of major routes/endings
- Key NPCs and their roles
- Whether the game includes romance, combat, mystery, politics, etc.
- Tone: serious, comedic, dark, hopeful, satirical

### Step 2: Design the game architecture

Before writing prose, plan the skeleton. Produce a concise architecture doc covering:

1. **Scene list** — every `.txt` file and its purpose
2. **Variable plan** — all `*create` variables grouped by category:
   - Player identity (name, gender, pronouns, title)
   - Personality axes (opposed pairs, starting at 50)
   - Skills (typically 2-4, integer levels)
   - Relationship meters (per major NPC, 0-100)
   - Plot flags (booleans tracking key events)
   - Ending-critical flags (the variables that determine which ending fires)
3. **Route structure** — the major branching point(s) and how many main paths exist
4. **Ending map** — every distinct ending and the variable conditions that trigger it
5. **Achievement plan** — what each achievement rewards, with point values summing to 1000

Present this as a clear outline and get user sign-off before writing scenes.

### Step 3: Write the game files

Write complete, valid ChoiceScript files. Every file you produce must be syntactically correct
and runnable in the ChoiceScript engine. The files go in a `mygame/scenes/` directory structure.

**Always produce these files:**
- `startup.txt` — title, author, IFID, scene_list, all *create variables, all *achievement definitions, then the opening scene
- `choicescript_stats.txt` — the stat screen with opposed_pair bars, percent bars, and text stats
- Scene files — one `.txt` per scene in the scene_list

**File-writing order:**
1. `startup.txt` (header + variables + achievements + Act 1 opening)
2. `choicescript_stats.txt`
3. Scene files in narrative order

### Step 4: Review and test advice

After writing the files, give the user:
- Instructions for setting up ChoiceScript locally (download from GitHub, place files in `web/mygame/scenes/`)
- How to run Quicktest and Randomtest
- Any known areas where they should expand content

## Writing guidelines

### Prose quality

Write like a published interactive fiction author. The narrative should be:
- **Second person, present tense** ("You step into the throne room. The air is thick with incense.")
- **Vivid and sensory** — ground scenes in concrete details, not abstractions
- **Varied in pacing** — alternate between action, dialogue, introspection, and worldbuilding
- **Show, don't tell** — reveal character through behavior, not exposition

Each page (between `*page_break` or `*choice` commands) should be 2-6 paragraphs.
Don't dump walls of text — break things up with page breaks.

### Choice design

Choices are the heart of the game. Follow these principles:

**The 70/30 rule:** About 70% of choices should be `*fake_choice` (affect personality/stats but don't
branch the plot) and 30% should be real `*choice` with `*goto` (actually change where the story goes).
This keeps the content manageable while giving players a strong sense of agency.

**Every choice should feel meaningful.** Even `*fake_choice` options should visibly change the tone of
what follows — use `*if` to vary the next paragraph based on what was picked.

**3-4 options is the sweet spot.** Two feels binary; five feels overwhelming.

**Options should be distinct in tone/approach, not just wording.** Good: "Attack head-on / Sneak around
back / Try to negotiate / Walk away." Bad: "Say yes / Say okay / Say sure."

**Use `*disable_reuse` for advisor/hub consultations** where the player can talk to multiple NPCs
but shouldn't repeat the same conversation.

### Variable design

**Personality axes (opposed pairs):**
Use `%+` and `%-` (fairmath) for all personality modifications. Typical amounts:
- Minor choice implication: `%+ 5` or `%- 5`
- Major choice that defines character: `%+ 10` or `%- 10`
- Dramatic, pivotal moments: `%+ 15` to `%+ 20`

Start all personality axes at 50. Always modify only the "left" variable — the right side is
implicit (100 minus the left). For example, if the axis is Ruthless ←→ Compassionate, only
`*create ruthless 50` and `*set ruthless %+ 10`. Never create "compassionate" as a separate variable.

**Relationship meters:**
Use 0-100 with fairmath. Starting values convey existing relationship:
- Stranger: 0-10
- Acquaintance: 20-30
- Existing ally/friend: 50-60
- Family/close bond: 60-70

**Skills:**
Integer levels (1-5 or 1-10). Use plain `+1` and `-1`, not fairmath.

**Plot flags:**
Boolean (`true`/`false`). Name them descriptively: `heir_alive`, `alliance_sealed`, `knows_secret`.

### Pronoun system

For each gendered character the player can customize, create the full pronoun set:
`they`, `their`, `them`, `theirs`, `themself`, `theyre`, `are`, `were`, `have`, `plural`
Plus: `title`, `gender`, `person`, `child`

Use a subroutine scene (e.g., `sub.txt`) with `*gosub_scene` to set all pronouns based on gender
selection, so the logic lives in one place.

Always support at minimum: male, female, non-binary. Consider offering: genderfluid, custom
neopronouns, and the option to skip gender entirely.

### Scene structure patterns

**The Hub pattern:** For mid-game free-time activities, create a hub scene that the main storyline
calls via `*gosub_scene`. The hub offers `*disable_reuse` options to talk to NPCs, write letters,
explore locations, etc. Each conversation increments a counter (`spyconv + 1`) so repeat visits
get different dialogue. This adds enormous content depth without multiplying plot branches.

**The Route pattern:** One big branching point (typically end of Act 1) sets a `route` variable
(1, 2, or 3). Subsequent scenes check `route` to load different content. Routes share the same
scene files but use `*if (route = 1)` blocks to diverge.

**The Subroutine pattern:** Put reusable logic in a `sub.txt` file with labeled subroutines:
pronoun setup, trust calculation, ending-condition checks. Call with `*gosub_scene sub [label]`.

### Common mistakes to avoid

- **Forgetting `*goto` or `*finish` at the end of `*choice` options** — this crashes the game
- **Using `*create` outside of `startup.txt`** — only `*temp` works in other files
- **Making variables case-sensitive** — ChoiceScript variables are case-insensitive
- **Putting `*scene_list` anywhere other than the top of `startup.txt`**
- **Dead code after `*goto`** — nothing after a `*goto` line will ever execute
- **Infinite `*gosub` nesting** — keep subroutine chains shallow (2-3 levels max)
- **Forgetting that `*finish` advances to the next scene in scene_list** — use `*goto_scene`
  for non-sequential navigation
- **Not providing an `*ending` in the final scene** — the game won't show "Play Again" properly

## Output format

Save all game files to the user's workspace folder. The directory structure should be:

```
mygame/
  scenes/
    startup.txt
    choicescript_stats.txt
    chapter1.txt
    chapter2.txt
    ...
    sub.txt (subroutines, if needed)
```

After creating the files, present them to the user with a summary of:
- Total word count estimate
- Number of scenes, choices, and endings
- A simple flowchart of the route/ending structure

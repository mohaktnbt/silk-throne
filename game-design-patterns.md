# Game Design Patterns for Interactive Fiction

Proven structural patterns drawn from published Choice of Games titles and ChoiceScript best practices.
Read this before designing a game's architecture to understand what works at scale.

---

## 1. The Three-Act Route Structure

The most common architecture in published CoG titles. The game flows linearly through Act 1,
branches into distinct routes at a critical decision point, then reconverges for endings.

### How it works

**Act 1 (Linear with personality branching)**
- 2-3 scenes establishing setting, introducing NPCs, building stats
- Heavy use of `*fake_choice` to define player personality
- Minor `*choice` branches that rejoin via `*goto`
- Ends with THE decision — the route-setting `*choice`

**Act 2 (Route-divergent)**
- A `route` variable (integer 1, 2, or 3) is set by the Act 1 climax
- Subsequent scenes share the same files but use `*if (route = N)` to load different content
- Each route has its own NPCs, conflicts, and tone
- Routes may share a hub scene for free-time activities

**Act 3 (Ending convergence)**
- A subroutine checks route + accumulated flags to determine which ending fires
- Typically 3-5 main endings per route, for 10-15 total across the game
- `*achieve` triggers just before the ending narration

### Example from Turncoat Chronicle

```
*comment Act 1 climax — the route fork
*choice
  #Stay close to the heir and become their ally.
    *set route 1
    *set turncoat + 1
    *goto act2_opening
  #Get close to the heir in order to destroy them.
    *set route 2
    *goto act2_opening
  #Ignore the heir entirely and create a fake one.
    *set route 3
    *set fake_heir true
    *goto act2_opening
```

### Design tips
- Keep routes to 2-4. More than 4 becomes unmanageable content-wise.
- Routes should feel genuinely different, not just reskinned versions.
- Shared scenes with `*if (route = N)` blocks keep file count manageable.
- The route choice should feel earned by Act 1 personality development.

---

## 2. The Hub Scene Pattern

A free-time management scene where the player chooses how to spend limited time.
Used in nearly every medium-to-large CoG title for mid-game pacing.

### How it works

A hub scene is called via `*gosub_scene` from the main storyline. It presents a menu
of activities — talk to NPCs, train skills, explore locations. Each activity uses
`*disable_reuse` so the player can do it once per visit. A counter tracks how many
activities they've done; after a threshold, they can (or must) leave.

### Template

```
*comment In the main scene:
*gosub_scene hub camp_hub

*comment In hub.txt:
*label camp_hub
*temp activities_done 0

The camp is quiet. You have some time before the next march.

*label hub_menu

*choice
  *disable_reuse #Talk to Sergeant Voss.
    *set activities_done + 1
    *gosub voss_talk
    *goto hub_menu
  *disable_reuse #Visit the healer's tent.
    *set activities_done + 1
    *gosub healer_visit
    *goto hub_menu
  *disable_reuse #Practice swordplay.
    *set activities_done + 1
    *set combat + 1
    *goto hub_menu
  *disable_reuse #Write in your journal.
    *set activities_done + 1
    *set introspection %+ 10
    *goto hub_menu
  *if (activities_done >= 2) #Rest for the night.
    *return
```

### Conversation depth with counters

For NPCs that have multi-visit dialogue, use a conversation counter:
```
*label voss_talk
*if (voss_conv = 0)
  "First time we've talked properly," Voss says.
  *set rel_voss %+ 10
*elseif (voss_conv = 1)
  "Back again?" Voss grins. "Let me tell you about the old campaigns."
  *set rel_voss %+ 5
*else
  Voss shares a quiet moment with you by the fire.
  *set rel_voss %+ 3
*set voss_conv + 1
*return
```

### Design tips
- 4-6 activities per hub visit is the sweet spot.
- At least 2 should be NPC conversations (drives relationship meters).
- At least 1 should be a skill-training option.
- The "leave" option should require minimum 2 activities done.
- Hub visits are excellent pacing tools between intense plot scenes.

---

## 3. The Personality Axis System

The standard approach to tracking player character personality in CoG games.
Uses opposed pairs rather than independent stats.

### How it works

Define 3-5 personality axes as opposed pairs. Each is a single variable (0-100, starting at 50).
The left side is the variable name; the right side is implicit (100 minus left).

### Common axes in published games

| Variable (Left) | Right Side | What it tracks |
|---|---|---|
| ruthless | compassionate | willingness to sacrifice others |
| bold | cautious | risk tolerance |
| honest | deceptive | communication style |
| idealist | pragmatist | approach to moral dilemmas |
| leader | loner | social approach |
| emotional | stoic | expressiveness |

### Modification amounts (fairmath)

| Situation | Amount | Example |
|---|---|---|
| Minor dialogue choice | %+ 5 / %- 5 | Choosing a polite vs. blunt greeting |
| Significant action | %+ 10 / %- 10 | Choosing to spare or execute a prisoner |
| Pivotal, defining moment | %+ 15 / %- 20 | Betraying your closest ally |

### Using personality in gameplay

**Flavor text:** Vary descriptions based on personality.
```
*if (boldness > 65)
  You stride into the room with your head high.
*elseif (boldness < 35)
  You slip into the room, keeping to the walls.
*else
  You enter the room at a measured pace.
```

**Gating choices:** Use `*selectable_if` for personality-locked options.
```
*selectable_if (ruthless > 60) #Threaten the prisoner's family.
```

**Ending determination:** Personality axes should influence which ending the player gets.

### Design tips
- 3-4 axes is ideal. More than 5 becomes hard to track meaningfully.
- Every major choice should move at least one axis.
- The stat screen should display all axes as `opposed_pair` bars.
- Axes should create real gameplay consequences, not just flavor text.

---

## 4. The Relationship Meter System

Track the player's relationship with each major NPC on a 0-100 scale.

### Starting values convey context

| Starting Value | Relationship Context |
|---|---|
| 0-10 | Complete stranger |
| 20-30 | New acquaintance, cautious |
| 40-50 | Working relationship, neutral |
| 50-60 | Pre-existing friendship/alliance |
| 60-70 | Close bond (family, mentor, old friend) |

### Modification amounts (fairmath)

| Action | Amount |
|---|---|
| Agreeing with their viewpoint | %+ 5 |
| Meaningful conversation in hub | %+ 8 to %+ 12 |
| Helping them with a personal problem | %+ 10 to %+ 15 |
| Siding against them in a conflict | %- 10 to %- 15 |
| Outright betrayal | %- 20 to %- 30 |

### Relationship thresholds for gameplay

```
*if (rel_npc > 70)
  *comment NPC is a devoted ally — will sacrifice for you
*elseif (rel_npc > 50)
  *comment NPC is a solid ally — will support you in most situations
*elseif (rel_npc > 30)
  *comment NPC is neutral — will cooperate but not go out of their way
*else
  *comment NPC is hostile — will actively work against you
```

### Romance tracking

Romance is typically a boolean flag (`romance_npc true/false`) plus the relationship meter.
Romance options appear when `rel_npc > threshold AND romance_npc`.

```
*if ((rel_captain > 60) and (romance_captain))
  #Kiss the captain.
    *set rel_captain %+ 15
    *goto kiss_scene
```

### Design tips
- 3-5 relationship-tracked NPCs is manageable. More than 7 dilutes each.
- Each NPC should have at least 3 meaningful interaction points in the game.
- Relationship should affect available choices, NPC dialogue, and endings.
- At least one NPC should be an antagonist whose "relationship" tracks mutual respect.

---

## 5. The Achievement Architecture

ChoiceScript achievements reward exploration and replayability.

### Budget planning

Total points must equal exactly 1000. Distribute across three tiers:

| Tier | Points Each | Count | Total | What they reward |
|---|---|---|---|---|
| Major | 100 | 3-4 | 300-400 | Main endings, major route completion |
| Standard | 50 | 6-8 | 300-400 | Key plot decisions, romance completion |
| Minor | 25 | 8-12 | 200-300 | Easter eggs, specific dialogue choices |

### Visibility strategy

- **Visible achievements:** Main endings, romance completions, route completions. Player can see what they're working toward.
- **Hidden achievements:** Easter eggs, secret choices, obscure paths. Rewards exploration.

### Placement

- Major achievements: Fire in the ending scene, just before `*ending`.
- Standard achievements: Fire at key decision points or route milestones.
- Minor achievements: Fire at specific dialogue choices or hidden interactions.

```
*comment In startup.txt:
*achievement true_heir visible 100 The True Heir
  The throne awaits its rightful ruler.
  You placed the true heir on the throne and ushered in a new era.

*achievement secret_passage hidden 25 Secret Passage
  ???
  You found the hidden passage behind the waterfall.

*comment In the scene where it triggers:
*if (found_waterfall_passage)
  *achieve secret_passage
```

---

## 6. The Pronoun Architecture

Support inclusive gender options without duplicating content.

### The standard approach

Create a full pronoun variable set in `startup.txt` with non-binary defaults.
Use a subroutine to set all pronouns based on gender selection.
Use `${}` interpolation throughout all prose.

### Gender selection scene

```
Before we begin, how do you identify?

*choice
  #Male
    *set gender "male"
  #Female
    *set gender "female"
  #Non-binary
    *set gender "nonbinary"
  #I'd rather not say
    *set gender "nonbinary"

*gosub_scene sub setup_pronouns
```

### Prose usage

Write all narrative using pronoun variables:
```
${they} drew ${their} sword and held it before ${them}.
"This is ${theirs}," ${they} said. "${theyre} not giving it up."
The ${child} stood ${their} ground.

*comment For verb agreement:
${they} ${are} ready.
${they} ${were} prepared.
${they} ${have} arrived.
```

### For multiple gendered characters

Prefix pronoun variables with the character name:
```
*create mc_they "they"
*create mc_them "them"
*create npc_they "they"
*create npc_them "them"
```

---

## 7. The Ending Gate Pattern

A systematic approach to determining which ending fires based on accumulated variables.

### How it works

A subroutine (typically in `sub.txt` or the final scene) evaluates a hierarchy of conditions:
1. Route (which major path did the player choose?)
2. Critical flags (did key events happen?)
3. Relationship thresholds (who is loyal? who is alive?)
4. Personality (what kind of person is the player?)

### Template

```
*label determine_ending
*comment Route 1: Loyalty path
*if (route = 1)
  *if (ally_alive and (rel_ally > 60))
    *if (compassion > 60)
      *achieve golden_ending
      *goto_scene ending golden
    *else
      *achieve pragmatic_ending
      *goto_scene ending pragmatic
  *else
    *achieve tragic_loyalty
    *goto_scene ending tragic_loyalty

*comment Route 2: Ambition path
*if (route = 2)
  *if (betrayals >= 3)
    *achieve tyrant_ending
    *goto_scene ending tyrant
  *elseif (reforms >= 2)
    *achieve reformer_ending
    *goto_scene ending reformer
  *else
    *achieve power_ending
    *goto_scene ending power

*comment Route 3: Deception path
*if (route = 3)
  *if (discovered)
    *achieve exposed_ending
    *goto_scene ending exposed
  *else
    *achieve puppetmaster_ending
    *goto_scene ending puppetmaster

*bug Unreachable — all routes should be covered
```

### Design tips
- Every route should have at least 2 endings (good and bad).
- The "best" ending per route should require multiple things going right.
- One "hidden" ending accessible from any route adds replayability.
- Use `*bug` at the end as a safety net — if reached, your logic has a hole.

---

## 8. Scene File Organization

### Naming conventions

| File | Purpose |
|---|---|
| `startup.txt` | Header, variables, achievements, opening scene |
| `choicescript_stats.txt` | Stat screen |
| `chapter1.txt` through `chapterN.txt` | Main narrative scenes in order |
| `hub.txt` | Hub/management scene (called via `*gosub_scene`) |
| `sub.txt` | Shared subroutines (pronouns, calculations, ending checks) |
| `ending.txt` | All ending narrations |

### Scene size guidelines

| Scene Length | Lines | Word Count | Content |
|---|---|---|---|
| Short | 100-300 | 1-3K | Single encounter or transition |
| Medium | 300-800 | 3-8K | Full chapter with 3-5 choices |
| Long | 800-2000 | 8-20K | Hub scene or branching chapter |

### Scope planning

| Game Size | Scenes | Words | Endings | Dev Time |
|---|---|---|---|---|
| Short | 3-5 | 10-20K | 3-5 | Days |
| Medium | 6-10 | 30-60K | 6-10 | Weeks |
| Large | 10-20 | 60-150K | 10-15 | Months |

---

## 9. The 70/30 Choice Balance

The most important principle for manageable content scope.

### 70% Fake Choices (stat/personality)
These don't branch the plot but shape the player's character and how NPCs react to them.
```
*fake_choice
  #"I fight for honor."
    *set idealism %+ 10
  #"I fight for survival."
    *set pragmatism %+ 10
  #"I fight because I enjoy it."
    *set ruthless %+ 10
```

### 30% Real Choices (plot branching)
These send the player down genuinely different paths using `*goto` or `*goto_scene`.
```
*choice
  #Side with the rebels.
    *set rebel_alliance true
    *goto rebel_path
  #Remain loyal to the crown.
    *set crown_loyalty true
    *goto loyal_path
```

### Making fake choices feel real

The key to the 70/30 rule working is that fake choices must FEEL meaningful:
1. Vary the next paragraph based on what was chosen (use `*if` or `*temp`).
2. Have NPCs reference the player's personality later.
3. Gate later choices behind personality thresholds.
4. Make the stat changes visible in the stat screen.

---

## 10. Pacing and Flow

### Scene rhythm

Alternate between these scene types:
1. **Action** — combat, chases, escapes, urgent decisions
2. **Dialogue** — conversations, negotiations, interrogations
3. **Hub/Exploration** — free time, relationship building, preparation
4. **Revelation** — lore dumps, plot twists, character backstory
5. **Choice climax** — the big decision that defines this chapter

### Page break frequency

- Every 2-4 paragraphs during normal narrative
- Before and after major choices
- After intense action sequences (let the reader breathe)
- Never more than 6 paragraphs without a break

### Word count per page (between breaks/choices)

- Target: 150-300 words per page
- Max: 500 words (longer feels like a wall of text)
- After a big choice: shorter pages (100-150 words) to show consequences quickly

---

## 11. Published Game Catalog — Genre and Scope Reference

Based on the Choice of Games catalog (80+ titles), here are the most common
game categories and what players expect from each:

### Fantasy (most popular)
Examples: Choice of the Dragon, The Hero of Kendrickstone, Creatures Such as We
- Medieval or high fantasy settings, magic systems, quests
- Player roles: knight, mage, ruler, dragon, chosen one
- Expected features: combat, magic system, throne politics, romance

### Sci-Fi
Examples: Choice of Robots, The Martian Job, Metahuman Inc.
- Space opera, cyberpunk, AI ethics, first contact
- Player roles: scientist, pilot, corporate exec, AI
- Expected features: tech trees, faction politics, moral dilemmas

### Historical/Period
Examples: Affairs of the Court, Choice of Alexandria, Pax Historia
- Set in specific historical periods with fantastical elements
- Player roles: noble, spy, explorer, diplomat
- Expected features: political intrigue, historical accuracy, social climbing

### Modern/Contemporary
Examples: Slammed!, Hollywood Visionary, The ORPHEUS Ruse
- Present-day or near-future realistic settings
- Player roles: athlete, filmmaker, spy, detective
- Expected features: career progression, social dynamics, mystery

### Horror/Supernatural
Examples: Zombie Exodus, The Shadow Horror, Blood Money
- Survival horror, gothic, supernatural investigation
- Player roles: survivor, investigator, supernatural being
- Expected features: tension, resource management, trust/paranoia

### Common across all genres
- 3-5 romance options (diverse genders)
- 10-15 achievements
- 3+ distinct endings
- 50,000-150,000 words for full-length titles
- Personality system with 3-5 axes
- At least 4 major NPCs with relationship tracking

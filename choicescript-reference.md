# ChoiceScript Command Reference

Complete syntax reference for every ChoiceScript command. Use this when writing game files
to ensure all code is valid and will pass Quicktest/Randomtest.

---

## File Structure

A ChoiceScript game lives in `web/mygame/scenes/`. Every file is plain `.txt`.

**Required files:**
- `startup.txt` — must contain `*title`, `*author`, `*scene_list`, all `*create` declarations, `*achievement` definitions, and the opening scene content
- `choicescript_stats.txt` — the stat screen shown when player clicks "Show Stats"

**Optional files:**
- Additional scene files (one per entry in `*scene_list`)
- `choicescript_upgrade.txt` — for version migration logic

**Critical rule:** `*create` can ONLY appear in `startup.txt`. All other files use `*temp` for local variables.

---

## Header Commands (startup.txt only)

### *title
Sets the game title. Appears in browser tab and title screen.
```
*title The Dragon's Heir
```

### *author
Sets the author name. Appears on the title screen.
```
*author Jane Smith
```

### *ifid
A unique identifier (UUID format) for save-game support. Without this, refreshing the browser erases progress.
```
*ifid 12345678-1234-1234-1234-123456789abc
```
Generate with any UUID tool. Format: 8-4-4-4-12 hex characters.

### *scene_list
Declares every scene file in play order. Must appear near the top of `startup.txt`.
`*finish` advances to the next scene in this list.
```
*scene_list
  startup
  chapter1
  chapter2
  chapter3
  ending
```
Note: Do NOT include `.txt` extension. Do NOT include `choicescript_stats`.

---

## Variable Commands

### *create
Declares a global variable. ONLY valid in `startup.txt`, before any narrative content.
```
*create player_name "Unknown"
*create strength 50
*create has_sword false
*create gold 100
```
Types: string (quoted), numeric (integer or decimal), boolean (`true`/`false`).

### *temp
Declares a scene-local variable. Valid in any file. Destroyed when leaving the scene.
```
*temp local_counter 0
*temp npc_mood "neutral"
```

### *set
Modifies an existing variable.
```
*set strength 75
*set strength + 10
*set strength - 5
*set strength * 2
*set strength / 2
*set strength % 3
*set player_name "Kai"
*set has_sword true
*set player_name & " the Bold"
```

**String concatenation:** Use `&` to join strings.
```
*set full_title name & " of " & kingdom
```

**Fairmath operators** (for percentage stats 0-100):
```
*set compassion %+ 10
*set compassion %- 15
```
`%+` increases toward 100 with diminishing returns. `%-` decreases toward 0 with diminishing returns.
Formula: `%+ x` → `stat + (100 - stat) * x / 100`. `%- x` → `stat - stat * x / 100`.

Use fairmath for personality axes and relationship meters. Use plain arithmetic for skills, gold, counters.

---

## Flow Control

### *choice
Presents options to the player. Each option is prefixed with `#`. Code under each option must end with `*goto`, `*goto_scene`, `*finish`, or `*ending`.
```
*choice
  #Attack the dragon.
    You charge forward with your sword raised.
    *set courage %+ 10
    *goto battle
  #Try to negotiate.
    You hold up your hands in a gesture of peace.
    *set diplomacy %+ 10
    *goto negotiate
  #Run away.
    You turn and sprint for the exit.
    *set courage %- 15
    *goto escape
```

**Nested choices** (choices within choices):
```
*choice
  #Go north.
    The path splits again.
    *choice
      #Take the left fork.
        *goto left_path
      #Take the right fork.
        *goto right_path
  #Go south.
    *goto south
```

### *fake_choice
Like `*choice` but doesn't branch — execution continues after the block. Use for personality/stat choices that don't change the plot.
```
*fake_choice
  #"I'll protect everyone, no matter the cost."
    *set compassion %+ 10
  #"Sacrifices must be made for the greater good."
    *set ruthless %+ 10
  #"Let's not think about that right now."
    *set evasive %+ 5

The group nods and moves on.
```
No `*goto` or `*finish` needed — text after the block applies to all paths.

### *label
Marks a point in the scene that `*goto` can jump to.
```
*label battle
You face the dragon in combat.
```

### *goto
Jumps to a `*label` within the same scene file.
```
*goto battle
```

### *goto_scene
Jumps to a different scene file (optionally to a specific label in that file).
```
*goto_scene chapter2
*goto_scene chapter2 arrival
```

### *gosub
Jumps to a label in the current scene. When that subroutine hits `*return`, execution resumes after the `*gosub`.
```
*gosub calculate_trust
The advisor's trust in you is now ${trust}.
```

### *gosub_scene
Like `*gosub` but jumps to a label in a different scene file. `*return` brings you back.
```
*gosub_scene sub setup_pronouns
*gosub_scene hub free_time
```
This is the primary mechanism for reusable logic and hub scenes.

### *return
Ends a subroutine and returns to the calling `*gosub` or `*gosub_scene`.
```
*label calculate_trust
*set trust + loyalty
*set trust - suspicion
*return
```

### *finish
Advances to the next scene in `*scene_list`. If there is no next scene, the game crashes.
```
*finish
```
Can include optional text displayed on the "Next Chapter" button:
```
*finish Chapter 2: The Storm
```

### *ending
Ends the game. Displays stats summary and "Play Again" / "Email Me" options.
```
*ending
```
Every game path must eventually reach `*ending`. Without it, the game hangs.

### *page_break
Pauses the narrative. Player clicks "Next" to continue within the same scene.
```
You arrive at the castle gates.

*page_break

The guards eye you suspiciously.
```

### *line_break
Inserts a single line break (not a paragraph break).
```
First line.
*line_break
Second line (no gap between them).
```

---

## Conditionals

### *if / *elseif / *else
Standard conditional branching. Indentation under each block is mandatory.
```
*if (strength > 70)
  You force the door open with brute strength.
*elseif (has_lockpick)
  You pick the lock with practiced ease.
*else
  The door won't budge. You'll have to find another way.
```

**Operators:** `=`, `!=`, `<`, `>`, `<=`, `>=`
**Boolean operators:** `and`, `or`, `not`
**String comparison:** Case-insensitive. `*if (name = "kai")` matches "Kai", "KAI", etc.

**Combining conditions:**
```
*if ((strength > 50) and (has_sword))
  You strike with devastating force.
*if ((gold >= 100) or (reputation > 80))
  The merchant gives you a discount.
*if (not(has_sword))
  You have no weapon.
```

**Important:** Parentheses around conditions are required for `*if` but optional for `*selectable_if`.

### *selectable_if
Makes a choice option grayed out (visible but unselectable) if the condition is false.
```
*choice
  *selectable_if (strength > 60) #Break down the door. [Requires Strength > 60]
    *goto break_door
  *selectable_if (has_lockpick) #Pick the lock. [Requires lockpick]
    *goto pick_lock
  #Look for another way in.
    *goto search
```

### *if (inside choices)
Conditionally show or hide entire choice options.
```
*choice
  *if (has_sword)
    #Draw your sword.
      *goto fight
  *if (magic > 30)
    #Cast a spell.
      *goto cast
  #Do nothing.
    *goto wait
```

---

## Reuse Control

### *hide_reuse
Hides a choice option after it's been selected (it disappears from the list).
```
*choice
  *hide_reuse #Read the letter from your mother.
    The letter speaks of home...
    *goto hub
  *hide_reuse #Examine the map.
    The map shows three possible routes...
    *goto hub
  #Leave the tent.
    *goto depart
```

### *disable_reuse
Grays out a choice option after selection (visible but unselectable). Better UX than *hide_reuse because the player sees what they've already done.
```
*choice
  *disable_reuse #Talk to the captain.
    *gosub captain_conversation
    *goto hub
  *disable_reuse #Talk to the cook.
    *gosub cook_conversation
    *goto hub
  #Head out.
    *goto depart
```

---

## Text & Display

### *comment
A comment line ignored by the engine. For author notes.
```
*comment TODO: Add more description here
*comment This branch handles the betrayal route
```

### *input_text
Prompts the player to type free text. Stored in the named variable.
```
What is your name?
*input_text player_name
Welcome, ${player_name}.
```

### *image
Displays an image. Path is relative to `web/mygame/`.
```
*image castle.png
*image scenes/map.jpg
```

### Variable interpolation
Use `${variable_name}` to insert variable values into text.
```
"Greetings, ${player_name}," says the guard. "Your strength is ${strength}."
```

Works with expressions:
```
You have ${gold * 2} copper pieces (that's ${gold} gold).
```

### Multireplace @{}
Display different text based on a variable's value.
```
@{gender He|She|They} stepped forward.
```
For numeric variables, options are 0-indexed:
```
@{route You chose loyalty.|You chose ambition.|You chose deception.}
```
Can be used inline within paragraphs.

### *print
Outputs a variable value inline (rarely needed — `${}` interpolation is preferred).
```
*print player_name
```

---

## Stat Screen (choicescript_stats.txt)

The stat screen file uses `*stat_chart` to display player stats.

### *stat_chart
Container for stat display elements.
```
*stat_chart
  text name Name
  percent strength Strength
  opposed_pair compassion
    Compassionate
    Ruthless
```

### Display types inside *stat_chart:

**text** — Shows a label and string value.
```
  text player_name Name
  text title Title
```

**percent** — Shows a label and progress bar (0-100).
```
  percent strength Strength
  percent gold Gold
```

**opposed_pair** — Shows a bar between two opposing traits. Only reference the first variable (the "left" trait). The second is implicit (100 minus the first).
```
  opposed_pair compassion
    Compassionate
    Ruthless
  opposed_pair boldness
    Bold
    Cautious
```

### Conditional stat display
Use `*if` to show/hide stats based on conditions.
```
*stat_chart
  text name Name
  percent strength Strength
  *if (knows_magic)
    percent magic Magic Power
```

---

## Achievements

### *achievement
Defines an achievement in `startup.txt`. Parameters: short_name, visibility, points, title, pre_description, post_description.
```
*achievement dragon_slayer visible 50 Dragon Slayer
  You haven't slain any dragons yet.
  You slew the ancient dragon Vorthax!
```

**Visibility options:** `visible` (shown immediately) or `hidden` (revealed only when earned).

**Points:** Must sum to exactly 1000 across all achievements. Max 100 achievements.

### *achieve
Grants an achievement during gameplay.
```
*achieve dragon_slayer
```
Can only fire once per playthrough — subsequent calls are ignored.

### *check_achievements
Forces an achievement check (rarely needed — achievements display automatically).
```
*check_achievements
```

---

## Save System

### *save_checkpoint
Creates a save point the player can return to.
```
*save_checkpoint
```

### *restore_checkpoint
Offers the player a chance to reload from the last checkpoint.
```
*restore_checkpoint
```

---

## Advanced

### *redirect_scene
Replaces the current scene in the `*scene_list` order. When `*finish` is called, it goes to the scene AFTER the redirect target.
```
*redirect_scene alternate_chapter2
```

### *bug
Deliberately crashes the game with an error message. Use for unreachable code paths during testing.
```
*bug This code should never be reached
```

### *rand
Generates a random number.
```
*rand dice 1 6
```
Sets `dice` to a random integer between 1 and 6 (inclusive).

### choice_randomtest
A built-in boolean variable that is `true` when the game is running under Randomtest. Use to skip `*input_text` during automated testing.
```
*if (choice_randomtest)
  *set player_name "TestPlayer"
*else
  *input_text player_name
```

### Implicit control flow
A scene without any `*choice`, `*finish`, `*goto_scene`, or `*ending` at the bottom will crash. Every code path must explicitly terminate.

---

## Indentation Rules

ChoiceScript uses indentation (spaces) to define code blocks. Consistency is critical.

- Options under `*choice` / `*fake_choice` are marked with `#` and indented one level
- Code under an option is indented one more level
- Code under `*if` / `*elseif` / `*else` is indented one level
- Subroutine content after `*label` is at the same indent level as the label

**Use spaces, not tabs.** Typically 2 or 4 spaces per level. Be consistent within a file.

---

## Testing

### Quicktest
Tests every reachable branch of the game. Catches:
- Missing labels
- Variables used before creation
- Dead-end paths (no `*finish`, `*goto`, or `*ending`)
- Syntax errors

Run: `node quicktest.js`

### Randomtest
Plays through the game thousands of times with random choices. Catches:
- Statistical imbalances
- Rare crash paths
- Variable overflow/underflow

Run: `node randomtest.js` (prompts for iteration count and seed)

Reports: Hit counts per line, achievement frequency, ending distribution.

---

## Common Patterns

### Gender/Pronoun Setup
```
*comment In startup.txt:
*create gender "unknown"
*create they "they"
*create them "them"
*create their "their"
*create theirs "theirs"
*create themself "themself"
*create theyre "they're"
*create are "are"
*create were "were"
*create have "have"
*create plural true
*create title "Mx."
*create person "person"
*create child "child"

*comment In a subroutine:
*label setup_pronouns
*if (gender = "male")
  *set they "he"
  *set them "him"
  *set their "his"
  *set theirs "his"
  *set themself "himself"
  *set theyre "he's"
  *set are "is"
  *set were "was"
  *set have "has"
  *set plural false
  *set title "Mr."
  *set person "man"
  *set child "boy"
*elseif (gender = "female")
  *set they "she"
  *set them "her"
  *set their "her"
  *set theirs "hers"
  *set themself "herself"
  *set theyre "she's"
  *set are "is"
  *set were "was"
  *set have "has"
  *set plural false
  *set title "Ms."
  *set person "woman"
  *set child "girl"
*else
  *comment Non-binary defaults already set by *create
*return

*comment Usage in prose:
${they} walked into the room and removed ${their} coat.
"Is that ${theirs}?" you ask.
${theyre} not sure.
```

### Hub Scene Pattern
```
*label hub
*temp visits 0

What would you like to do?

*choice
  *disable_reuse #Talk to Captain Reva.
    *set visits + 1
    *gosub reva_talk
    *goto hub
  *disable_reuse #Visit the training grounds.
    *set visits + 1
    *gosub training
    *goto hub
  *disable_reuse #Check the armory.
    *set visits + 1
    *gosub armory
    *goto hub
  *if (visits >= 2) #You've done enough for now.
    *return
```

### Ending Gate Pattern
```
*label check_ending
*if ((route = 1) and (heir_alive))
  *if (trust > 70)
    *achieve best_ending
    *goto_scene ending_triumph
  *else
    *achieve neutral_ending
    *goto_scene ending_bittersweet
*elseif (route = 2)
  *if (betrayals > 2)
    *achieve dark_ending
    *goto_scene ending_tyrant
  *else
    *achieve ambitious_ending
    *goto_scene ending_power
*else
  *achieve tragic_ending
  *goto_scene ending_downfall
```

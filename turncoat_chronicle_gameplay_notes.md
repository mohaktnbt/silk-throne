# Turncoat Chronicle — Comprehensive Gameplay Notes
## For Replication / Alternate Version Development

---

## 1. Game Overview

- **Title:** Turncoat Chronicle
- **Author:** Hazel Gold
- **Platform:** ChoiceScript engine (Choice of Games / Hosted Games)
- **Genre:** Interactive fiction / text-based RPG
- **Length:** 180,000+ words
- **Tagline:** "Your father stole his throne, intending to leave it to you. When the long-lost heir resurfaces, will you defend the king—or betray him to his enemies?"
- **Distribution:** Web (free trial), Steam, iOS App Store, Google Play, Amazon
- **Support:** support@hostedgames.org

---

## 2. Technical Architecture (ChoiceScript Engine)

### 2.1 Core Engine
- **Engine:** ChoiceScript — open-source interactive fiction framework by Choice of Games LLC
- **Runtime:** Pure JavaScript, runs in-browser (no plugins)
- **Rendering:** Text-only, no graphics/sprites/images. All visuals are CSS-styled HTML text
- **URL Pattern:** `https://www.choiceofgames.com/user-contributed/[game-name]/`
- **Service Worker:** Registers a ServiceWorker for offline caching (`serviceworker.js`)
- **Analytics:** Google Analytics (UA-11851531-1) with display features

### 2.2 DOM Page Stacking Model
- **Critical behavior:** ChoiceScript does NOT remove old pages when navigating forward
- **Implementation:** Each "Next" click appends a new page `<div>` to the DOM while keeping all previous pages intact
- **Visual effect:** New pages stack on top; only the newest is intended to be visible
- **Scroll behavior:** After clicking Next, the browser scroll position may remain on an old page — requires `window.scrollTo(0, 0)` to see the newest content
- **DOM growth:** The DOM grows continuously as players advance. After 10 pages, there are 10+ page divs and 10+ "Next" buttons in the DOM simultaneously
- **Implication for replication:** Any clone must handle this stacking model OR implement proper page replacement

### 2.3 Page Loading
- ChoiceScript calls `startLoading()` when processing a choice
- New page content is injected into the DOM dynamically
- No full page reload occurs during gameplay — it's a single-page application

---

## 3. UI Layout & Components

### 3.1 Page Structure (Top to Bottom)
1. **Game Title** — "Turncoat Chronicle" (large serif font)
2. **Author Attribution** — "by Hazel Gold"
3. **Navigation Links** — About | More Games | Blog | Subscribe (horizontal, hyperlinked)
4. **Action Buttons** — Show Stats | Achievements | Menu (bordered buttons, inline)
5. **Narrative Text** — Main story content (serif font, multiple paragraphs)
6. **Choice Box** OR **Next Button** — Interaction zone
7. **Store Links** — Steam | App Store | Google Play | Amazon (branded image buttons)
8. **Footer** — "Love it? Hate it? Write us at support@hostedgames.org"

### 3.2 Visual Styling
- **Background:** Light cream/beige (#f5f0eb approximate)
- **Text:** Dark serif font, comfortable line spacing
- **Choice box:** Bordered container with radio buttons, each option in its own bordered row
- **Selected choice:** Row gets highlighted background (light gray)
- **Next button:** Full-width, dark gray/charcoal background, white text, large font
- **Personality bars:** Dual-colored horizontal bars (salmon/coral red vs. blue/purple)
- **Relationship bars:** Single-color green bar with percentage label
- **Left border:** Subtle red/coral accent line on the left edge of the viewport

### 3.3 Keyboard Shortcuts
| Key | Action |
|---|---|
| X | Scroll Down |
| Space | Scroll Up |
| Shift + Space | Next Option |
| J | Previous Option |
| K | Next (Press and Hold) |
| Enter | Select/Confirm Next |
| 1-9 | Jump to Option by number |
| Q | Show Stats |
| W | Menu |
| ? | Show Shortcuts |

---

## 4. Page Types

### 4.1 Passage Page (Narrative Only)
- Contains narrative text paragraphs
- Single "Next" button at the bottom
- No choices to make
- Used for exposition, scene-setting, worldbuilding
- Example: Chapel scene describing the religion of Madara

### 4.2 Choice Page (Radio Buttons + Next)
- Contains narrative text followed by a bordered choice box
- Radio buttons (one per option, mutually exclusive)
- First option is pre-selected by default
- Player must click "Next" to confirm their selection
- Choice count varies: 2, 3, or 4 options observed
- Options can be short (single phrase) or long (full sentences)

### 4.3 Text Input Page
- Contains a prompt ("Choose your own name:")
- Single text input field (HTML `<input type="text" name="text">`)
- "Next" button to submit
- Triggered when a choice option leads to free-text entry (e.g., "Another name" option)
- Always followed by a confirmation page

### 4.4 Confirmation Page
- Follows text input pages
- Displays the entered text and asks for confirmation
- Example: "Your name is Kael, is that correct?"
- Two options: "Yes" / "No, I want to change it"
- "No" loops back to the text input page

---

## 5. Character Creation System

### 5.1 Creation Flow (Sequential)
The character creation is integrated into the narrative (no separate character creation screen). Each step is a story page:

1. **Narrative Perspective** (3 options)
   - How you view the history that brought you here
   - Sets initial narrative tone

2. **Name Selection** (4 options)
   - Nolix / Farah / Eldis / Another name
   - "Another name" → text input page → confirmation page
   - Surname is auto-assigned: "Suthis" (revealed later in narrative)

3. **Gender/Title Selection** (4 options)
   - Prince [Name], eldest son to the king (male)
   - Princess [Name], eldest and only daughter to the king (female)
   - Princep [Name], neither male nor female (non-binary)
   - My form of address changes from day to day (genderfluid)
   - Uses custom royal titles: "Princep" for non-binary
   - Gender choice affects pronouns and form of address throughout the game

4. **Skill Specialization — Shrine Offering** (3 options)
   - Atarah, the graceful doe (Social skill boost)
   - Alum, the high-flying eagle (Mental skill boost)
   - Double offering to Ariel (Physical skill boost)
   - Choice is narratively framed as a religious offering

5. **Backstory — City of Origin** (3 options)
   - Jerrah — Koth's second-largest city
   - Sturia — biggest trading port on the eastern Telerine Sea
   - Arness — capital of Tigonne (foreign country)

6. **Backstory — Activity During Absence** (2+ options, varies by city choice)
   - For Jerrah: "Fostering with Uncle Pradun" / "Military training at Fort Jerrah"
   - Determines backstory skills and relationships

### 5.2 Design Pattern: Integrated Character Creation
- No separate "character creation screen" — choices are woven into the opening narrative
- Each choice feels like a story decision, not a stat allocation
- Worldbuilding is delivered alongside character definition
- Stats are affected implicitly (no "you gain +1 to X" messages shown)

---

## 6. Stats System

### 6.1 Stats Page Access
- Accessed via "Show Stats" button or keyboard shortcut Q
- Opens as a new ChoiceScript page (stacked on top)
- Has its own navigation: "Return to the Game" / sub-pages
- Contains interactive links: "Explain the stats page" / "View the lore page" / "View the character list"

### 6.2 Character Summary
- Header: "You are Prince Kael, soon to be King of Koth."
- Dynamically reflects name, title, and gender choices

### 6.3 Personality Axes (4 Dual-Axis Bars)
Each axis has two opposing traits that sum to 100%:

| Left Trait | Right Trait | Starting Value |
|---|---|---|
| Ruthless | Compassionate | 50% / 50% |
| Manipulative | Straightforward | 50% / 50% |
| Noble | Grasping | 50% / 50% |
| Compromising | Autocratic | 50% / 50% |

- **Visual:** Horizontal bar split in two colors (salmon-red left, blue-purple right)
- **Mechanic:** Choosing actions that are ruthless increases Ruthless% and decreases Compassionate% proportionally
- **No neutral:** The axes always sum to 100% — you can't be both ruthless and compassionate equally forever; choices push you one way

### 6.4 Skills (3 Skills with Named Patron Disciples)
Each skill is named after a religious disciple and has a numeric level plus a text description:

| Skill | Patron | Animal Form | Domain | Starting Level | Description |
|---|---|---|---|---|---|
| Physical | Ariel | Golden winged lion | Soldiers, combat | Level 1 | Trained in archery, fencing, and basic tactics |
| Social | Atarah | Graceful doe | Diplomacy, speech | Level 1 | Reasonably courteous and well-spoken |
| Mental | Alum | High-flying eagle | Knowledge, perception | Level 1 | Literate in logical fundamentals, history, and literary masterpieces |

- **Format:** "[Patron]'s Favor ([Level]): [description]"
- **Leveling:** Skills increase through narrative choices (shrine offerings, training backstory, etc.)
- **Descriptions evolve:** Higher levels likely have different descriptive text

### 6.5 Relationships (Trust Meters)
- **Royal Consort Trust:** 60% (starting value)
- **Visual:** Single-color horizontal bar (green) with percentage label
- More relationships likely appear as characters are introduced
- Trust can presumably increase or decrease based on choices

### 6.6 Stats Sub-Pages
The stats screen offers navigation to additional reference pages:
- **"Explain the stats page"** — In-game guide to the stats system
- **"View the lore page"** — Worldbuilding encyclopedia/glossary
- **"View the character list"** — NPC reference guide
- These are ChoiceScript `*choice` options within the stats screen (`*stat_chart`)

---

## 7. Worldbuilding Elements (Observed in Gameplay)

### 7.1 Geography
- **Koth** — The kingdom; the player's homeland
- **Kantul** — Capital city of Koth; location of the royal palace
- **Madara** — The broader continent/region
- **Jerrah** — Koth's second-largest city; has Fort Jerrah (military)
- **Sturia** — Major trading port on the eastern Telerine Sea
- **Arness** — Capital of Tigonne (a foreign nation)
- **Telerine Sea** — Eastern sea, important for trade

### 7.2 Religion System
- **Dominant religion** across all of Madara
- **Three Great Disciples** (deity figures), each with temples in every major city:
  - **Ariel** — Golden winged lion; patron of soldiers; Koth's primary deity; appears on flag/coat of arms
  - **Atarah** — Graceful doe; protector of the silver-tongued; associated with diplomats, merchants, artists, thieves
  - **Alum** — High-flying eagle; symbol of the all-seeing eye; associated with knowledge/intellect
- **Offerings:** Incense and steel tokens (Ariel), flowers and perfume (Atarah)
- **Clergy:** "Mother" title for chapel clergy (Mother Cyrala)

### 7.3 Characters Introduced
- **King Orust** — Player's father; stole the throne; military man; follower of Ariel
- **Royal Consort Harim** — Player's step-parent/co-parent ("noni" — gender-neutral parent term)
- **Belinon** — Player's younger brother (age 19, "technically still a child by Kothic standards"); away from palace; writes long illegible letters
- **Mother Cyrala** — Palace chaplain; known the player since childhood; informal and warm
- **Uncle Pradun** — Teacher and philanthropist in Jerrah (if Jerrah backstory chosen)

### 7.4 Society & Culture
- **Coming of age:** Age 19 is "technically still a child by Kothic standards"
- **Royal court:** Palace steward, captain of royal guard, housekeeper as senior staff
- **Personal staff system:** Prince needs to recruit personal secretary, servants
- **Staff gossip network:** Personal staff provides intelligence/information
- **Patronage system:** Merchants/craftsmen offer goods to royalty at discount seeking endorsement
- **Gender terminology:** "Princep" for non-binary royals; "noni" for gender-neutral parent

---

## 8. Narrative Design Patterns

### 8.1 Exposition Through Choice
- World details are delivered in the text surrounding choices
- Example: The shrine choice teaches the player about the three disciples while also being a stat selection
- Players absorb lore passively while making decisions

### 8.2 Character Creation as Story
- No character creation menu — all choices are narrative
- The player doesn't know they're setting stats; they're making story choices
- Backstory choices (city, activity) both build character AND set up future plot threads

### 8.3 Variable Text Insertion
- Player name is dynamically inserted into narrative and choices
- Gender pronouns and titles change based on selection
- Example: "Prince Kael" / "Princess Kael" / "Princep Kael"
- Familial terms adapt: "son" / "daughter" / gender-neutral alternatives
- "Noni" used as a gender-neutral parent term regardless of player gender

### 8.4 Paragraph Flow
- Long narrative passages between choices (3-6 paragraphs typical)
- Dialogue is woven into narration using quotation marks
- Second-person narration throughout ("you exit the chapel...")
- Occasional passage pages (Next only) for extended exposition

### 8.5 Choice Design
- Choices range from 2-4 options
- First option is always pre-selected
- Options vary in length from short phrases to full sentences
- Some choices have clear stat implications; others are more narrative
- No explicit "this will affect X" indicators — effects are hidden

---

## 9. ChoiceScript Technical Reference (for Replication)

### 9.1 Core ChoiceScript Commands (Inferred)
Based on observed gameplay behavior:

- `*choice` — Presents radio button options
- `*input_text` — Presents text input field
- `*page_break` — Passage page (text + Next button)
- `*set` — Sets variable values (stats)
- `*if` / `*elseif` / `*else` — Conditional branching
- `*goto` / `*goto_scene` — Navigation between labels/scenes
- `*stat_chart` — Renders the stats page with bars
- `*opposed_pair` — Creates dual-axis personality bars (e.g., Ruthless vs. Compassionate)
- `*percent` — Single progress bar (e.g., trust meters)
- `*finish` — Advances to next chapter/scene

### 9.2 Variable Types (Inferred)
- **String:** name, surname, title, pronouns
- **Integer/Percent:** personality axes (0-100), skill levels, trust percentages
- **Boolean:** gender flags, backstory flags

### 9.3 Stats Screen Structure
```
*stat_chart
  text name
  opposed_pair Ruthless
    Compassionate
  opposed_pair Manipulative
    Straightforward
  opposed_pair Noble
    Grasping
  opposed_pair Compromising
    Autocratic
  text ariel_desc (skill description with level)
  text atarah_desc
  text alum_desc
  percent consort_trust Royal Consort Trust
```

### 9.4 Scene Flow Structure
```
startup.txt → (intro, perspective choice)
  → name selection → custom name input (conditional)
  → name confirmation (if custom)
  → gender selection
  → chapel scene (passage)
  → shrine offering (skill choice)
  → staff exposition (passage)
  → correspondence scene
  → city origin choice
  → activity choice (conditional on city)
  → [continues...]
```

---

## 10. Monetization & Platform Features

### 10.1 Free Trial Model
- Web version offers a free trial (first several chapters)
- Full game requires purchase on Steam, App Store, Google Play, or Amazon
- Store links are displayed below every page (persistent marketing)

### 10.2 Platform Buttons
- **Steam** — PC/Mac purchase
- **App Store** — iOS purchase
- **Google Play** — Android purchase
- **Amazon** — Kindle/Fire purchase

### 10.3 Achievements System
- "Achievements" button in the header nav
- Likely tracks specific story outcomes, endings, or hidden conditions
- Standard ChoiceScript achievement system

### 10.4 Menu System
- "Menu" button in header nav
- Likely contains: Save/Load, Restart, Settings, About
- ChoiceScript standard menu

---

## 11. Replication Roadmap

### Phase 1: Core Engine
1. Text rendering system with CSS styling
2. Page navigation (choice → next page) — use proper page replacement, NOT stacking
3. Radio button choice UI with bordered container
4. Text input for custom entries
5. Confirmation flow for user-entered text
6. Passage pages (text + Next)

### Phase 2: Stats & Variables
1. Variable system (string, integer, boolean)
2. Dual-axis personality bars (opposed pairs summing to 100%)
3. Skill levels with descriptive text that changes per level
4. Relationship trust meters (single bars, percentage)
5. Stats screen overlay with sub-navigation
6. Hidden stat changes from choices

### Phase 3: Narrative System
1. Scene/chapter management
2. Dynamic text insertion (name, pronouns, titles)
3. Conditional branching (`*if` / `*goto`)
4. Choice-dependent scene variations
5. Second-person narration framework

### Phase 4: Content Features
1. Character creation integrated into narrative
2. Lore page / character list in stats screen
3. Achievement tracking
4. Save/load game state
5. Keyboard shortcuts

### Phase 5: Polish & Distribution
1. Free trial boundary (paywall after N chapters)
2. Multi-platform deployment
3. Offline support (service worker)
4. Analytics integration

---

## 12. Key Differences from Pax Historia

| Feature | Pax Historia | Turncoat Chronicle |
|---|---|---|
| Genre | Strategy/Simulation | Interactive Fiction/RPG |
| Input | Complex UI (map, tokens, sliders) | Text choices only |
| AI | 12 AI subsystems | None (static branching) |
| Graphics | Map, icons, visual UI | Text only, minimal CSS |
| Complexity | Real-time simulation | Pre-authored branching narrative |
| Replayability | Emergent gameplay | Multiple story paths |
| Engine | Custom web app | ChoiceScript framework |
| Monetization | Token economy, in-app | One-time purchase, free trial |

---

---

## 13. Speed-Play Session Findings (Chapters 1–2)

### 13.1 New Choice Types Discovered

**Paired Personality Choices (Two-Part Character Definition)**
The game uses back-to-back choices that define personality from two angles:
- **Admiration choice:** "There's always been one thing you've admired about your father..."
  - His subtlety in winning over others to his cause (Manipulative axis)
  - How he always put family ahead of everything else (Compassionate axis)
  - His natural air of authority (Autocratic axis)
- **Flaw choice:** "As his son and heir, he has always thought you were too..."
  - Sentimental (Compassionate side)
  - Complacent (Compromising side)
  - Guileless (Straightforward side)
- **Design insight:** These paired choices let the player define BOTH a strength AND a weakness in a single narrative beat. The "what you admire" pushes one personality axis; the "what he criticizes" pushes another. Very efficient character definition.

**Physical Appearance Choice with Meta-Toggle**
- "As you wander the palace... you look just like..."
  - *"I pay little mind to such things, really. [This choice will disable physical descriptions of your character for the rest of the game.]"*
  - My father: tall, fair, and dark-haired
  - My noni: dark-skinned and auburn-haired
  - An even mixture of my parents' features
- **Key design pattern:** The bracketed meta-text `[This choice will disable physical descriptions...]` is an explicit out-of-character note. This is an **accessibility/inclusivity feature** — players who don't want physical descriptions can opt out entirely.
- **Implication for replication:** Requires a boolean flag (`show_appearance`) checked throughout the entire game wherever physical descriptions appear.

**NPC Gender Selection**
- "The last _____ of the Kidian dynasty."
  - daughter (female)
  - son (male)
  - survivor (non-binary)
- **Design pattern:** Player defines the gender of key NPCs, not just themselves. This multiplies the pronoun/title variable substitution work but greatly increases player agency.

**Attitude/Tone Choices**
- "You recall your first meeting with your present spymaster..."
  - I hated it at the time, but I came to accept its necessity
  - I hated having to hire a spymaster, and I still resent it now
  - I saw it as part of my birthright from the start
  - I always saw it as part of the grim reality of politics
- These 4-option attitude choices don't advance the plot but define the player's emotional relationship to game mechanics. They likely affect personality axes without changing the narrative path.

### 13.2 Chapter Structure

**Prologue (Character Creation):**
Pages 1–8: Perspective → Name → Gender → Shrine/Skill → City Origin → Backstory Activity → King's Letter → Flaw/Admiration → Appearance
- Ends with "Next Chapter" button (distinct from regular "Next")
- The "Next Chapter" button is a ChoiceScript `*finish` command that loads the next scene file

**Chapter 1 (The Return):**
- Royal Consort Harim scene (passage-heavy, relationship building)
- Staff system exposition
- Dialogue dynamically references backstory choices (city name, skill orientation)
- Ends with thematic monologue about allegiance

**Chapter 2 (The Rival):**
- Spy/agent system introduced
- Meeting with spymaster Sheyer in the gardens
- Inciting incident: Kidian heir has returned
- Observation scene at city guard barracks
- Player selects rival's gender

### 13.3 New Characters Discovered

| Character | Role | Pronouns | Notes |
|---|---|---|---|
| **Sheyer** | Player's personal spymaster | they/them | "Forgettable appearance," olive skin, employed since player was 17. Communicates via dead drops (folded notes with secret sign via passing servants) |
| **Kidian Heir** | Rival claimant to throne | Player-selected | Combat-trained, joined city guard as cover, accompanied by a loyalist caretaker |
| **Secretary** | Temporary staff (on loan) | she/her | Manages correspondence, carries silver tray of letters |

### 13.4 Game Systems Revealed

**Spy/Intelligence System:**
- Player has a personal spymaster (Sheyer) separate from the King's spy network
- Communication via dead drops — a maid slips a folded note marked with a secret sign
- Agent contacts can be initiated by either party
- Intelligence reports drive plot events (discovering the rival heir)
- The King also has a spymaster with "dozens of agents" — a rival intelligence network

**Correspondence System:**
- Secretary delivers morning correspondence on silver tray
- Letters include: royal business, favor requests, audience requests, old contacts, letters of credit, patronage offers
- King's letters advance the main plot
- Brother Belinon's letters are a running comic element (illegible handwriting)

**Dynamic Text Insertion (Confirmed Patterns):**
- `${name}` → "Kael" (in narrative and dialogue)
- `${title}` → "Prince" / "Princess" / "Princep" (in forms of address)
- `${city}` → "Jerrah" (in backstory references)
- `${papa/father}` → gendered parent term
- `${noni}` → gender-neutral parent term (always "noni" regardless of player gender)
- `${son/daughter/child}` → gendered child term
- `${he/she/they}` → pronouns for player and NPCs
- `${his/her/their}` → possessive pronouns
- Skill-based text: Consort dialogue references player's shrine choice ("you take more after me in your talents" for Social-oriented player)

### 13.5 Narrative Flow Metrics

From speed-play through ~25 pages:
- **Passage pages (Next only):** ~60% of pages
- **Choice pages (radio + Next):** ~40% of pages
- **Average choices per choice page:** 3–4 options
- **Average paragraphs per page:** 3–5
- **Choice confirmation pages:** Short (1–2 paragraphs acknowledging the choice)
- **Exposition pages:** Long (4–6 paragraphs of worldbuilding)
- **Dialogue-heavy pages:** Medium (2–4 paragraphs with quoted speech)

### 13.6 Critical Technical Issue: DOM Stacking Memory Leak

**Problem:** After ~15 pages of gameplay, the browser tab became completely unresponsive (froze, all JavaScript timed out after 45 seconds, screenshots timed out after 60 seconds).

**Root cause:** ChoiceScript's DOM stacking model — every page append adds more HTML to the document without removing old pages. After 15+ pages, the DOM contains 15+ complete page layouts, 15+ "Next" buttons, accumulating radio buttons, and redundant header/footer content.

**Implication for replication:** Any clone MUST implement proper page replacement (remove old page, insert new page) rather than ChoiceScript's stacking approach. The stacking model is a significant performance/UX liability.

**Workaround observed:** Reloading the page resets the DOM (ChoiceScript uses localStorage to preserve game state across reloads).

### 13.7 Save State Behavior

- ChoiceScript auto-saves to `localStorage` after each choice
- Page reload restores the game to the last choice point
- This means the game is resilient to browser crashes/tab freezes
- The save state includes all variable values (stats, name, backstory flags, etc.)

---

## 14. Updated Scene Flow (Complete Through Chapter 2)

```
PROLOGUE (startup.txt):
  Page 1: Narrative perspective choice (3 options)
  Page 2: Name selection (4 options: Nolix/Farah/Eldis/Another)
    → [if Another]: Page 2a: Text input "Choose your own name"
    → [if Another]: Page 2b: Confirmation "Your name is X, correct?" (Yes/No)
  Page 3: Gender/title selection (4 options: Prince/Princess/Princep/Fluid)
  Page 4: Chapel passage (exposition, religion system)
  Page 5: Shrine offering / skill choice (3 options: Atarah/Alum/Ariel)
  Page 6: Staff exposition passage
  Page 7: Correspondence scene passage
  Page 8: City origin choice (3 options: Jerrah/Sturia/Arness)
  Page 9: Backstory activity (2+ options, conditional on city)
  → [NEXT CHAPTER]

CHAPTER 1 — THE KING'S LETTER:
  Page 10: King's letter passage (letter from father)
  Page 11: Character flaw choice (3 options: Sentimental/Complacent/Guileless)
  Page 12: Admiration choice (3 options: subtlety/family/authority)
  Page 13: Choice confirmation passage (brief)
  Page 14: Physical appearance choice (4 options, includes meta-toggle)
  Page 15: Chapter ending monologue (allegiance theme)
  → [NEXT CHAPTER]

CHAPTER 2 — THE RIVAL:
  Page 16: Royal Consort Harim scene (passage)
  Page 17: Consort dialogue continuation (passage)
  Page 18: Consort dialogue — conflict discussion (passage)
  Page 19: Consort departure (passage)
  Page 20: Spy system introduction (passage)
  Page 21: Spymaster attitude choice (4 options)
  Page 22: Meeting Sheyer in gardens (passage)
  Page 23: Kidian heir revelation (passage)
  Page 24: City guard barracks observation (passage)
  Page 25: Rival heir gender selection (3 options: daughter/son/survivor)
  → [continues...]
```

---

## 15. Updated Replication Variable Schema

```
# Player Variables
string  name              # "Kael", "Nolix", etc.
string  surname           # "Suthis" (auto-assigned)
string  title             # "Prince", "Princess", "Princep"
string  gender            # "male", "female", "nonbinary", "fluid"
string  pronoun_subject   # "he", "she", "they"
string  pronoun_object    # "him", "her", "them"
string  pronoun_possess   # "his", "her", "their"
string  child_term        # "son", "daughter", "child"
string  parent_term       # "papa"/"mama" (gendered), "noni" (always available)
string  appearance        # "father", "noni", "mixed"
bool    show_appearance   # true/false — meta-toggle from appearance choice
string  origin_city       # "Jerrah", "Sturia", "Arness"
string  backstory         # "fostering", "military", etc.
string  admired_trait     # "subtlety", "family", "authority"
string  flaw              # "sentimental", "complacent", "guileless"
string  spy_attitude      # "accepted", "resent", "birthright", "grim_reality"

# Personality Axes (0-100, opposing pairs sum to 100)
int     ruthless          # vs compassionate (100 - ruthless)
int     manipulative      # vs straightforward
int     noble             # vs grasping
int     compromising      # vs autocratic

# Skills (integer levels with text descriptions)
int     physical_level    # Ariel's Favor
int     social_level      # Atarah's Favor
int     mental_level      # Alum's Favor
string  physical_desc     # changes per level
string  social_desc
string  mental_desc

# Relationships (0-100 percentages)
int     consort_trust     # Royal Consort Harim — starts at 60

# NPC Variables
string  rival_gender      # "male", "female", "nonbinary"
string  rival_title       # "son", "daughter", "survivor"
string  rival_pronoun_s   # "he", "she", "they"
string  rival_pronoun_o   # "him", "her", "them"
string  rival_pronoun_p   # "his", "her", "their"
```

---

## 16. Complete Source Code Analysis (Extracted from Browser Runtime)

### 16.1 Scene Architecture

The game consists of 7 scene files loaded in sequence:

| Scene File | Size | Status | Purpose |
|---|---|---|---|
| `startup.txt` | 43,742 chars | Extracted | Variable declarations, achievements, scene list |
| `1intro.txt` | 94,578 chars / 1,549 lines | Extracted | Full Chapter 1: character creation through route selection |
| `2heir.txt` | 27 chars (encrypted) | Paid content | Chapter 2: Heir route storyline |
| `3consort.txt` | 27 chars (encrypted) | Paid content | Chapter 3: Consort route storyline |
| `4king.txt` | 27 chars (encrypted) | Paid content | Chapter 4: King route storyline |
| `subme.txt` | 17,714 chars / 516 lines | Extracted | Shared subroutines (character setup, endings, trust calc) |
| `dtb.txt` | 125,228 chars / 1,823 lines | Extracted | "Decision Tree Branch" hub — free-time conversations, management |

Scene list in startup: `*scene_list` → startup, 1intro, $ 2heir, $ 3consort, $ 4king, subme, dtb. The `$` prefix marks paid/encrypted scenes.

### 16.2 Complete Variable Registry (196 Variables)

**Game State & Flow Control:**
```
route = 1              # Active route (1=Heir ally, 2=Heir destroy, 3=Fake heir)
days_to = 0            # Days remaining counter
turncoat = 0           # Turncoat score (betrayal meter)
bodycount = 0          # Kill counter
staff = 0              # Staff count
intro_complete = false # Chapter 1 finished
decision_complete = false
execute_complete = false
cc_complete = false    # Character creation done
mc_address = false
```

**Plot Flags:**
```
fake_heir = false       # Using a fake heir (route 3)
lux_conspire = 0        # Conspiracy with Lux (fake heir handler)
lux_kidia = 0           # Lux's interaction with Kidia
usurper_letter = false   # Sent letter to usurper
cousin_invite = false    # Invited cousin
cousin_crow = false
heir_moved = false       # Heir relocated
belinon_intro = false    # Brother introduced
belinon_plan = false     # Brother's plan revealed
switch_from = ""         # Route switch tracking
knows_too_much = false   # NPC knows secret
```

**Ending-Critical Flags:**
```
patricide = false        # Killed own father
revenge = false          # Sought revenge
kidia_spare = 1          # Spared Kidia heir (1=yes)
usurper_alive = true     # Usurper king still alive
usurper_deposed = false  # Usurper removed from throne
heir_alive = true        # True heir still alive
fake_alive = true        # Fake heir still alive
crow_alive = true        # The Crow (assassin) still alive
crow_exile = false       # Crow exiled
alliance_sealed = false  # Political alliance formed
troubled_union = false   # Alliance has problems
corulers = false         # Sharing power as co-rulers
```

**Dynasty/Succession Flags:**
```
heirs_kidia = false     # Heirs follow Kidia line
heirs_suthis = false    # Heirs follow Suthis line
heirs_adopt = false     # Adopted heirs
split_suthis = true     # Power split favoring Suthis
split_kidia = false     # Power split favoring Kidia
```

**Player Identity:**
```
name = "Nolix"          # Player name (default)
initial = "N"           # First letter
title = "prince"        # Royal title
title_pl = "princes"    # Plural form
monarch = "king"        # Monarch title
gender = "male"         # Gender
person = "man"          # Person noun
child = "son"           # Child noun
they/their/them/theirs/themself/theyre/are/were/theyve/have  # Full pronoun set
plural = false          # Grammar: singular/plural verb forms
genderfluid = false
trans_binary = false
trans_set = false
fl_changed = false      # Fluid gender changed this scene
```

**NPC Identity (Heir - h_ prefix):**
```
h_name = "Secret Heir"
regnal_name = ""        # Regnal name if crowned
h_title = "princess"
h_monarch = "queen"
h_gender = "female"     # Default female
h_person/h_child/h_they/h_their/h_them/h_theirs/h_themself/h_theyre/h_are/h_were/h_theyve/h_have
h_plural = false
h_physical/h_social/h_mental = 1/0/0  # NPC skills
```

**NPC Identity (Fake Heir / Guard - f_ prefix):**
```
guard_name = "Tamirah"
guard_nick = "Tamirah"
f_title = "princess"
f_gender = "female"     # Default female
f_they/f_their/f_them/f_theirs/f_themself/f_theyre/f_are/f_were/f_theyve/f_have
f_plural = false
f_physical/f_social/f_mental = 1/0/0
```

**NPC Identity (Consort - c_ prefix):**
```
c_name = "Consort"
c_title = "princess"
c_gender = "female"
c_they/c_their/c_them... (full pronoun set)
c_physical/c_social/c_mental = 0/0/0
```

**Relationship Tracking:**
```
turncoat_heir_trust = 0       # Trust with true heir
turncoat_heir_friendship = 0  # Friendship with true heir
turncoat_heir_romance = 0     # Romance with true heir
turncoat_heir_dtd = false     # "Down to date" flag

turncoat_fake_trust = 0       # Trust with fake heir/guard
turncoat_fake_friendship = 0
turncoat_fake_romance = 0
turncoat_fake_dtd = false

turncoat_consort_trust = 60   # Trust with royal consort (starts high)
turncoat_king_trust = 40      # Trust with the king (starts moderate)
```

**Personality & Skills:**
```
ruthless = 50 / noble = 50 / manipulative = 50 / compromising = 50
physical = 1 / social = 1 / mental = 1
```

**Romance & Orientation:**
```
att_ro/att_sx = false         # Attracted to romance/sex generally
f_ro/f_sx = false             # Attracted to female romance/sex
m_ro/m_sx = false             # Attracted to male romance/sex
n_ro/n_sx = false             # Attracted to nonbinary romance/sex
its_complicated = false       # Complex orientation
enable_all_romance = false    # Unlock all romance options
ori_set = false               # Orientation configured
```

**Appearance & Cosmetics:**
```
height = 3                    # Height setting
skin = "olive"
eyes = "green"
hair = "black"
mc_appearance_verbose = true  # Show appearance descriptions (meta-toggle)
mc_fashion_verbose = true     # Show fashion descriptions
personal_seal = ""            # Personal heraldic seal
fav_color = ""
accent_color = ""
masque_role = "X"             # Role in masque performance
```

**Conversation Counters:**
```
spyconv = 0    # Spy conversations had
noniconv = 0   # Consort conversations
kidconv = 0    # Kidia heir conversations
croconv = 0    # Crow conversations
```

**Letter System:**
```
palett = 0     # Palace letters sent
brolett = 0    # Brother letters sent
cuzlett = 0    # Cousin letters sent
lettall = true # All letter options available
```

**Location Flags:**
```
tourpal = false   # Toured palace
porhall = false   # Visited portrait hall
presed = false    # Pre-seduction
postsed = false   # Post-seduction
exile_city = "Arness"  # City of exile
```

**Debug/System:**
```
debug_mode = false
debug_char = 0
demo_mode = false
test_mode = false
res_king = true    # Resource: king available
res_con = false    # Resource: consort available
dbg_ori = "no orientation set"
```

---

## 17. Complete Achievement/Ending System (15 Endings)

### 17.1 All Achievements

| # | ID | Title | Description | Points | Type |
|---|---|---|---|---|---|
| 1 | `patricide` | Patricide | Murdered your father in cold blood to ascend to the throne | 10 | Ending |
| 2 | `battle` | Heat of Battle | Killed your father in battle to ascend to the throne | 10 | Ending |
| 3 | `vengeance` | Vengeance | Allowed the last Kidia heir to avenge their family's murder | 15 | Ending |
| 4 | `curtain` | Behind the Curtain | As royal consort, you rule Koth from the shadows | 10 | Ending |
| 5 | `ambition` | Naked Ambition | Ascended to the throne as a reigning monarch, not a consort | 10 | Ending |
| 6 | `union` | Union of Equals | Chose to share the powers and responsibilities of the throne | 15 | Ending |
| 7 | `heir` | Of the Blood | Put the rightful heir of Koth's monarchs on the throne | 15 | Ending |
| 8 | `fool` | Fool's Gold | Successfully passed off an impostor as the missing heir of Koth | 15 | Ending |
| 9 | `destroy` | End of the Line | Destroyed the last remnants of the Kidia dynasty | 15 | Ending |
| 10 | `loyalty` | Absolute Loyalty | Chose to preserve your father's throne | 15 | Ending |
| 11 | `seduction` | Seduce and Destroy | Seduced the Kidia heir while planning to murder them | 10 | Special |
| 12 | `bodycount` | Bloody-Handed | Killed at least three people on your way to the throne | 10 | Special |
| 13 | `escape` | Wounded Tiger | Wounded your enemy, but they lived to fight another day | 10 | Ending |
| 14 | `failure` | Backstabbed | Plans failed, killed by your enemies | 10 | Bad End |
| 15 | `filicide` | Filicide | Rose up to kill your own father and were killed instead | 15 | Bad End |

### 17.2 Ending Logic (from `subme.txt` crownme subroutine)

The `*gosub_scene subme crownme` subroutine is called when the game reaches its conclusion. It checks conditions and fires achievement(s):

```
Route 1 (Ally with true heir) + heir_alive:
  → achieve "heir" (Of the Blood)
  → IF corulers: achieve "union" (Union of Equals)
  → IF NOT corulers: achieve "curtain" (Behind the Curtain)

Route 2 (Destroy heir) + usurper NOT alive:
  → achieve "ambition" (Naked Ambition)

Route 3 (Fake heir) + fake_alive:
  → IF usurper NOT alive: achieve "ambition" (Naked Ambition)
  → achieve "fool" (Fool's Gold)
```

The `killme` subroutine fires on each kill:
```
bodycount += 1
IF bodycount = 3 AND (heir dead OR usurper dead):
  → achieve "bodycount" (Bloody-Handed)
```

### 17.3 Ending Condition Map

| Ending | Required Route | Key Variables | How to Reach |
|---|---|---|---|
| Of the Blood | Route 1 | heir_alive=true | Ally with true heir, keep them alive |
| Union of Equals | Route 1 | heir_alive=true, corulers=true | Ally + share power equally |
| Behind the Curtain | Route 1 | heir_alive=true, corulers=false | Ally but rule from shadows |
| Naked Ambition | Route 2 or 3 | usurper_alive=false | Kill the usurper king, take throne |
| Fool's Gold | Route 3 | fake_alive=true | Pass off impostor as heir |
| Patricide | Any | patricide=true | Murder father deliberately |
| Heat of Battle | Any | (battle context) | Kill father during combat |
| Vengeance | Route 1 | revenge=true | Let Kidia heir avenge family |
| End of the Line | Route 2 | (heir destroyed) | Wipe out Kidia dynasty |
| Absolute Loyalty | None | (defend father) | Protect usurper king's throne |
| Seduce and Destroy | Route 2 | romance + betrayal | Romance heir then kill them |
| Bloody-Handed | Any | bodycount >= 3 | Kill 3+ people |
| Wounded Tiger | Any | (enemy escapes) | Enemy survives your attack |
| Backstabbed | Any | (player fails) | Enemies discover and kill you |
| Filicide | Any | (failed patricide) | Try to kill father, fail, die |

---

## 18. Complete Scene Structure Analysis

### 18.1 Chapter 1 (1intro.txt) — 1,549 Lines, 22 Labels, 17 Choices

**Labels (navigation anchors):**
```
chapter1           → Main chapter start
meet_spy           → Meeting with spymaster Sheyer
observe_heir       → Observing the Kidia heir
finish_observing   → Post-observation
observe_spar       → Watching heir spar/train
observe_drinks     → Social observation scene
consult_spy        → Consulting spymaster about findings
observe_fake       → Observing the fake heir candidate
select_fake        → Selecting the fake heir
fake_heir_selected → Fake heir confirmed
meet_guard         → Meeting the guard (Tamirah)
fake_heir_consult  → Consulting about fake heir plan
consult_consort    → Consulting the royal consort
spouse_dilemma     → Moral dilemma about consort
at_times           → Reflection passage
rose_garden        → Rose garden scene
route_select       → CRITICAL: Player selects their route
consult_decision   → Consulting advisors before route choice
post_advice        → CRITICAL: Final route selection (3 options)
eoc1               → End of Chapter 1
trial_end          → Paywall check
purchased          → Post-purchase continuation
```

**Choice Architecture (17 choice points):**
1. Attitude toward spymaster (4 options, fake_choice → personality)
2. Character creation gender choice (3 options, real choice → goto)
3. How you view the heir initially (4 options, fake_choice → personality)
4. Observation approach (3 options, fake_choice → personality)
5. Heir training assessment (4 options, fake_choice)
6. Guard loyalty assessment (4 options, fake_choice)
7. Religious compliment style (3 options, fake_choice)
8. Violence willingness (4 options, fake_choice → personality)
9. Orientation setup (fake_choice via gosub_scene subme orientme)
10. Genderfluid setup (conditional, gosub_scene subme fluidme)
11. Seal selection (gosub_scene subme setseal)
12-15. Advisor consultations (disable_reuse choices — consult Noni, spy, guard, or decide alone)
16. **Route selection** (3 options — THE critical branching point)
17. Trial end / purchase check

**The Big Branch — Route Selection (line 1492):**
```
Choice: "What is your plan?"
  Option 1: "Stay close to the Kidian heir and make them my ally"
    → route = 1, turncoat + 1, fake_heir = false
  Option 2: "Get close to the Kidian heir in order to destroy them"
    → route = 2, fake_heir = false
  Option 3: "Ignore the heir and make the guard my fake heir instead"
    → route = 3, turncoat_fake_trust = 15, fake_heir = true
```

### 18.2 Subroutines (subme.txt) — 516 Lines, 13 Labels, 8 Choices

All subroutines use `*return` (called via `*gosub_scene subme [label]`):

| Label | Lines | Purpose |
|---|---|---|
| `setseal` | 8–43 | Choose personal heraldic seal (manticore/sea lion/lily/tower/custom initial) |
| `setsealchoice` | 14–43 | Seal selection fake_choice |
| `orientme` | 46–180 | Full sexual orientation setup (7 options: attracted to women, men, aro-ace, bi-allo, ace-romantic, detailed config, skip) |
| `genderme` | 181–243 | Set pronouns/titles based on gender (male/female/nonbinary branches) |
| `neome` | 245–342 | Neopronoun system (e/em, he, she, they, ze/zir, fae/faer, custom) |
| `neo_pronouns` | 343–360 | Custom pronoun entry |
| `neo_pronouns_test` | 361–397 | Test custom pronouns in a sentence |
| `fluidme` | 398–424 | Genderfluid switching logic |
| `trustme` | 425–446 | Calculate trust/friendship/romance for heir or fake heir |
| `crownme` | 449–474 | **ENDING LOGIC** — fire achievements based on route + alive flags |
| `killme` | 477–486 | Increment bodycount, check for bloody-handed achievement |
| `aceme` | 488–504 | Set asexual orientation flags |
| `luxrole` | 507–516 | Masque performance scene for guard character |

### 18.3 Hub Scene (dtb.txt) — 1,823 Lines, 21 Labels, 16 Choices

The DTB (Decision Tree Branch) scene is a **management hub** called from the paid chapters. Players return here between major story beats for free-time activities:

| Label | Lines | Size | Purpose |
|---|---|---|---|
| `dtb_spy` | 8–139 | 132 | Conversations with spymaster Sheyer (varies by spyconv counter, 1-3+) |
| `advise_caution` | 140–180 | 41 | Spy advises caution — player responds |
| `lux_orders` | 181–223 | 43 | Give orders to Lux (fake heir handler) |
| `dtb_consort` | 224–303 | 80 | Talk to royal consort Noni |
| `consort_presed_end` | 304–728 | 425 | **Massive** consort interaction tree (romance/politics/intrigue) |
| `dtb_consort_usurper` | 729–787 | 59 | Discuss the usurper with consort |
| `dtb_dethrone` | 788–790 | 3 | Dethrone decision |
| `dtb_reassure` | 791–797 | 7 | Reassure consort |
| `end_dtb_consort` | 798–802 | 5 | End consort conversation |
| `dtb_heir` | 803–931 | 129 | Conversations with the Kidia heir |
| `lux_kidia_recruit` | 932–1126 | 195 | Lux's attempt to recruit Kidia |
| `lux_kidia_report` | 1127–1282 | 156 | Report on Kidia recruitment |
| `dtb_heir_end` | 1283–1321 | 39 | End heir conversation |
| `dtb_crow` | 1322–1352 | 31 | Conversations with The Crow (assassin NPC) |
| `provoke` | 1353–1569 | 217 | **Large** provocation/confrontation sequence |
| `dtb_crow_end` | 1570–1575 | 6 | End Crow conversation |
| `dtb_letters` | 1576–1578 | 3 | Letter-writing hub |
| `write_real` | 1579–1686 | 108 | Write actual letters (to palace, brother, cousin) |
| `luxtrust` | 1687–1783 | 97 | Build trust with Lux |
| `luxtrust_loc` | 1784–1808 | 25 | Lux trust location-based scene |
| `tostr` | 1809–1822 | 14 | Number-to-string converter utility |

**DTB Choice Points (16 choices, mostly fake_choice):**
- Attitude check: "How do you feel about your plan?" (5 options)
- Aristocracy debate (4 options → personality)
- Consort topic selection (3 options, disable_reuse — can revisit)
- Heir interaction style: "Steel yourself" vs. open approaches
- Letter recipients (palace/brother/cousin, disable_reuse)
- Provocation responses in confrontation sequence
- Trust-building activities with various NPCs

---

## 19. Complete Decision Tree

### 19.1 High-Level Plot Flow

```
ACT 1 — SETUP (1intro.txt, free)
  Character Creation → World Introduction → Meet NPCs → Discover Heir
  ↓
  ROUTE SELECTION (end of Chapter 1 — the CENTRAL branch point)
  ├── Route 1: ALLY — Side with the true Kidia heir
  ├── Route 2: DESTROY — Get close to heir to destroy them
  └── Route 3: FAKE — Ignore heir, install fake heir (the guard)
  ↓
ACT 2 — DEVELOPMENT (2heir.txt / 3consort.txt, paid)
  Route-specific storyline with DTB hub interludes
  Player builds relationships, makes sub-decisions
  ↓
ACT 3 — CLIMAX (4king.txt, paid)
  Confrontation with the usurper king
  Final decisions about killing, allying, betraying
  ↓
ENDING (subme.txt crownme subroutine)
  Achievement(s) fired based on final state of flags
```

### 19.2 Route 1 — Ally with True Heir

```
Route 1 selected → turncoat + 1, fake_heir = false
  ↓
  Build trust with heir (turncoat_heir_trust, friendship, romance)
  Navigate consort relationship (turncoat_consort_trust)
  Manage king relationship (turncoat_king_trust)
  ↓
  Key decisions:
  ├── Kill the usurper king?
  │   ├── Yes, cold blood → patricide = true → achieve "patricide"
  │   ├── Yes, in battle → achieve "battle"
  │   ├── Let heir do it → revenge = true → achieve "vengeance"
  │   └── No, fail → achieve "failure" or "filicide"
  ├── Share power?
  │   ├── Co-rulers → corulers = true → achieve "union"
  │   └── Rule from shadows → corulers = false → achieve "curtain"
  └── Keep heir alive?
      ├── Yes → heir_alive = true → achieve "heir"
      └── No → heir_alive = false → different ending path
```

### 19.3 Route 2 — Destroy the Heir

```
Route 2 selected → fake_heir = false
  ↓
  Get close to heir while secretly plotting their destruction
  Optional: seduce heir → achieve "seduction"
  ↓
  Key decisions:
  ├── Kill the heir?
  │   ├── Yes → heir_alive = false, bodycount + 1
  │   └── No / They escape → achieve "escape"
  ├── Kill the usurper too?
  │   ├── Yes → usurper_alive = false → achieve "ambition"
  │   └── No → protect father → achieve "loyalty"
  ├── Wipe out dynasty?
  │   └── Yes → achieve "destroy" (End of the Line)
  └── Get caught?
      └── Yes → achieve "failure" (Backstabbed)
```

### 19.4 Route 3 — Install Fake Heir

```
Route 3 selected → fake_heir = true, turncoat_fake_trust = 15
  ↓
  Work with guard (Tamirah) to create convincing impostor
  Build fake heir's credibility
  Manage Lux (handler) conspiracy level
  ↓
  Key decisions:
  ├── Keep fake alive?
  │   ├── Yes → fake_alive = true → achieve "fool"
  │   └── No → fake_alive = false
  ├── Kill the usurper?
  │   ├── Yes → usurper_alive = false → achieve "ambition"
  │   └── No → achieve "loyalty"
  └── Get discovered?
      └── Yes → achieve "failure" (Backstabbed)
```

### 19.5 Cross-Route Achievements

These can be earned regardless of route:
- **Bloody-Handed** (bodycount >= 3): Kill 3+ NPCs across the story
- **Backstabbed** (failure): Get caught/killed by enemies
- **Filicide**: Attempt patricide but fail and die
- **Wounded Tiger** (escape): Enemy survives your assassination attempt

### 19.6 Achievement Combinability

Some endings stack:
- Route 1 + heir alive + co-rulers → "heir" + "union" (2 achievements)
- Route 3 + fake alive + usurper dead → "ambition" + "fool" (2 achievements)
- Any route + bodycount 3 + major kill → adds "bodycount" on top
- Route 2 + seduced heir + killed heir → "seduction" + route ending

---

## 20. Reusable Branching-Plot Template

### 20.1 Template Architecture

Based on Turncoat Chronicle's structure, here is a reusable template for creating branching interactive fiction:

```
TEMPLATE: BRANCHING INTERACTIVE FICTION
=======================================

LAYER 1: SCENE FILES
  startup.txt    — Variable declarations, config
  act1.txt       — Setup act (free/trial content)
  act2_routeA.txt — Route A development
  act2_routeB.txt — Route B development
  act2_routeC.txt — Route C development (optional)
  act3.txt       — Climax (shared or per-route)
  subroutines.txt — Shared utility subroutines
  hub.txt        — Free-time management hub (optional)

LAYER 2: VARIABLE CATEGORIES
  [identity]     — Player name, gender, pronouns, title
  [npc_identity] — For each major NPC: name, gender, pronouns, relationship to player
  [personality]  — Opposed pairs (2-4 axes, each summing to 100)
  [skills]       — 2-4 skills with integer levels
  [relationships]— Trust/friendship/romance meters per major NPC
  [plot_flags]   — Boolean flags for key story events
  [ending_flags] — Variables that determine which ending fires
  [counters]     — Conversation counts, letter counts, kill counts
  [cosmetic]     — Appearance, style choices (can be toggled off)

LAYER 3: CHOICE TYPES
  *fake_choice   — Flavor/personality only (no narrative branch)
  *choice + goto — Real branch (different scenes/labels)
  *disable_reuse — Can't pick same option twice (advisor consultations)
  *hide_reuse    — Previously picked options hidden
  *selectable_if — Conditional availability based on variables

LAYER 4: NARRATIVE STRUCTURE
  [passage]      — Exposition text + Next button (60% of pages)
  [choice_page]  — Narrative + 2-4 radio options + Next (40% of pages)
  [text_input]   — Free-text entry (names, custom inputs)
  [confirmation] — Verify text input (Yes/No loop)
```

### 20.2 Plot Architecture Template

```
ACT 1 — SETUP (free trial, ~20-30% of content)
  ├── Character Creation (woven into narrative)
  │   ├── Name (preset options + custom)
  │   ├── Gender/Pronouns (inclusive options)
  │   ├── Skill focus (framed as story choice)
  │   ├── Backstory (origin + activity)
  │   └── Personality (paired admiration + flaw choices)
  ├── World Introduction
  │   ├── Setting exposition (passage pages)
  │   ├── Key NPC introductions (3-5 major NPCs)
  │   └── Inciting incident reveal
  ├── Investigation Phase
  │   ├── Gather information (observation scenes)
  │   ├── Meet key players (relationship-building choices)
  │   └── Consult advisors (disable_reuse options)
  └── ROUTE SELECTION ← Central branch point
      ├── Route A: [Aligned/Cooperative path]
      ├── Route B: [Opposed/Adversarial path]
      └── Route C: [Deceptive/Third-way path] (optional)

ACT 2 — DEVELOPMENT (paid content, ~50% of content)
  ├── Route-Specific Main Plot
  │   ├── Unique scenes per route
  │   ├── Route-specific NPC interactions
  │   └── Sub-decisions within each route
  ├── Hub Interludes (shared across routes)
  │   ├── Free-time conversations (spyconv/noniconv counters)
  │   ├── Relationship-building activities
  │   ├── Letter writing / correspondence
  │   └── Management decisions
  └── Escalating Stakes
      ├── Betrayals / revelations
      ├── Relationship tests
      └── Point of no return

ACT 3 — CLIMAX (paid content, ~20% of content)
  ├── Confrontation
  │   ├── Physical conflict options (kill, spare, fight)
  │   ├── Political resolution options (alliance, coup, exile)
  │   └── Personal resolution (romance, betrayal, sacrifice)
  └── ENDING DETERMINATION
      ├── Check route variable
      ├── Check alive/dead flags for each major NPC
      ├── Check relationship flags (corulers, alliance, etc.)
      └── Fire appropriate achievement(s)
```

### 20.3 Decision Tree Design Pattern

```
DESIGN PATTERN: 3-ROUTE BRANCHING WITH MODULAR ENDINGS
======================================================

Central insight from Turncoat Chronicle:
- ONE big branch point (route selection) creates 3 narrative paths
- Within each path, MULTIPLE boolean flags accumulate
- Endings are determined by COMBINATION of route + flags
- This allows 15+ distinct endings from just 3 routes

Formula: Endings = Routes × Flag Combinations
  3 routes × ~4-5 flag states each = 12-15 endings

Key variables for ending determination:
  route (int)           — Which major path
  [ally]_alive (bool)   — Did key allies survive?
  [enemy]_alive (bool)  — Did key enemies survive?
  power_shared (bool)   — Power structure at end
  betrayal_flag (bool)  — Major betrayal committed?
  kill_count (int)      — Violence level
  romance_active (bool) — Active romance at ending

Ending categories:
  TRIUMPH endings (high agency, goals achieved)
  COMPROMISE endings (partial success, trade-offs)
  FAILURE endings (plans unravel, player dies/exiled)
  SPECIAL endings (unusual conditions met)
```

### 20.4 Relationship System Template

```
Per NPC:
  trust (0-100, percent)        — How much NPC trusts player
  friendship (integer, additive) — Friendship score
  romance (integer, additive)   — Romance score
  dtd (boolean)                 — Romance available flag

Trust modifiers:
  Major aligned choice:  %+ 10
  Minor aligned choice:  %+ 5
  Major opposed choice:  %- 10
  Minor opposed choice:  %- 5

Friendship/Romance: Simple additive (+1 per positive interaction)

The trustme subroutine pattern:
  Called with (trust, friend, rom) params
  Routes to correct NPC based on fake_heir flag
  Applies percentage trust changes and additive friend/romance
```

### 20.5 Personality System Template

```
Opposed Pairs (dual-axis, sum to 100):
  Axis 1: [Trait A] ←→ [Trait B]    (e.g., Ruthless ←→ Compassionate)
  Axis 2: [Trait C] ←→ [Trait D]    (e.g., Manipulative ←→ Straightforward)

Modification pattern:
  *set traitA %+ 10  → Increases A by 10% of remaining distance to 100
  (This is ChoiceScript's fairmath — diminishing returns near extremes)

Usage: Personality affects available dialogue options and NPC reactions
  *selectable_if (ruthless > 60) #"I'll kill them myself."
  *if (manipulative > 50) [different NPC response text]

Starting value: 50 (perfectly neutral)
Typical modification: %+ 5 for minor, %+ 10 for major choices
```

### 20.6 Pronoun System Template

```
For EACH gendered character (player + each major NPC):
  they      — subject pronoun (he/she/they/e/ze/fae)
  their     — possessive adj (his/her/their/eir/zir/faer)
  them      — object pronoun (him/her/them/em/zir/faer)
  theirs    — possessive pronoun (his/hers/theirs)
  themself  — reflexive (himself/herself/themself)
  theyre    — contraction (he's/she's/they're)
  are       — verb form (is/is/are)
  were      — past verb (was/was/were)
  theyve    — contraction (he's/she's/they've)
  have      — aux verb (has/has/have)
  plural    — boolean for verb agreement

  title     — royal/social title (prince/princess/princep)
  title_pl  — plural title (princes/princesses/princeps)
  monarch   — ruler title (king/queen/monarch)
  gender    — gender string (male/female/nonbinary)
  person    — person noun (man/woman/person)
  child     — child noun (son/daughter/child)

Total: ~16 variables per gendered character
For 4 gendered characters: 64 pronoun-related variables

Neopronoun support: Allow custom entry for all pronoun fields
Test sentence pattern: "When [they] arrived, [their] friend greeted [them]."
```

---

## 21. Implementation Recommendations

### 21.1 What Makes This Game Work

1. **Fake choices are the backbone.** ~70% of choices are `*fake_choice` — they don't branch the plot but they shape personality stats, which in turn gate future options and color NPC responses. This creates a FEELING of agency without exponential branching.

2. **One big fork, many small flags.** The single route selection at end of Act 1 is the only choice that creates truly different narrative paths. All other variation comes from flag combinations checked at the ending.

3. **Hub pattern manages complexity.** The DTB hub scene is called repeatedly from the main storyline. Players can have conversations, write letters, build relationships — all without the main plot branching further. This adds 125K words of content without multiplying plot complexity.

4. **Subroutine reuse.** The `subme` scene contains utilities called from multiple places: pronoun setup, trust calculation, ending logic. Write once, call from anywhere.

5. **Inclusive by default.** The pronoun system (16 variables per character), neopronoun support, orientation system (romantic + sexual attraction as separate axes for each gender), genderfluid support, and appearance description toggle show how deeply inclusivity is built into the architecture.

### 21.2 Content Budget Estimation

Based on extracted data:
- Act 1 (1intro): ~94K chars ≈ 16,000 words (1 scene)
- Hub (dtb): ~125K chars ≈ 21,000 words (1 scene)
- Subroutines (subme): ~18K chars ≈ 3,000 words
- Paid content (2heir + 3consort + 4king): encrypted, but estimated ~140,000 words based on total 180K claimed
- **Total: ~180,000 words across 7 files**

For a clone at 50% scale: ~90,000 words minimum
For a minimal viable version: ~40,000 words (Act 1 + one route + hub)

---

*Notes compiled from three analysis sessions, April 2026*
*Source extraction: 237,262 chars of ChoiceScript source code extracted from browser runtime*
*3 of 7 scene files fully extracted (paid scenes encrypted)*
*196 variables mapped, 15 endings documented, complete decision tree reconstructed*
*Game version: Web (choiceofgames.com)*

# Pax Historia — Comprehensive Gameplay & Architecture Notes
**Compiled for replication / alternate version development**
**Game URL:** https://www.paxhistoria.co
**Session played:** World War II preset, Soviet Union, December 1935

---

## Table of Contents
1. [High-Level Concept](#1-high-level-concept)
2. [User Onboarding & Landing Page](#2-user-onboarding--landing-page)
3. [Token Economy](#3-token-economy)
4. [Navigation Bar (Top)](#4-navigation-bar-top)
5. [Preset System](#5-preset-system)
6. [Polity (Nation) Selection](#6-polity-nation-selection)
7. [Core Game Loop](#7-core-game-loop)
8. [World Map](#8-world-map)
9. [Player Action Input System](#9-player-action-input-system)
10. [Time Navigation & Round System](#10-time-navigation--round-system)
11. [Event Generation & Playback](#11-event-generation--playback)
12. [Intervene Mechanic](#12-intervene-mechanic)
13. [Diplomatic Chat System](#13-diplomatic-chat-system)
14. [Advisor AI Panel](#14-advisor-ai-panel)
15. [Event Manager (⌘E)](#15-event-manager-e)
16. [Cheats Menu (⌘H)](#16-cheats-menu-h)
17. [Prompts & AI Architecture (⌘P)](#17-prompts--ai-architecture-p)
18. [Event Consolidation System](#18-event-consolidation-system)
19. [Hamburger Menu — Full Contents](#19-hamburger-menu--full-contents)
20. [Map Entity System](#20-map-entity-system)
21. [Country Info Panel](#21-country-info-panel)
22. [Bottom Bar Controls](#22-bottom-bar-controls)
23. [Token Cost Reference](#23-token-cost-reference)
24. [AI Pipeline Architecture Summary](#24-ai-pipeline-architecture-summary)
25. [Data Structures & Schema Inferences](#25-data-structures--schema-inferences)
26. [Technical & Implementation Notes](#26-technical--implementation-notes)

---

## 1. High-Level Concept

Pax Historia is a browser-based AI-powered **grand strategy simulation** game. The core innovation is that all player actions and world events are described in **natural language** and processed by an AI (LLM) which generates narrative outcomes and modifies game state accordingly. There is no traditional rules engine — the LLM IS the rules engine.

**Elevator pitch:** A "Civilization meets AI storytelling" game where you type what your nation does, and an AI simulates the realistic historical consequences on a live world map.

**Key differentiators vs traditional grand strategy:**
- No pre-scripted events — everything is AI-generated from context
- Actions written as free-form text instead of clicking UI buttons
- Game state narrated rather than shown as numbers
- Multiple AI modules work together (advisor, diplomat, event generator, etc.)
- Players can customize AI rules (the simulation prompt is editable!)
- Historical presets with real start dates and factions

---

## 2. User Onboarding & Landing Page

- The site at paxhistoria.co presents a marketing landing page before login
- Sign-up / sign-in via standard auth (email/password or OAuth)
- New users receive **$1.000 in tokens** as starting balance
- No tutorial popup on game start — tutorial accessible via hamburger menu

---

## 3. Token Economy

### Overview
- Tokens are the in-game currency, displayed in the top nav bar as a gold coin icon + balance (e.g., `$0.984`)
- Tokens are consumed whenever the AI is queried
- Tokens can be earned by participating in AI crowdsourcing ("Help Improve AI Models")

### Token Balance Display
- Location: Top-right navigation bar
- Format: Gold coin icon + decimal balance (e.g., `$1.000`, `$0.984`, `$0.980`)
- Each AI operation reduces the balance by a small amount
- Starting balance for new accounts: **$1.000**

### Cost Events Observed
- Asking the Advisor a question: costs ~$0.004 per query (balance dropped from $0.984 to $0.980)
- Jumping forward (generating events for a round): costs tokens
- Starting a diplomatic chat: costs tokens
- Submitting player actions: costs tokens

### Earning Tokens
- "Help Improve AI Models" feature: users earn tokens by rating AI-generated outputs
- This is a crowdsourcing mechanism to improve the AI while compensating users

---

## 4. Navigation Bar (Top)

Fixed top bar across the entire application. Contains:

| Element | Position | Function |
|---------|----------|----------|
| Pax Historia logo (globe icon + text) | Left | Home / marketing page |
| **Games** | Center-left | Navigate to your active games list |
| **Presets** | Center | Browse and start new games from presets |
| **Flags** | Center | (Community flags / nation flags section) |
| **Community** | Center-right | Community section |
| Gift icon 🎁 | Right | Rewards / referral system |
| Token balance (🪙 $X.XXX) | Right | Current token count |
| Bell icon 🔔 | Right | Notifications |
| Avatar / profile icon | Far right | User account menu |

---

## 5. Preset System

Presets are pre-configured historical scenarios that set up the game world.

### Accessing Presets
- Top nav → **Presets** button
- Also accessible from the Games menu when creating a new game

### Preset Card Information
Each preset card displays:
- **Preset name** (e.g., "World War II")
- **Start date** (e.g., "December 1st, 1935")
- **Description** of the historical scenario
- **Simulation rules summary** (the AI prompt constraints for that scenario)
- **Play count** — number of times this preset has been played (social proof)
- **Popularity indicator** (some presets shown as "Popular")

### Known Presets (from session)
- **World War II** — Start: December 1st, 1935. Covers the pre-WWII geopolitical situation.

### Preset Configuration
- Presets define the **start date** for simulation
- Presets define the **simulation rules** (AI prompt) that govern that historical era
- Players can create custom presets (exact UI not fully explored)

---

## 6. Polity (Nation) Selection

After selecting a preset, players choose which nation (polity) to play as.

### Selection Interface
- Full-screen overlay showing available polities
- Each polity entry displays:
  - **Nation name** (e.g., "Soviet Union", "German Reich")
  - **Flag** of the nation
  - **Play count** — how many times other players have played as this nation (e.g., "Played 234 times")
  - Clicking selects that polity and starts the game

### Special Polity Rule
- The player can create a **non-historical polity** (one that didn't exist at the start date) — but only ONE such custom polity per game. This is explicitly stated in the simulation rules prompt.

---

## 7. Core Game Loop

The fundamental gameplay cycle:

```
1. PLAN PHASE (current round open)
   ├── Type 1-3 player actions in natural language
   ├── (Optional) Open diplomatic chats with AI-controlled nations
   ├── (Optional) Ask Advisor for strategic guidance
   └── Click "Jump Forward" button

2. SIMULATION PHASE (AI processing)
   ├── AI reads player actions + game context + simulation rules
   ├── AI generates narrative events for player's nation
   ├── AI generates reaction events from other nations
   └── AI updates game state (territory, units, relations)

3. PLAYBACK PHASE (events display)
   ├── Events play back one by one in the events panel
   ├── Each event has: date, nation flag, title, narrative text, audio option
   ├── Red "Intervene" button appears to pause and redirect
   └── All events logged to Event Manager

4. REVIEW PHASE (new round begins)
   ├── Map updated to reflect new game state
   ├── New round date shown in time navigation bar
   ├── Player can review events, chat, or check advisor
   └── Return to Plan Phase
```

### Round Duration
- Each round covers approximately **7 days** of in-game time
- Round 1: Dec 1–8, 1935
- Round 2: Dec 8–15, 1935 (estimated)
- Date displayed in top-right time navigation widget

---

## 8. World Map

### Map Type
- **2D political map** (default) — countries shown as colored regions with names
- **3D Globe** experimental mode available (toggle in hamburger menu)

### Map Controls
- **Pan**: Click and drag
- **Zoom**: Scroll wheel
- Map fills the full browser viewport (minus top nav bar)

### Visual Elements
- **Country fill colors**: Each nation has a distinct color fill
  - German Reich: Dark green/army green
  - Soviet Union: Dark red/maroon
  - Poland: Light purple/mauve
  - Czechoslovakia: Teal/dark cyan
  - Lithuania: Yellow-green
- **Country name text**: Large text overlaid on country territory
- **Region borders**: Internal sub-national borders shown as thin lines
- **City/feature markers**: Small square/star icons at cities and landmarks
  - Capital cities: ☆ star icon
  - Other cities: □ square icon
- **Military unit markers**: Diamond ◇ icons with unit names (e.g., "Polish Eastern Army")
- **Player nation flag**: Persistent bottom-right corner icon showing your nation's flag

### Clicking on Countries
Clicking a country on the map opens a **flag popup** showing:
- Country flag (large, centered)
- Country name + colored dot indicator
- Capital city name
- Two icon rows:
  - 📋 copy icon (copies name to clipboard) + ℹ️ info icon → opens full country panel
  - Same copy + info icons for capital city

---

## 9. Player Action Input System

The primary gameplay mechanic — submitting orders to your nation.

### Location
- Bottom-center of the screen (above bottom bar)
- Appears as a text input field when in the planning phase

### Action Input UI
- **Text area**: Multi-line free-form natural language input
- **Submit button**: Right side of input (arrow/send icon)
- **Lightning bolt button** (⚡): Quick-action mode
- Player can submit multiple actions (observed: 3 actions in Round 1)

### Action Format
Actions are written as free-form natural language orders, e.g.:
- "Send NKVD agents into Vilnius to stir unrest and prepare partisan uprising."
- "Begin industrialization of the Ural region and increase military production"
- "Establish diplomatic contact with Germany to probe their intentions"

### Action Constraints (from simulation rules)
- Player can ONLY give actions for their own polity
- Cannot directly control other nations' actions
- Can attempt diplomacy, threats, or war to influence others — but other nations will respond autonomously

### Brainstorm Feature
- A "Brainstorm" option (observed in earlier session) suggests AI-generated action ideas
- Prompts the AI to generate a list of possible actions based on current game state

---

## 10. Time Navigation & Round System

### Time Navigation Widget
- Location: Top-right area of the screen during gameplay
- Displays: `< [Date] >>`
- Format: `December 8th, 1935`
- **< arrow** (single): Navigate back to previous round
- **>> arrows** (double): Jump forward / advance turn

### Round States
- **Active round**: Current planning phase — player can submit actions
- **Past rounds**: Can navigate back to view events from earlier rounds (read-only)
- **Future rounds**: Only accessible after jumping forward

### Jumping Forward
- Clicking the `>>` button triggers the AI simulation
- Also accessible via the bottom-right action button during gameplay
- Costs tokens proportional to simulation complexity

### Rewinding
- From Event Manager: Each past round shows a "Reset to [Date]" button
- Allows the player to rewind to an earlier round and replay from that point
- This is both a QoL feature and potentially a way to try alternate strategies

---

## 11. Event Generation & Playback

### Event Structure
Each generated event consists of:
- **Date stamp** (e.g., "December 1st, 1935")
- **Nation flag** (identifies which nation the event belongs to)
- **Event title** (short descriptive heading)
- **Narrative text** (2-4 paragraphs of detailed AI-generated description)
- **🔊 Audio icon** — click to hear the event narrated aloud (text-to-speech)
- **Delete button** — remove this event

### Event Categories
1. **Player's events**: Direct results of player's submitted actions
2. **World reaction events**: How other nations respond to the player's actions
3. **Autonomous world events**: Things happening independently (Italy in Ethiopia, Japan in Manchuria, etc.)

### Observed Events from Round 1 (Soviet Union, Dec 1-8, 1935)
Events generated in response to 3 Soviet actions:

1. "NKVD Infiltration in Vilnius: Dec 1, 1935" — Soviet agents stir unrest in Lithuanian-held Vilnius
2. "Vilnius Raids: Dec 5, 1935" — Lithuanian police raid NKVD cells; partial disruption
3. "Soviet Industrialization Drive Begins: Dec 3, 1935" — Ural factories mobilized
4. "German Diplomatic Probe: Dec 6, 1935" — Germany responds to Soviet diplomatic contact with counter-accusations about military maneuvers
5. "Polish Mobilization Response: Dec 7, 1935" — Poland notices Soviet troop movements and alerts Eastern Army
6. "Lithuanian-Polish Coordination: Dec 7, 1935" — Lithuania and Poland coordinate on Vilnius situation
7. "Ural Factory Progress: Dec 7, 1935" — Industrial output growing but slowly

Total: **7 events** generated from **3 player actions**

### Event Playback UI
- Events appear in a right-side panel during playback
- Each event "slides in" with an animation
- Player can pause playback using the **Intervene** button
- Events scroll as new ones come in
- Navigation arrows `<` `>` at top of playback panel to scroll through events

---

## 12. Intervene Mechanic

A unique feature allowing mid-playback course correction.

### Trigger
- During event playback, a large red **"Intervene"** button appears prominently
- Button location: Below the event panel or inline with playback controls

### What It Does
- **Pauses** the event simulation mid-playback
- Allows the player to **submit new actions** in response to unfolding events
- The new actions are processed and added to the current round's event stream
- Effectively lets you react to events as they happen rather than waiting for the round to end

### Use Cases
- Your ally is being attacked and you want to immediately respond
- An unexpected event occurs and you want to redirect history
- You want to add a follow-up order to a successful early action

---

## 13. Diplomatic Chat System

AI-powered chat where players can conduct diplomacy with AI-controlled nations.

### Accessing Chat
- **Chat bubble icon** (💬) in the bottom-left corner
- Opens a chat interface

### Chat Interface
- Multi-nation group chats (e.g., "Soviet Union, German Reich" — shows which nations are in the chat)
- **Settings gear icon** for chat configuration
- Message input at bottom
- Chat history scrollable

### How It Works
- The AI roleplays as the other nation(s)
- Responses are **game-state aware** — the AI knows current diplomatic relations, military positions, recent events
- Observed exchange: Soviet Union probed Germany's intentions → Germany responded by counter-accusing Soviet troop movements and NKVD activities; signals mutual suspicion

### Chat in Event Manager
- Chats are logged in the Event Manager under the round they occurred in
- Each chat entry shows: nations involved + message count + delete button
- Chat data is fed to the AI as context for future event generation

### Chat Cost
- Starting a diplomatic chat costs tokens
- Each message exchange costs tokens

---

## 14. Advisor AI Panel

A dedicated AI assistant that provides strategic analysis and recommendations.

### Accessing Advisor
- **Advisor icon** (👤/person silhouette) in the right sidebar
- Also accessible via country info panel → "Advisor Report" button

### Panel Layout
The Advisor panel slides in from the right side and contains:

**Header**: "Advisor" title + X close button

**Report Card Sections** (scrollable):
1. **Title**: "[Nation] Status Report – [Date]" (e.g., "Soviet Union Status Report – 8 December 1935")
2. **Salutation**: "Comrade General Secretary," (adapts to the player's nation and leader type)
3. **Opening narrative**: Brief overview of world situation

**Intelligence Sections**:
- **Military Strength**: Your military capabilities and unit positions
- **Recent Moves**: Latest military activities of potential enemies
- **Estimate**: Assessment of relative military power vs neighbors

- **Key Global Players**: Brief status of major world powers (Germany, Poland, Italy, Japan, etc.)

- **Diplomatic Stance**: Current relations, specific incidents, recent exchanges with each key power

- **Strategic Assessment**:
  - **Risks**: What could go wrong with current strategy
  - **Projections**: Likely outcomes based on current trajectory
  - **Recommendations**: Specific, actionable strategic suggestions broken into categories:
    - **Military**: Troop movements, positioning, force-building
    - **Diplomacy**: Proposed negotiations, alliances, feints
    - **Homefront**: Economic/industrial development

**Closing**: In-character signature ("Your Loyal Advisor")

### Quick-Access Chips
Row of preset query chips below the report:
- "Game summary" — asks advisor to summarize current game state
- "Strategic advice" — asks for strategic recommendations
- Additional chips (partially visible, likely "Threats", "Opportunities", etc.)

### Free-Text Input
- "Ask your advisor..." text input at the bottom
- 🎤 microphone icon (voice input)
- Send button (arrow icon)
- Any typed question gets a full formatted response

### Advisor Response Format
Each response is a formatted **card** with:
- 🔊 Audio narration icon (top-right of card)
- Bold title heading
- Formal address salutation
- Structured bullet points
- In-character closing statement

### Advisor Context Awareness
The advisor demonstrably knows:
- Specific dates of recent events ("progress strong per 12/07")
- Names of military units and their positions ("South Group toward Brest")
- Current diplomatic tensions and specific diplomatic exchanges
- Economic projects in progress ("Ural factories")
- Other nations' strategies and movements

---

## 15. Event Manager (⌘E)

A full event log and management panel.

### Accessing
- Hamburger menu → **Events** (⌘E keyboard shortcut)

### Panel Layout

**Header**: "Event Manager" + "Consolidations" button + X close

**Round Timeline** (horizontal track at top):
- Each round shown as a numbered circle (1, 2, 3...)
- Between circles: event count badge (e.g., "7 Events")
- Below each circle: date (e.g., "Dec 1st, 1935") and stats ("0 Chats, 3 Actions")
- Currently selected round highlighted in blue
- Clicking a circle switches the view to that round

**Round Content** (scrollable):
For each selected round, three sections:

1. **Player Actions**
   - "Delete All Actions" button
   - Each action shown as a card:
     - Date tag (e.g., "December 1st, 1935") + 🔊 audio icon + Delete button
     - Nation name (bold)
     - Action text (the natural language order that was submitted)

2. **Chats**
   - "Delete All Chats" button
   - Each chat entry shows: "Nation A, Nation B" + message count + Delete button
   - "No chats in this round." if none

3. **Catalysts**
   - "Delete All Catalysts" button
   - Autonomous events not triggered by player actions
   - "No catalysts in this round." if none yet

**Past Round Reset**:
- Past rounds show a "Reset to [Date]" button at the top right of the round header
- Allows rewinding to any previous round

### Consolidations Button
Opens the "Event Consolidations" dialog — see Section 18.

---

## 16. Cheats Menu (⌘H)

A power-user / game-master panel for directly editing game state.

### Accessing
- Hamburger menu → **Cheats** (⌘H keyboard shortcut)

### Interface
- "Search cheats..." search bar at top
- List of cheat categories (each with a `>` arrow for sub-menu)

### Full Cheat List

| Cheat | Description |
|-------|-------------|
| **AI Model** | Configure AI model settings (which LLM is used) |
| **Master AI** | Full control over the game with AI assistance |
| **Your Country** | Change which country you're playing as (mid-game faction switch) |
| **Difficulty** | Adjust the game difficulty level |
| **Annex Country** | Click a country to annex it into another |
| **Annex Regions** | Click individual regions to transfer them to a country |
| **Edit Country** | Modify existing country properties |
| **Add Country** | Create a new country on the map |
| **Regions** | Edit region names, tags, and properties |
| **Edit Map Feature** | Edit existing map features like cities and landmarks |
| **Add Map Feature** | Create new map features with custom properties |
| **Clear Map Features** | Clean up old and irrelevant features |
| **Events** | Edit historical events and their descriptions |

### Key Insight: AI Model Cheat
The "AI Model" cheat suggests the game is **model-agnostic** — the underlying LLM can be swapped out or configured, pointing to a flexible AI backend.

---

## 17. Prompts & AI Architecture (⌘P)

The most architecturally revealing panel — exposes the full AI prompt system.

### Accessing
- Hamburger menu → **Prompts** (⌘P keyboard shortcut)

### Panel Title
"Edit Game Prompts and Rules – Round [N]"

The panel applies to the **current round** and contains two major sections:

---

### Section 1: Simulation Rules

**Description**: "Constraints and guidelines for the AI. Define allowed actions, limits, objectives, and any special mechanics."

**Editor**: Rich text editor with toolbar (undo/redo, bold, italic, link)

**Example content from the World War II preset**:
```
IF Operation Barbarossa Occurs, make sure Germany moves in a continuous front line,
and ensure not to miss regions in Ukraine and the Baltics, if Germany Makes it to
those regions, remember to transfer them.

In this game, Russian and Chinese regions have the same names and borders as most
modern day Oblasts, Provinces, and Administrative Divisions of Russia and China,
and Ukrainian Regions are unified in Central and South Ukraine, with more specific
regions in Northern Ukraine, pay special attention to the Baltics and Ukraine DURING
and IF an Invasion of Russia Happens.

Remember how regions works, in our game, many regions are small but some are the size
of the entire polity. If polities only own one region, that means the region itself is
every major territory the polity owns, and as such should be transferred only when the
entire region has been occupied by whichever polity is invading. For example, Ethiopia
has only one region: All of Ethiopia, so should it be invaded, the region should only
be transferred to the invader if all of Ethiopia has been occupied. But for Nations
like Russia and China, you must be very careful but not infrequent when doing the
region transfers.

The player has control over their own polity, and should be allowed to try whatever
they want, but they cannot make actions FOR other polities. They can attempt to
convince or reshape other polities by way of politics, diplomacy, or war, but they
cannot force other polities to go down specific paths. So the player IS their own
polity essentially.

If Fascist Italy occupies Ethiopia, as historical, then Italy will establish the
polity of "Italian East Africa"
```

**Key takeaways from simulation rules**:
- Rules address specific historical contingencies (Operation Barbarossa)
- Rules define the region transfer system (how territory changes hands)
- Rules enforce player constraints (can only play as their own polity)
- Rules can include scripted historical outcomes ("Italy → Italian East Africa")

---

### Section 2: AI Prompts

**Description**: "Edit individual AI prompts for different game mechanics."

**Format**: Grid of clickable cards, each representing an AI subsystem

| Card | Icon | Function |
|------|------|----------|
| **Chat with User** | 💬 | Prompt governing diplomatic chat responses |
| **Chat with Advisor** | 🧠 | Prompt governing Advisor panel responses |
| **Jump Forward** | 📅 | Prompt for event generation when advancing a turn |
| **Auto Jump Forward** | ⏩ | Prompt for auto-advancing variant |
| **Actions** | ⚡ | Prompt for processing player action inputs |
| **Next Speaker** | 🎤 | Prompt for selecting which nation speaks next in group chats |
| **Description to Action** | ✨ | Prompt for converting natural language to structured game action |
| **Event Consolidator** | 🧾 | Prompt for creating round summary consolidations |
| **Catalyst Creation** | 🔥 | Prompt for generating autonomous world events (catalysts) |
| **Catalyst Runner** | ⚙️ | Prompt for executing/running catalyst events |
| **Catalyst Summarizer** | 📝 | Prompt for summarizing catalyst event results |
| **Game Master** | 🎲 | Overall game master / orchestration prompt |

Each card is clickable and presumably opens that specific prompt for editing.

---

## 18. Event Consolidation System

A critical AI context management system that enables coherent long-running games.

### Problem Being Solved
LLMs have context window limits. After many rounds, all event history would overwhelm the AI's context window. Consolidations solve this by periodically summarizing past rounds into compact summaries.

### Consolidation Settings
- **Starts On Round**: 5 (consolidation first runs on round 5)
- **Chunk Size**: 4 (each consolidation covers 4 rounds)
- **Schedule**: Consolidations run on rounds 5, 9, 13, 17, 21...
- **Coverage**:
  - First consolidation (round 5): covers rounds 1–4
  - Second consolidation (round 9): covers rounds 5–8
  - And so on...

### Before Round 1 Context
There's a special pre-game context field:
> "Everything happened historically before the start date, with the exception of the player's polity, which COULD be a polity that doesn't historically exist at this time because the player has free reign to create a non-historical polity (only one) to play as, and that's it."

This establishes the historical baseline: everything before the game start date is treated as real history.

### Saved Consolidations
- After round 5, summaries appear in the "Saved Consolidations" section
- These summaries give the AI context about earlier rounds without raw event data
- Each consolidation covers its chunk of rounds in a condensed narrative

---

## 19. Hamburger Menu — Full Contents

The `≡` hamburger button (top-left, in-game) opens a slide-out menu:

| Item | Notes |
|------|-------|
| **[Preset Name]** (e.g., "World War II") | Shown in red; identifies the current scenario |
| "Playing as [Nation]" | Shows current faction |
| **User Settings** | Account/profile settings |
| **Tutorial** | Game tutorial overlay |
| **Events** (⌘E) | Opens Event Manager |
| **Cheats** (⌘H) | Opens Cheats panel |
| **Prompts** (⌘P) | Opens Prompts/AI editor |
| **3D Globe** (Experimental) | Toggle switch — switches map from 2D to 3D globe view |
| **Report Bug** (⌘B) | Bug reporting |
| **Duplicate Game** | Creates a copy of the current game |
| **Discord** | Opens Discord community link |
| **Wiki** | Opens game wiki (note: wiki.gg — currently private/unauthorized) |

---

## 20. Map Entity System

Dynamic entities that appear on the map based on game events.

### Military Units
- Shown as **◇ diamond markers** with label text
- Examples observed:
  - "Polish Eastern Army" (in eastern Poland)
  - "Minsk" marker (Soviet unit near Minsk)
- Units created by AI when player actions or world events involve military movements
- Position on map corresponds to geographic location

### Geographic Features
- **Capital cities**: ☆ star icons
  - Warsaw (Poland), Berlin (Germany), Prague (Czechoslovakia)
- **Other cities**: □ square icons
  - Königsberg, Gdańsk, Stettin, Leipzig, Łódź, Poznań, Breslau, Krakow, Katowice, Brest-Litovsk, Lwów, Lublin, Ostrava
- **Map labels**: Country/region names overlaid on territory

---

## 21. Country Info Panel

Accessed by clicking a country flag popup → ℹ️ info button.

### Panel Tabs/Sections
The country panel is a full-height right sidebar with multiple sections:

**Header**: Country flag + name + close button

**Related Events** tab/section:
- Lists events that involved this country
- Each event shows date, brief description, clickable to expand

**Advisor Report** button/section:
- Opens the Advisor panel pre-populated with analysis of this specific country
- Advisor contextualizes the country from the player's strategic perspective

**Open Diplomacy** button/section:
- Opens a diplomatic chat with the selected country
- Creates a new chat session between player's nation and selected country

---

## 22. Bottom Bar Controls

Fixed controls at the bottom of the game screen.

### Bottom-Left Cluster
| Icon | Function |
|------|----------|
| 💬 Chat bubble | Opens diplomatic chat interface |
| ⚡ Lightning bolt | Quick action / brainstorm trigger |
| 🔍 Magnifying glass | Search function (nations, events, etc.) |

### Bottom-Right
| Element | Function |
|---------|----------|
| Nation flag icon | Shows player's current nation; possibly opens own country panel |

---

## 23. Token Cost Reference

Approximate token costs observed during session:

| Action | Estimated Cost |
|--------|---------------|
| Start new game | ? |
| Submit player action(s) | ~$0.004–0.010 per action set |
| Jump Forward (generate events) | ~$0.010–0.020 |
| Diplomatic chat message | ~$0.002–0.005 per exchange |
| Advisor query | ~$0.004 per query |
| Starting balance | $1.000 |

*Note: Actual costs vary with response length and model used.*

---

## 24. AI Pipeline Architecture Summary

Based on the Prompts panel, the game uses at least **12 distinct AI subsystems**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PAX HISTORIA AI PIPELINE                  │
└─────────────────────────────────────────────────────────────┘

INPUT PROCESSING
├── Actions Prompt: Parses player natural language → structured actions
└── Description to Action: Converts narrative descriptions to game actions

SIMULATION ENGINE
├── Jump Forward Prompt: Generates events for a turn advance
├── Auto Jump Forward: Automated turn advance variant
├── Catalyst Creation: Generates autonomous world events
├── Catalyst Runner: Executes catalyst events
└── Catalyst Summarizer: Summarizes catalyst results

CONTEXT MANAGEMENT
├── Event Consolidator: Summarizes past rounds for AI context
└── [Before Round 1 Context]: Historical baseline prompt

INTERACTION SYSTEMS
├── Chat with User: Diplomatic chat responses
├── Chat with Advisor: Advisor panel AI responses
└── Next Speaker: Multi-party chat turn selection

ORCHESTRATION
└── Game Master: Top-level game state management

CONFIGURATION
└── Simulation Rules: Custom constraints and scenario rules (editable rich text)
```

### AI Context Chain (per round)
When the AI generates events for a round, it likely receives:
1. **Before Round 1 Context** (historical baseline)
2. **Saved Consolidations** (summaries of rounds 1 to N-chunk)
3. **Recent raw events** (last chunk of rounds)
4. **Current round's player actions**
5. **Simulation Rules** (scenario constraints)
6. **[Game Master prompt]** (orchestration instructions)

---

## 25. Data Structures & Schema Inferences

### Game Object
```json
{
  "id": "1bbf0821-adcc-4b45-9006-15669c777910",
  "preset": "World War II",
  "player_polity": "Soviet Union",
  "current_round": 2,
  "current_date": "1935-12-08",
  "start_date": "1935-12-01",
  "simulation_rules": "...",
  "consolidations": [],
  "before_round_1_context": "..."
}
```

### Round Object
```json
{
  "round_number": 1,
  "start_date": "1935-12-01",
  "end_date": "1935-12-08",
  "player_actions": [],
  "chats": [],
  "catalysts": [],
  "generated_events": [],
  "event_count": 7
}
```

### Player Action Object
```json
{
  "date": "1935-12-01",
  "polity": "Soviet Union",
  "text": "Send NKVD agents into Vilnius to stir unrest and prepare partisan uprising.",
  "audio_url": "..."
}
```

### Generated Event Object
```json
{
  "date": "1935-12-05",
  "title": "Vilnius Raids",
  "polity": "Lithuania",
  "narrative": "...",
  "audio_url": "...",
  "type": "reaction"
}
```

### Chat Object
```json
{
  "id": "...",
  "round": 2,
  "participants": ["Soviet Union", "German Reich"],
  "messages": [
    {
      "sender": "Soviet Union",
      "text": "...",
      "timestamp": "..."
    }
  ]
}
```

### Polity Object (inferred)
```json
{
  "name": "Soviet Union",
  "flag": "...",
  "color": "#8B0000",
  "capital": "Moscow",
  "regions": ["..."],
  "is_player": true,
  "military_units": ["..."]
}
```

### Region Object (inferred)
```json
{
  "id": "...",
  "name": "Ukraine (South)",
  "owner_polity": "Soviet Union",
  "tags": ["eastern_front", "industrial"],
  "borders": ["..."]
}
```

---

## 26. Technical & Implementation Notes

### Stack Inference
- **Frontend**: React/Next.js (SPA with client-side routing; URL structure: `/game/[game-id]?round=[n]`)
- **Map**: Custom SVG/Canvas or MapBox-style renderer with political boundary data
- **Backend**: REST API or GraphQL + WebSocket for real-time event streaming
- **AI**: LLM API (likely Anthropic Claude or OpenAI GPT-4; "AI Model" cheat suggests configurable)
- **Auth**: JWT-based authentication
- **Storage**: PostgreSQL or similar for game state; blob storage for audio files

### URL Structure
```
paxhistoria.co/game/{uuid}?round={number}
```

### Key Replication Components

To build an alternate version, you need:

1. **World Map Renderer**
   - SVG or Canvas-based political map
   - Country borders with region sub-divisions
   - Clickable country polygons
   - Dynamic color fills per polity
   - City/unit marker overlay system

2. **AI Simulation Engine**
   - LLM integration (Claude/GPT-4 recommended)
   - System prompt builder that includes: simulation rules + consolidations + recent events + player actions
   - JSON output parser to extract: territory changes, unit movements, new events
   - Event narration generator

3. **Round Manager**
   - Round state machine (planning → simulating → playback → review)
   - Event queue and playback system
   - Consolidation scheduler (every N rounds, summarize prior rounds)

4. **Game State Store**
   - Per-polity ownership of regions
   - Military unit positions
   - Diplomatic relations matrix
   - Event history log

5. **Chat System**
   - Multi-party chat UI
   - AI roleplay backend (per-nation personality prompts)
   - Game-state injection into chat context

6. **Advisor System**
   - Separate AI prompt with access to full game state
   - Structured response parser (Military / Diplomacy / Homefront sections)

7. **Token/Credit Economy**
   - Per-request cost tracking
   - Balance display and deduction
   - Optional: crowdsourced rating system for earning credits

8. **Prompt Management**
   - Per-round prompt editor (rich text)
   - Per-module AI prompt configuration
   - Preset system with bundled simulation rules

### Suggested AI Prompt Architecture for Replication

```
SYSTEM PROMPT = [
  Game Master Instructions,
  Simulation Rules (user-editable),
  Before Round 1 Context (historical baseline),
  World State Summary (from consolidations),
]

USER TURN = [
  Recent Events (last N rounds raw),
  Current Round Player Actions,
  "Generate events for this round as JSON: {schema}"
]
```

The AI response should be a structured JSON with:
- Array of events (date, polity, title, text)
- Array of territory changes (region, from_polity, to_polity)
- Array of unit movements (unit_name, from, to)
- Array of new catalysts (for next round)

---

## Quick-Reference: UI Element Inventory

| Element | Location | Shortcut/Access |
|---------|----------|-----------------|
| Token balance | Top-right nav | Always visible |
| Games list | Top nav | Click "Games" |
| Presets browser | Top nav | Click "Presets" |
| Hamburger menu | Top-left (in-game) | Click ≡ |
| Event Manager | Hamburger | ⌘E |
| Cheats panel | Hamburger | ⌘H |
| Prompts editor | Hamburger | ⌘P |
| Report bug | Hamburger | ⌘B |
| 3D Globe toggle | Hamburger | Toggle switch |
| Duplicate Game | Hamburger | Click |
| Diplomatic chat | Bottom-left | 💬 icon |
| Quick action | Bottom-left | ⚡ icon |
| Search | Bottom-left | 🔍 icon |
| Player flag | Bottom-right | Always visible |
| Time navigation | Top-right (in-game) | `<` `>>` arrows |
| Advisor panel | Right sidebar | Country panel → "Advisor Report" |
| Country popup | On map | Click country |
| Country info panel | Via country popup | Click ℹ️ icon |

---

*Notes compiled from live gameplay session. Game is actively developed; UI may change.*
*Session: World War II preset, Soviet Union faction, Rounds 1-2, December 1935.*

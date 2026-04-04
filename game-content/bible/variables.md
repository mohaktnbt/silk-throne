# The Silk Throne -- Variable Bible

Complete reference for every `*create` declaration in startup.txt. This document defines all global variables, their starting values, modification guidelines, and usage notes.

Writers must consult this document before modifying any variable. All variable names use snake_case. All `*create` declarations appear only in startup.txt.

---

## Variable Naming Conventions

| Prefix | Type | Example |
|---|---|---|
| `player_` | Player identity | `player_name` |
| `rel_` | NPC relationship | `rel_emperor` |
| `rep_` | Faction reputation | `rep_military` |
| `romance_` | Romance flag/state | `romance_leila` |
| `has_` / `met_` / `found_` / `discovered_` | Boolean plot flag | `has_met_emperor` |
| `scene_` | Scene-specific tracking | `scene5_visited_garden` |
| No prefix | Core stat or general | `strength`, `gold`, `route` |

---

## PLAYER IDENTITY VARIABLES

These are set during Scene 1 (character creation) and referenced throughout.

```
*create player_name "Unknown"
*create gender "unknown"
```

### Pronoun Set

All default to non-binary. Set via `*gosub_scene sub setup_pronouns` after gender selection.

```
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
*create title_honorific "Mx."
*create person "person"
*create child "child"
```

**Usage in prose:**
```
${they} walked into the room and removed ${their} coat.
"Is that ${theirs}?" the guard asked.
${theyre} not sure what to make of it.
The ${person} stood ${their} ground.
```

### Player Background

```
*create player_origin "provincial"
*create player_background 0
```

`player_background` values:
- 0 = not yet chosen
- 1 = Scholar (bonus to scholarship)
- 2 = Soldier (bonus to strength)
- 3 = Merchant (bonus to cunning)
- 4 = Diplomat (bonus to diplomacy)

---

## PERSONALITY AXES (Opposed Pairs)

Each axis runs from 0 to 100, starting at 50 (neutral). The named variable represents the "left" trait; the "right" trait is implicit (100 minus the value). Modified exclusively with fairmath operators (`%+` and `%-`).

```
*create boldness 50
*create ruthless 50
*create honest 50
*create idealist 50
```

### Axis Definitions

| Variable | Left (High) | Right (Low) | What It Tracks |
|---|---|---|---|
| `boldness` | Bold (100) | Cautious (0) | Risk tolerance, assertiveness, willingness to act without full information |
| `ruthless` | Ruthless (100) | Compassionate (0) | Willingness to sacrifice others for goals, pragmatic cruelty vs. empathy |
| `honest` | Honest (100) | Deceptive (0) | Communication style, transparency vs. manipulation |
| `idealist` | Idealist (100) | Pragmatist (0) | Principled adherence to values vs. flexible compromise |

### Modification Guidelines (Fairmath)

| Situation | Amount | Example |
|---|---|---|
| Minor dialogue choice (tone, phrasing) | `%+ 5` / `%- 5` | Choosing a polite vs. blunt greeting |
| Significant action with consequences | `%+ 10` / `%- 10` | Choosing to spare or punish a criminal |
| Pivotal, character-defining moment | `%+ 15` / `%- 15` | Betraying a trusted ally, or sacrificing yourself for another |
| Rare, extreme action | `%+ 20` / `%- 20` | Only for the most dramatic moments (2-3 per game max) |

### Gameplay Effects

**Flavor text thresholds:**
- 0-20: Extreme right trait. Text reflects this strongly.
- 21-40: Leaning right. Subtle behavioral differences.
- 41-60: Balanced/neutral. Generic descriptions.
- 61-80: Leaning left. Subtle behavioral differences.
- 81-100: Extreme left trait. Text reflects this strongly.

**Choice gating:**
- Use `*selectable_if (boldness > 60)` for bold-locked options
- Use `*selectable_if (boldness < 40)` for cautious-locked options
- The 40-60 middle range should never be gated (too many players will be there)

**Stat screen display:**
```
*stat_chart
  opposed_pair boldness
    Bold
    Cautious
  opposed_pair ruthless
    Ruthless
    Compassionate
  opposed_pair honest
    Honest
    Deceptive
  opposed_pair idealist
    Idealist
    Pragmatist
```

---

## SKILLS (0-100)

Skills represent the player's competence in specific areas. Modified with plain arithmetic (NOT fairmath). Starting values are set by background choice in Scene 1.

```
*create strength 20
*create cunning 20
*create diplomacy 20
*create scholarship 20
```

### Skill Definitions

| Skill | What It Represents | Used For |
|---|---|---|
| `strength` | Physical capability, combat, intimidation | Fighting, physical challenges, commanding respect through force |
| `cunning` | Street smarts, deception, reading people | Detecting lies, manipulation, navigating the underworld |
| `diplomacy` | Social grace, persuasion, negotiation | Convincing NPCs, resolving disputes, court etiquette |
| `scholarship` | Book learning, analysis, historical knowledge | Decoding messages, understanding law, identifying poisons |

### Starting Values by Background

| Background | strength | cunning | diplomacy | scholarship |
|---|---|---|---|---|
| Scholar | 20 | 25 | 25 | 40 |
| Soldier | 40 | 20 | 20 | 25 |
| Merchant | 20 | 40 | 25 | 20 |
| Diplomat | 20 | 25 | 40 | 25 |

### Modification Guidelines (Plain Arithmetic)

| Source | Amount | Example |
|---|---|---|
| Hub scene training | `+ 5` | Sparring with Navid increases strength |
| Successful skill use | `+ 3` | Picking a lock successfully increases cunning |
| Story event | `+ 5` to `+ 10` | Extended study in the library increases scholarship |
| Major accomplishment | `+ 10` to `+ 15` | Rare, 2-3 per game |

### Skill Check Thresholds

| Difficulty | Threshold | Context |
|---|---|---|
| Easy | 25 | Most players can pass with minimal investment |
| Moderate | 40 | Requires some investment in the skill |
| Hard | 55 | Requires significant investment or background bonus |
| Very Hard | 70 | Requires focused investment across multiple scenes |
| Near-Impossible | 85 | Should be achievable only for specialized builds |

**Implementation:**
```
*if (strength > 55)
  You overpower the guard and force the door.
  *set strength + 3
  *goto success
*else
  The guard is too strong. You're thrown back.
  *goto failure
```

Use `*selectable_if` for visible skill gates:
```
*selectable_if (scholarship > 40) #Translate the ancient text. [Requires Scholarship 40+]
```

---

## FACTION REPUTATION (0-100)

Reputation with each of the five factions. Modified with fairmath. Starting values reflect the player's outsider status -- no faction fully trusts them yet.

```
*create rep_military 25
*create rep_trade 30
*create rep_temple 30
*create rep_intelligence 20
*create rep_nobility 25
```

### Faction Definitions

| Variable | Faction | Leader | What It Represents |
|---|---|---|---|
| `rep_military` | The Army | General Kadir | How the military establishment views you: competent leader or civilian meddler |
| `rep_trade` | The Guilds | Guildmaster Priya | How the merchant class views you: ally of commerce or obstacle to profit |
| `rep_temple` | The Temple | High Priest Ashoka | How the religious establishment views you: pious supporter or secular threat |
| `rep_intelligence` | The Eyes | Spymaster Zara | How the spy network views you: trustworthy partner or security risk |
| `rep_nobility` | The Nobility | (Vacant) | How the noble houses view you: respectful of tradition or dangerous upstart |

### Modification Guidelines (Fairmath)

| Action | Amount | Example |
|---|---|---|
| Supporting faction's position in council | `%+ 5` to `%+ 8` | Voting with the military on border funding |
| Completing a task for the faction | `%+ 10` to `%+ 15` | Resolving the trade embargo in Priya's favor |
| Opposing the faction's position | `%- 5` to `%- 10` | Cutting temple funding |
| Betraying the faction | `%- 15` to `%- 25` | Exposing military corruption |

### Reputation Thresholds

| Range | Meaning | Gameplay Effect |
|---|---|---|
| 0-15 | Hostile | Faction actively works against you. Locked out of faction-specific options. |
| 16-30 | Distrustful | Faction cooperates minimally. Some options locked. |
| 31-50 | Neutral | Faction cooperates professionally. Standard options available. |
| 51-70 | Friendly | Faction supports you. Bonus options available. Faction-specific intel. |
| 71-85 | Allied | Faction is a strong ally. Can call in major favors. |
| 86-100 | Devoted | Faction is completely loyal. Will sacrifice for you in the endgame. |

### Faction Tension System

Raising one faction's reputation often lowers another's. Key rivalries:
- Military vs. Trade (funding allocation)
- Temple vs. Intelligence (moral authority vs. pragmatic spying)
- Nobility vs. Trade (old money vs. new money)
- Military vs. Nobility (merit vs. birth)

When a scene involves faction conflict, the standard pattern is:
```
*set rep_military %+ 10
*set rep_trade %- 5
```

---

## NPC RELATIONSHIPS (0-100)

Individual relationship scores with major NPCs. Modified with fairmath. These are independent of faction reputation -- you can have a high personal relationship with a faction leader while having low faction reputation (they like you personally but their faction doesn't trust your agenda).

### Inner Circle

```
*create rel_emperor 40
*create rel_dowager 30
*create rel_general 25
*create rel_guild 30
*create rel_priest 35
*create rel_spy 20
*create rel_farid 50
```

**Starting value rationale:**
- `rel_emperor 40` -- The Emperor is hopeful about the new Vizier but cautious
- `rel_dowager 30` -- She chose you, but she doesn't trust you yet
- `rel_general 25` -- He distrusts all civilians; you start from a deficit
- `rel_guild 30` -- She's open to working with you, watchful
- `rel_priest 35` -- He gives everyone the benefit of the doubt initially
- `rel_spy 20` -- She trusts no one; you start at the bottom
- `rel_farid 50` -- He's loyal from the start; this reflects existing goodwill

### Romance Options

```
*create rel_leila 20
*create rel_navid 20
*create rel_asha 20
```

All romance options start at 20 (new acquaintance). Romance requires reaching at least 60 for the relationship to become romantic.

### Minor NPCs (tracked for key interactions)

```
*create rel_reza 20
*create rel_soraya 25
*create rel_kaveh 30
*create rel_darius 30
*create rel_chen 25
```

### Modification Guidelines (Fairmath)

| Interaction Type | Amount | Example |
|---|---|---|
| Agreeing with their viewpoint | `%+ 5` | Siding with the Emperor in a debate |
| Meaningful personal conversation | `%+ 8` to `%+ 12` | Hub scene heart-to-heart |
| Helping with a personal problem | `%+ 10` to `%+ 15` | Protecting the Emperor during the assassination attempt |
| Romance-specific positive moment | `%+ 12` to `%+ 15` | Shared intimate moment with Leila |
| Minor disagreement | `%- 5` | Questioning a council member's proposal politely |
| Opposing them in a major decision | `%- 10` to `%- 15` | Voting against their faction in council |
| Betrayal | `%- 20` to `%- 30` | Exposing their secrets, working against them deliberately |

### Relationship Thresholds

| Range | Status | NPC Behavior |
|---|---|---|
| 0-15 | Hostile | NPC works against you. May betray you in Act 3. |
| 16-30 | Cold | Minimal cooperation. Terse dialogue. |
| 31-50 | Professional | Standard cooperation. Neutral dialogue. |
| 51-65 | Warm | Friendly dialogue. Will share information. Support in council votes. |
| 66-80 | Close | Strong ally. Personal conversations unlock. Will take risks for you. |
| 81-100 | Devoted | Will sacrifice for you. Loyalty in endgame. Best ending variants. |

### Romance Thresholds

| Range | Romance State | What Happens |
|---|---|---|
| < 40 | Not available | Romance options do not appear |
| 40-59 | Flirtation possible | Light flirtation options appear if romance flag is true |
| 60-74 | Romance developing | Romantic scenes unlock. Relationship acknowledged. |
| 75-89 | Deep romance | Intimate scenes. Partner provides unique support in Act 3. |
| 90-100 | True love | Best romance ending. Partner's fate is central to epilogue. |

---

## ROMANCE FLAGS

Boolean flags tracking whether the player has initiated a romantic path with each option. Only one romance can be active at a time (enforced by `romance_active`).

```
*create romance_leila false
*create romance_navid false
*create romance_asha false
*create romance_active false
```

### Romance Initiation Logic

When the player chooses a romantic option for the first time:
```
*if (not(romance_active))
  *set romance_leila true
  *set romance_active true
*else
  *comment Already in a romance -- this option should not appear
  *bug Romance option shown while romance_active is true
```

### Romance Gate Pattern

Use this pattern when presenting romance-specific content:
```
*if ((romance_leila) and (rel_leila > 60))
  #Take Leila's hand.
    *set rel_leila %+ 12
    *goto leila_romantic_scene
```

---

## PLOT FLAGS

Boolean flags tracking major story events. All start false. Once set to true, they should never be set back to false.

### Meeting Flags

Track whether the player has met key NPCs (set during first encounters):

```
*create has_met_emperor false
*create has_met_dowager false
*create met_general false
*create met_guild false
*create met_priest false
*create met_spy false
*create met_leila false
*create met_navid false
*create met_asha false
*create met_kaveh false
```

### Murder Mystery Flags

Track the player's progress investigating the predecessor's death:

```
*create predecessor_murder_known false
*create discovered_poison false
*create found_letter false
*create identified_poison_type false
*create met_yusuf false
*create traced_poison_source false
*create suspect_dowager false
*create suspect_kaveh false
*create suspect_reza false
*create knows_ghost_identity false
```

### Exploration and Discovery Flags

```
*create secret_passage_found false
*create tower_of_stars_visited false
*create old_city_visited false
*create library_secret_found false
*create hidden_treasury_found false
```

### Route and Major Decision Flags

```
*create route 0
```

Route values:
- 0 = Not yet chosen (Acts 1)
- 1 = Loyalist (support the Emperor's independent rule)
- 2 = Kingmaker (seize power behind the throne)
- 3 = Revolutionary (reform the empire from within)

```
*create alliance_sealed false
*create betrayal_committed false
*create rebellion_started false
*create reforms_enacted false
*create emperor_confronted false
*create dowager_confronted false
```

### Act 2 Progression Flags

```
*create act2_chapter 0
*create midpoint_betrayer 0
```

`midpoint_betrayer` values:
- 0 = not yet determined
- 1 = General Kadir betrays
- 2 = Guildmaster Priya betrays
- 3 = High Priest Ashoka betrays
- 4 = Spymaster Zara is betrayed (by conspiracy)
- 5 = Secretary Farid compromised (unwitting)

```
*create survived_midpoint_betrayal false
*create recovered_from_betrayal false
*create identified_true_enemy false
```

### Act 3 Progression Flags

```
*create conspiracy_revealed false
*create final_alliance_military false
*create final_alliance_trade false
*create final_alliance_temple false
*create final_alliance_intelligence false
*create final_alliance_nobility false
*create siege_outcome 0
```

`siege_outcome` values:
- 0 = not yet determined
- 1 = victory by force
- 2 = victory by negotiation
- 3 = victory by cunning
- 4 = pyrrhic victory
- 5 = defeat

```
*create throne_room_choice 0
```

`throne_room_choice` values:
- 0 = not yet determined
- 1 = Claim the throne
- 2 = Defend the emperor's rule
- 3 = Abolish the throne
- 4 = Compromise/reform
- 5 = Walk away

### Scene-Specific Decision Tracking

```
*create scene3_crisis_response 0
```
Values: 0=unresolved, 1=military response, 2=diplomatic response, 3=intelligence response

```
*create scene6_embargo_result 0
```
Values: 0=unresolved, 1=broke embargo by force, 2=negotiated end, 3=found compromise, 4=embargo continues

```
*create scene7_assassination_result 0
```
Values: 0=unresolved, 1=stopped assassin personally, 2=guards stopped assassin, 3=emperor injured, 4=someone else injured

```
*create festival_event 0
```
Values: 0=unresolved, 1=peaceful celebration, 2=disrupted by attack, 3=used for political move

---

## RESOURCE VARIABLES

### Gold

```
*create gold 100
```

Starting gold represents a modest personal fund. Modified with plain arithmetic. Used for bribes, purchases, and gifts.

**Modification guidelines:**
- Salary payment (received at act transitions): `+ 50` to `+ 100`
- Bribe cost: `- 20` to `- 50`
- Major purchase: `- 30` to `- 100`
- Gift to NPC: `- 10` to `- 30` (also increases relationship)
- Successful trade deal: `+ 20` to `+ 50`

### Conversation Counters

Track how many times the player has spoken to key NPCs (for hub scene dialogue depth):

```
*create conv_emperor 0
*create conv_dowager 0
*create conv_general 0
*create conv_guild 0
*create conv_priest 0
*create conv_spy 0
*create conv_farid 0
*create conv_leila 0
*create conv_navid 0
*create conv_asha 0
```

Increment by 1 each time the player has a hub scene conversation with the NPC. Higher values unlock deeper dialogue.

### Evidence Counter

```
*create evidence_count 0
```

Tracks how many pieces of evidence the player has found regarding the conspiracy. Used to gate investigation scenes.

- 0-2: Limited understanding. Cannot confront anyone.
- 3-5: Partial picture. Can make accusations but they may be wrong.
- 6-8: Clear picture. Can identify the conspiracy network.
- 9+: Complete evidence. Can prove the conspiracy publicly.

---

## ENDING VARIABLES

Variables that determine which of the 15 endings the player receives.

```
*create ending_type 0
*create heir_alive true
*create empire_intact true
*create player_alive true
*create love_fulfilled false
```

### Ending Type Values

| Value | Ending Name | Route | Requirements |
|---|---|---|---|
| 1 | The Golden Age | Loyalist | heir_alive, empire_intact, rel_emperor > 70 |
| 2 | The Iron Throne | Loyalist | heir_alive, empire_intact, rel_emperor 40-70 |
| 3 | The Fallen Crown | Loyalist | heir_alive = false OR empire_intact = false |
| 4 | The Broken Oath | Loyalist | betrayal_committed, rel_emperor < 40 |
| 5 | The Shadow Emperor | Kingmaker | empire_intact, rel_emperor > 50 |
| 6 | The Puppet Master | Kingmaker | empire_intact, rel_emperor < 50 |
| 7 | The Tyrant | Kingmaker | ruthless > 70, betrayal_committed |
| 8 | The Usurper's Fall | Kingmaker | conspiracy_revealed, player exposed |
| 9 | The New Dawn | Revolutionary | reforms_enacted, empire_intact |
| 10 | The People's Vizier | Revolutionary | reforms_enacted, idealist > 65 |
| 11 | The Burning Throne | Revolutionary | rebellion_started, empire_intact = false |
| 12 | The Martyr | Revolutionary | player_alive = false, reforms_enacted |
| 13 | The Exile | Any | Walked away from power |
| 14 | The Eternal Flame | Any | Hidden ending -- requires specific temple quest |
| 15 | The Last Poem | Any | Hidden ending -- requires romance with Leila + specific choices |

### Ending Determination Logic

The ending is calculated in Scene 30 using the Ending Gate Pattern:

```
*comment Pseudocode for ending determination
*label determine_ending

*comment Check for hidden endings first
*if ((romance_leila) and (rel_leila > 90) and (found_last_poem))
  *set ending_type 15
  *goto_scene epilogue

*if ((rep_temple > 85) and (eternal_flame_quest_complete))
  *set ending_type 14
  *goto_scene epilogue

*comment Route-specific endings
*if (route = 1)
  *comment Loyalist endings
  *if ((heir_alive) and (empire_intact) and (rel_emperor > 70))
    *set ending_type 1
  *elseif ((heir_alive) and (empire_intact))
    *set ending_type 2
  *elseif (betrayal_committed)
    *set ending_type 4
  *else
    *set ending_type 3

*comment ... (continue for routes 2 and 3)

*comment Universal fallback
*if (ending_type = 0)
  *set ending_type 13

*goto_scene epilogue
```

---

## ACHIEVEMENT VARIABLES

Achievements are defined with `*achievement` in startup.txt. Points must total exactly 1000.

### Major Achievements (100 points each -- 4 total = 400 points)

```
*achievement golden_age visible 100 The Golden Age
  The empire awaits its greatest era.
  You ushered in a golden age of peace and prosperity under Emperor Roshan IV.

*achievement shadow_emperor visible 100 The Shadow Emperor
  Power has many forms.
  You became the true ruler of the Khazaran Empire, governing from behind the throne.

*achievement new_dawn visible 100 The New Dawn
  The old order trembles.
  You reformed the Khazaran Empire, creating a new system of governance for all its people.

*achievement eternal_flame_ending hidden 100 The Eternal Flame
  ???
  You unlocked the secret of the Eternal Flame and transcended mortal politics.
```

### Standard Achievements (50 points each -- 6 total = 300 points)

```
*achievement conspiracy_unveiled visible 50 The Truth Unveiled
  Shadows hide many secrets.
  You uncovered the full conspiracy threatening the Khazaran Empire.

*achievement true_love visible 50 True Love
  The heart wants what it wants.
  You found lasting love amid the chaos of imperial politics.

*achievement master_diplomat visible 50 Master Diplomat
  Words are the sharpest weapons.
  You resolved three or more major crises through diplomacy alone.

*achievement spymaster_ally visible 50 Trust No One
  Except, perhaps, one person.
  You earned the complete trust of Spymaster Zara.

*achievement five_factions visible 50 Balance of Power
  All factions serve the throne.
  You achieved allied status with all five factions simultaneously.

*achievement last_poem hidden 50 The Last Poem
  ???
  You discovered the meaning of Leila's father's final poem.
```

### Minor Achievements (25 points each -- 12 total = 300 points)

```
*achievement first_council visible 25 Voice of the Throne
  Your first council meeting awaits.
  You survived your first Council of Five meeting.

*achievement poison_expert visible 25 Poison Expert
  Knowledge is power -- even deadly knowledge.
  You identified the poison used on your predecessor.

*achievement secret_passage visible 25 Hidden Ways
  The palace has more doors than you think.
  You discovered the secret passage in the Citadel.

*achievement star_reader hidden 25 Star Reader
  ???
  You deciphered the astronomical code in the conspiracy's messages.

*achievement old_city_survivor visible 25 Streets of Shadow
  The Old City has its own rules.
  You survived a dangerous encounter in the Old City.

*achievement poetry_duel visible 25 War of Words
  The pen is mightier.
  You won a poetry duel at the Imperial Court.

*achievement saved_emperor visible 25 The Shield
  The Emperor's life is in your hands.
  You personally saved Emperor Roshan from the assassination attempt.

*achievement merchant_prince visible 25 Merchant Prince
  Gold opens every door.
  You accumulated over 500 gold through trade and shrewd dealing.

*achievement warrior_vizier hidden 25 Warrior Vizier
  ???
  You defeated Captain Navid in a sparring match.

*achievement seven_wisdoms hidden 25 The Seventh Wisdom
  ???
  You debated all Seven Wisdoms with Asha and reached a new understanding.

*achievement ghost_unmasked visible 25 Ghost Unmasked
  Every shadow has a source.
  You discovered the true identity of the assassin known as the Ghost.

*achievement peoples_champion hidden 25 People's Champion
  ???
  You improved the lives of Khazara's common people through three or more reforms.
```

**Points total:** 400 (major) + 300 (standard) + 300 (minor) = 1000

---

## COMPLETE *CREATE BLOCK

The following is the complete, ordered list of all `*create` declarations for startup.txt:

```choicescript
*comment === PLAYER IDENTITY ===
*create player_name "Unknown"
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
*create title_honorific "Mx."
*create person "person"
*create child "child"
*create player_origin "provincial"
*create player_background 0

*comment === PERSONALITY AXES (fairmath, start 50) ===
*create boldness 50
*create ruthless 50
*create honest 50
*create idealist 50

*comment === SKILLS (arithmetic, start 20) ===
*create strength 20
*create cunning 20
*create diplomacy 20
*create scholarship 20

*comment === FACTION REPUTATION (fairmath) ===
*create rep_military 25
*create rep_trade 30
*create rep_temple 30
*create rep_intelligence 20
*create rep_nobility 25

*comment === NPC RELATIONSHIPS (fairmath) ===
*create rel_emperor 40
*create rel_dowager 30
*create rel_general 25
*create rel_guild 30
*create rel_priest 35
*create rel_spy 20
*create rel_farid 50
*create rel_leila 20
*create rel_navid 20
*create rel_asha 20
*create rel_reza 20
*create rel_soraya 25
*create rel_kaveh 30
*create rel_darius 30
*create rel_chen 25

*comment === ROMANCE FLAGS ===
*create romance_leila false
*create romance_navid false
*create romance_asha false
*create romance_active false

*comment === MEETING FLAGS ===
*create has_met_emperor false
*create has_met_dowager false
*create met_general false
*create met_guild false
*create met_priest false
*create met_spy false
*create met_leila false
*create met_navid false
*create met_asha false
*create met_kaveh false

*comment === MURDER MYSTERY FLAGS ===
*create predecessor_murder_known false
*create discovered_poison false
*create found_letter false
*create identified_poison_type false
*create met_yusuf false
*create traced_poison_source false
*create suspect_dowager false
*create suspect_kaveh false
*create suspect_reza false
*create knows_ghost_identity false

*comment === EXPLORATION FLAGS ===
*create secret_passage_found false
*create tower_of_stars_visited false
*create old_city_visited false
*create library_secret_found false
*create hidden_treasury_found false

*comment === ROUTE AND MAJOR DECISIONS ===
*create route 0
*create alliance_sealed false
*create betrayal_committed false
*create rebellion_started false
*create reforms_enacted false
*create emperor_confronted false
*create dowager_confronted false

*comment === ACT 2 PROGRESSION ===
*create act2_chapter 0
*create midpoint_betrayer 0
*create survived_midpoint_betrayal false
*create recovered_from_betrayal false
*create identified_true_enemy false

*comment === ACT 3 PROGRESSION ===
*create conspiracy_revealed false
*create final_alliance_military false
*create final_alliance_trade false
*create final_alliance_temple false
*create final_alliance_intelligence false
*create final_alliance_nobility false
*create siege_outcome 0
*create throne_room_choice 0

*comment === SCENE-SPECIFIC TRACKING ===
*create scene3_crisis_response 0
*create scene6_embargo_result 0
*create scene7_assassination_result 0
*create festival_event 0

*comment === RESOURCES ===
*create gold 100

*comment === CONVERSATION COUNTERS ===
*create conv_emperor 0
*create conv_dowager 0
*create conv_general 0
*create conv_guild 0
*create conv_priest 0
*create conv_spy 0
*create conv_farid 0
*create conv_leila 0
*create conv_navid 0
*create conv_asha 0

*comment === EVIDENCE ===
*create evidence_count 0

*comment === ENDING VARIABLES ===
*create ending_type 0
*create heir_alive true
*create empire_intact true
*create player_alive true
*create love_fulfilled false

*comment === HIDDEN QUEST FLAGS ===
*create found_last_poem false
*create eternal_flame_quest_complete false
```

---

## VARIABLE MODIFICATION QUICK REFERENCE

### When to Use Fairmath vs. Arithmetic

| Variable Type | Operator | Reason |
|---|---|---|
| Personality axes | `%+` / `%-` | Diminishing returns prevent extremes from being reached too easily |
| Relationships | `%+` / `%-` | Natural ceiling/floor -- it's harder to get from 80 to 90 than from 30 to 40 |
| Faction reputation | `%+` / `%-` | Same as relationships |
| Skills | `+` / `-` | Linear progression -- each point of training is equally valuable |
| Gold | `+` / `-` | Currency is a concrete quantity |
| Counters | `+` / `-` | Simple incrementing |
| Flags | `true` / `false` | Binary state |
| Route/ending | direct `*set` | Categorical, not graduated |

### Common Modification Patterns

**Council vote scene:**
```
*comment Player sides with the military
*set rep_military %+ 8
*set rep_trade %- 5
*set rel_general %+ 5
*set rel_guild %- 5
*set boldness %+ 5
```

**Hub conversation:**
```
*comment Meaningful talk with the Emperor
*set rel_emperor %+ 10
*set conv_emperor + 1
*if (conv_emperor = 3)
  *comment Third conversation unlocks deeper content
```

**Skill check:**
```
*if (cunning > 40)
  *set cunning + 3
  *set evidence_count + 1
  You notice the hidden compartment in the desk.
*else
  The desk appears ordinary. You find nothing.
```

**Romance progression:**
```
*if ((rel_leila > 60) and (romance_leila) and (not(romance_active and not(romance_leila))))
  The evening light catches her face as she turns to you.
  *set rel_leila %+ 12
```

# The Silk Throne -- Scene Specification Bible

Scene-by-scene technical specification for all 31 scenes. This document is the production reference. Each entry contains everything a writer needs to draft the scene.

Word targets sum to approximately 300,000 words.

---

## WORD BUDGET OVERVIEW

| Section | Scenes | Word Target | Notes |
|---|---|---|---|
| Act 1 (FREE) | 1-8 | 76,000 | Linear, all players see this |
| Act 2 Route Content | 9-14 | 64,000 | ~21,300 per route (x3 routes) |
| Act 2 Shared | 15-20 | 62,000 | Convergence + route-inflected |
| Act 3 | 21-30 | 80,000 | Convergence + branching endings |
| Epilogue | 31 | 20,000 | 15 endings |
| **Total** | **31** | **~302,000** | |

Note: Route-divergent scenes in Act 2 contain approximately 3,500-4,500 words per route variant within each scene file. A single playthrough sees approximately 200,000 words; the remaining 100,000 are alternate route content discovered on replay.

---

## ACT 1: "THE NEW VIZIER" (FREE)

---

```
SCENE 1: "The Road to Khazara" (startup.txt)
- Word target: 8,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: None (game start)
- Summary: The player arrives at the Khazaran capital. Secretary Farid meets
  them at the gates and escorts them to the Citadel. Character creation
  (name, gender, background) is woven into the narrative journey through
  the city. The predecessor's death is mentioned ominously.
- Choices: 1 *choice (background), 3 *fake_choice (observations/personality),
  1 *input_text (name), 1 gender selection
- Variables modified: player_name, gender, pronouns, player_background,
  skills (per background table), boldness, idealist, rel_farid
- Key moments:
  - First sight of Khazara from the approach road
  - Meeting Farid (comic relief, loyalty established immediately)
  - Journey through the city (worldbuilding: bazaar, temples, garrison)
  - Receiving the Vizier's seal ring at the Citadel
  - Farid's uneasy mention of the predecessor's death
- Ends with: Player in their new chambers. Farid announces the Emperor
  requests an audience at dawn.
```

---

```
SCENE 2: "The Audience" (scene2.txt)
- Word target: 10,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: Scene 1
- Summary: First audience with Emperor Roshan and the Dowager Empress Nur.
  The formal ceremony becomes a political gauntlet. The Dowager tests the
  player in a private conversation afterward. An anonymous threatening
  note is found in the player's chambers.
- Choices: 2 *choice (how to address Emperor; how to respond to Dowager's
  test), 2 *fake_choice (preparation approach, court observations)
- Variables modified: has_met_emperor, has_met_dowager, rel_emperor (+5 to +15),
  rel_dowager (+5 to +15), boldness, honest, rep_nobility
- Key moments:
  - The walk down the Jade Throne Room under the court's gaze
  - Emperor Roshan's youth showing through his formality
  - The Dowager's private test (veiled power struggle)
  - The anonymous threatening note: "Your predecessor died screaming"
- Ends with: Player alone with the threatening note. Farid announces the
  Council of Five meets at dawn.
```

---

```
SCENE 3: "The Council of Five" (scene3.txt)
- Word target: 12,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: Scene 2
- Summary: First Council meeting. All five faction leaders introduced in
  one explosive scene as they argue about a devastating Khanate border
  raid. The player must recommend a response -- their first major
  political decision. A conspiracy symbol is found under the council table.
- Choices: 1 *choice (crisis response: military/diplomatic/intelligence/
  economic), 1 *choice (which council member to speak with privately),
  3 *fake_choice (reactions to each faction leader)
- Variables modified: met_general, met_guild, met_priest, met_spy,
  scene3_crisis_response, rep_military, rep_trade, rep_temple,
  rep_intelligence, rel_general, rel_guild, rel_priest, rel_spy,
  boldness, idealist, ruthless
- Key moments:
  - Meeting all five faction leaders in rapid succession
  - General Kadir's blunt briefing on the border crisis
  - Zara's revelation: the raids are suspiciously well-coordinated
  - The player's first real political decision with factional consequences
  - The conspiracy symbol under the council table
- Ends with: Player alone in the Council Chamber, having found the same
  symbol from the threatening note scratched under the table. Someone
  in this room is part of the conspiracy.
```

---

```
SCENE 4: "The Dead Man's Office" (scene4.txt)
- Word target: 10,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: Scene 3
- Summary: Investigation scene. The player searches the predecessor's office,
  finding evidence of murder through skill checks. Spymaster Zara reveals
  the predecessor was poisoned. A secret passage is optionally discovered.
- Choices: 2 *choice (what to investigate first; whether to share findings
  with Zara), 2 *fake_choice (investigation approach, emotional reaction)
- Variables modified: predecessor_murder_known, discovered_poison,
  found_letter (if scholarship > 30), secret_passage_found (if strength > 35),
  evidence_count (+1 to +3), rel_spy (+10 to +15 if open with Zara),
  rep_intelligence (+8), skills (+3 for successful checks)
- Key moments:
  - The eerie atmosphere of the dead man's office
  - Farid's guilt about being absent the day his master died
  - Zara's cold confirmation: "He was poisoned"
  - Discovery of the secret passage (if found)
  - The poison vial with residue
- Ends with: Player holds evidence. Zara warns: "The killer is close."
  A formal invitation arrives from Guildmaster Priya.
```

---

```
SCENE 5: "The Heart of the City" (scene5.txt)
- Word target: 10,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: Scene 4
- Summary: Hub scene. The player explores Khazara, choosing 3 of 7 possible
  activities: visit the Bazaar (meet Priya), Garrison (meet Navid),
  Temple (meet Asha), Poetry Reading (meet Leila), Old City (meet Lila),
  Library (research), or Garden (Emperor private talk). First opportunity
  for romance initiation.
- Choices: Hub structure (3 selections from 7 options), 5+ *fake_choice
  within sub-conversations, 1 *choice per location visited
- Variables modified: met_leila, met_navid, met_asha (on first visit),
  rel_leila/navid/asha (+8 to +15), rel_guild, rel_emperor,
  rep_military, rep_trade, rep_temple, rep_intelligence,
  conv_ counters, skills (+5 from training), possible romance_ flag,
  old_city_visited, tower_of_stars_visited
- Key moments:
  - First meetings with romance options (Leila, Navid, Asha)
  - Contrast between Citadel luxury and Old City poverty
  - Quiet character moments building relationships
  - Player learns that time is limited and choices about who to
    spend it with matter
- Ends with: Farid interrupts with urgent news -- a trade crisis requires
  immediate attention.
```

---

```
SCENE 6: "The Embargo" (scene6.txt)
- Word target: 8,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: Scene 5
- Summary: Economic crisis. The Western Confederation imposes a trade embargo.
  Factions argue over the response. The player negotiates with Ambassador
  Chen and/or takes direct action. A connection between the embargo and
  the conspiracy is revealed.
- Choices: 2 *choice (approach to embargo; specific negotiation decisions),
  2 *fake_choice (reactions, personality)
- Variables modified: scene6_embargo_result (1-4), rep_trade, rep_military,
  rel_guild (+10 or -10), rel_chen, gold (+30 to +50 if favorable),
  evidence_count (+1 if spy connection found)
- Key moments:
  - The economic stakes feel tangible -- the empire's wealth threatened
  - Ambassador Chen's charming hostility
  - Discovery that the embargo connects to the conspiracy
  - Immediate visible consequences of the player's choice
- Ends with: Crisis resolved or patched. That night, Farid wakes the player:
  "Someone tried to kill the Emperor."
```

---

```
SCENE 7: "The Long Night" (scene7.txt)
- Word target: 10,000
- Free/Paid: FREE
- Act: 1
- Route: All
- Previous: Scene 6
- Summary: Assassination attempt on Emperor Roshan. The most action-heavy
  scene in Act 1. The Ghost (assassin) has struck and escaped. The player
  must protect the Emperor, investigate, and manage political fallout.
  The conspiracy is confirmed with physical evidence.
- Choices: 3 *choice (immediate response; investigation approach; what to
  tell the Emperor), 2 *fake_choice (emotional reactions)
- Variables modified: scene7_assassination_result (1-4),
  rel_emperor (+10 to +20), boldness, ruthless,
  rep_military (+/-5), rep_intelligence (+/-5),
  evidence_count (+1 to +2), possible knows_ghost_identity
- Key moments:
  - Chaos of the assassination attempt (action, tension)
  - The Emperor's vulnerability -- a frightened teenager
  - The Dowager's terrifying cold fury
  - The Ghost's calling card matches the conspiracy symbol
  - The Emperor asks the player: "What should I do?"
- Ends with: Crisis contained. The player reviews everything they know.
  Three paths forward crystallize in their mind.
```

---

```
SCENE 8: "The Crossroads" (scene8.txt)
- Word target: 8,000
- Free/Paid: FREE (last free scene -- paywall after this)
- Act: 1
- Route: All (sets route for remainder)
- Previous: Scene 7
- Summary: THE ROUTE FORK. The player reflects, consults with their closest
  NPC ally, and makes the defining choice: Loyalist (protect the Emperor),
  Kingmaker (seize power behind the throne), or Revolutionary (reform the
  empire from within). The choice is confirmed with a second selection.
- Choices: 1 *choice (THE ROUTE FORK), 1 *choice (confirmation),
  2 *fake_choice (reflection, personality confirmation)
- Variables modified: route (1, 2, or 3), boldness, idealist, ruthless,
  honest (significant shifts per route)
  Route 1: idealist %+10, honest %+5
  Route 2: boldness %+10, ruthless %+5
  Route 3: idealist %+10, boldness %+5
- Key moments:
  - The weight of the decision
  - Private conversation with closest NPC ally
  - The moment of commitment
  - Farid's reaction to the player's new resolve
- Ends with: The player walks out with new purpose. Title card:
  "The Silk Throne -- Act 2: The Long Game." PAYWALL TRANSITION.
```

---

## ACT 2: "THE LONG GAME" (PAID)

---

```
SCENE 9: "The First Move" (scene9.txt)
- Word target: 12,000 (~4,000 per route variant)
- Free/Paid: PAID
- Act: 2
- Route: Loyalist / Kingmaker / Revolutionary (divergent)
- Previous: Scene 8
- Summary: The player's first deliberate action on their chosen route.
  Loyalist: help the Emperor act independently of the Dowager.
  Kingmaker: build a shadow power network while deflecting Zara's suspicion.
  Revolutionary: enact reform opposed by Lord Reza and the nobility.
- Choices: 2 *choice per route (approach, specific tactic),
  2 *fake_choice per route (reactions, personality)
- Variables modified: act2_chapter (set to 1), route-specific relationship
  and reputation shifts, personality axes
  Loyalist: rel_emperor, rel_dowager, rep_military
  Kingmaker: rel_spy, rel_guild, rep_intelligence
  Revolutionary: rel_soraya, rel_reza, rep_nobility
- Key moments:
  - Loyalist: The Emperor's first independent decision
  - Kingmaker: Zara's confrontation -- she suspects something
  - Revolutionary: Lord Reza's furious opposition to reform
- Ends with: First move succeeds partially. The long game will be harder
  than expected.
```

---

```
SCENE 10: "Allies and Enemies" (scene10.txt)
- Word target: 12,000 (~4,000 per route variant)
- Free/Paid: PAID
- Act: 2
- Route: Loyalist / Kingmaker / Revolutionary (divergent)
- Previous: Scene 9
- Summary: The player identifies and secures key allies for their route.
  Loyalist: recruit General Kadir; inspect northern defenses; discover sabotage.
  Kingmaker: build secret alliance with Priya or Zara; dangerous Old City meeting.
  Revolutionary: build reform coalition with Soraya, merchants, commoners.
- Choices: 2 *choice per route (alliance decisions),
  2 *fake_choice per route (relationship building)
- Variables modified: Route-specific alliance flags, relationship shifts,
  reputation shifts. Evidence may increase if sabotage is discovered.
- Key moments:
  - Loyalist: The sabotaged northern defenses -- the conspiracy is military too
  - Kingmaker: The dangerous Old City meeting -- first real moral compromise
  - Revolutionary: The commoners' petition -- real people depend on the player
- Ends with: An ally secured but an enemy alerted. The conspiracy adapts.
```

---

```
SCENE 11: "The Shadow Moves" (scene11.txt)
- Word target: 10,000 (~3,300 per route variant)
- Free/Paid: PAID
- Act: 2
- Route: Loyalist / Kingmaker / Revolutionary (divergent)
- Previous: Scene 10
- Summary: The conspiracy strikes back against the player's route-specific
  progress. Loyalist: Emperor publicly embarrassed. Kingmaker: player's
  activities partially exposed. Revolutionary: a reform ally is murdered.
- Choices: 2 *choice per route (response to the attack),
  1 *fake_choice per route (emotional reaction)
- Variables modified: evidence_count (+1), conspiracy flags,
  relationship stress tests, boldness, ruthless
- Key moments:
  - The conspiracy is not passive -- it adapts to the player's strategy
  - The personal cost of the player's chosen path
  - A moment of doubt: is this worth it?
- Ends with: The player must decide: escalate or retreat.
```

---

```
SCENE 12: "The Price of Power" (scene12.txt)
- Word target: 10,000 (~3,300 per route variant)
- Free/Paid: PAID
- Act: 2
- Route: Loyalist / Kingmaker / Revolutionary (divergent)
- Previous: Scene 11
- Summary: The moral cost of the route. Each route forces a difficult ethical
  choice. Loyalist: sacrifice an innocent to protect the Emperor's image.
  Kingmaker: betray a minor ally for a more powerful backer. Revolutionary:
  accept corrupt support to advance reform.
- Choices: 1 *choice per route (the moral dilemma -- accept or refuse),
  2 *fake_choice per route (internal struggle, personality)
- Variables modified: ruthless, honest, idealist (significant shifts),
  possible betrayal_committed, relationship with sacrificed party drops.
  If player refuses the moral compromise: different consequences.
- Key moments:
  - The player confronts the gap between their ideals and their actions
  - The NPC being sacrificed/betrayed reacts (heartbreaking)
  - Farid's reaction (moral compass of the story)
- Ends with: The deed is done (or refused). The player is changed.
```

---

```
SCENE 13: "Deep Water" (scene13.txt)
- Word target: 10,000 (~3,300 per route variant)
- Free/Paid: PAID
- Act: 2
- Route: Loyalist / Kingmaker / Revolutionary (divergent)
- Previous: Scene 12
- Summary: Major conspiracy revelation. Loyalist: conspiracy aims to replace
  Roshan with Prince Kaveh. Kingmaker: a rival shadow ruler exists.
  Revolutionary: temple schism threatens from within.
- Choices: 2 *choice per route (investigation decisions),
  1 *fake_choice per route (processing revelations)
- Variables modified: evidence_count (significant increase),
  suspect_kaveh / suspect_reza / suspect_dowager flags,
  conspiracy-related flags
- Key moments:
  - "The conspiracy is bigger than we thought"
  - Prince Kaveh's role clarified (willing or unwitting?)
  - The player realizes some allies may be compromised
- Ends with: Major revelation. The player needs more allies -- or fewer
  people they trust.
```

---

```
SCENE 14: "The Gathering Storm" (scene14.txt)
- Word target: 10,000 (~3,300 per route variant + shared hub)
- Free/Paid: PAID
- Act: 2
- Route: All (hub structure with route-inflected conversations)
- Previous: Scene 13
- Summary: Second hub scene. Relationship building, skill training, romance
  advancement, and preparation for the Grand Festival. Each route has
  specific NPC conversations available. Major romance scenes for all
  three options.
- Choices: Hub structure (3 selections from 6 options),
  3+ *fake_choice within conversations, romance advancement choices
- Variables modified: Multiple rel_ variables, conv_ counters,
  skills (+5), romance advancement (rel_romance_partner +12 to +15),
  route-specific preparation flags
- Key moments:
  - Leila romance: private poetry exchange that becomes personal
  - Navid romance: night watch on Citadel walls, sharing histories
  - Asha romance: philosophical walk becomes unexpectedly intimate
  - Route-specific ally consultation
- Ends with: The Grand Festival begins tomorrow. Calm before the storm.
```

---

```
SCENE 15: "The Festival of Lights" (scene15.txt)
- Word target: 12,000
- Free/Paid: PAID
- Act: 2
- Route: All (convergence point, route-inflected)
- Previous: Scene 14
- Summary: The Grand Festival. Set-piece spectacle scene. Thousands of lamps,
  music, ceremony. Romance culmination (first kiss/confession/promise).
  Political maneuvering. The Emperor's public speech. Prince Kaveh
  appears. An incident sets up the midpoint betrayal.
- Choices: 3 *choice (political maneuvering, romance moment, response to
  Kaveh), 3 *fake_choice (Festival observations, personality)
- Variables modified: festival_event (1-3), romance variables (major
  advancement), met_kaveh, rel_kaveh, multiple relationship shifts,
  personality axes
- Key moments:
  - The Festival spectacle (the empire at its most magnificent)
  - Romance culmination (emotional peak of the love story so far)
  - Prince Kaveh's entrance (charming, confident, subtly threatening)
  - The Emperor's speech (triumph or stumble)
  - The incident that presages betrayal
- Ends with: The lamps are extinguished. Morning brings disaster.
```

---

```
SCENE 16: "The Knife in the Back" (scene16.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 2
- Route: All (betrayer identity varies by route + relationships)
- Previous: Scene 15
- Summary: The midpoint betrayal. A trusted ally acts against the player,
  publicly and devastatingly. The betrayer is determined by route and
  lowest-relationship NPC from a candidate list. The player's position
  is severely undermined.
- Choices: 2 *choice (immediate reaction, damage control attempt),
  2 *fake_choice (emotional processing)
- Variables modified: midpoint_betrayer (1-5), massive relationship drops
  with betrayer (-20 to -30), rep_ shifts, evidence_count (+1 to +2),
  personality axes (significant)
- Key moments:
  - The betrayal itself (gut-punch moment)
  - Public humiliation or private devastation
  - Other NPCs' reactions (who stands by the player, who distances)
  - "Everything I built is falling apart"
- Ends with: The player's lowest point. Everything seems lost.
```

---

```
SCENE 17: "The Reckoning" (scene17.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 2
- Route: All (route-inflected consequences)
- Previous: Scene 16
- Summary: Immediate aftermath of the betrayal. Loss of status. Allies
  questioning loyalty. The Emperor's trust shaken. The player must
  survive the political and personal fallout. This is the game's
  emotional nadir.
- Choices: 2 *choice (survival strategy, who to turn to),
  2 *fake_choice (emotional response, personality under pressure)
- Variables modified: Multiple relationship tests (some allies lose faith,
  some hold firm), reputation shifts, possible alliance flags lost,
  boldness, ruthless, honest shifts
- Key moments:
  - The morning after -- everything is different
  - A conversation with Farid (he remains loyal -- anchor point)
  - The romance partner's reaction (test of the relationship)
  - A conversation with the Emperor (trust damaged or maintained)
- Ends with: The player is battered. But they are not broken.
```

---

```
SCENE 18: "Rising from the Ashes" (scene18.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 2
- Route: All (route-inflected recovery)
- Previous: Scene 17
- Summary: Recovery begins. The player turns to remaining allies, finds
  unexpected support, and starts rebuilding. The betrayal reveals new
  information about the conspiracy. The damage is permanent but the
  player demonstrates resilience.
- Choices: 2 *choice (recovery strategy, alliance rebuilding),
  2 *fake_choice (determination, personality reaffirmation)
- Variables modified: survived_midpoint_betrayal (true), evidence_count
  (+2 -- betrayal reveals conspiracy info), relationship recovery
  with loyal allies (+10 to +15), personality axes (resilience)
- Key moments:
  - An unexpected ally steps forward
  - New evidence from the betrayal's aftermath
  - The player recommits to their route with harder eyes
  - A quiet moment of recovery (possibly with romance partner)
- Ends with: The player is standing again. Scarred but determined.
```

---

```
SCENE 19: "The Web Untangled" (scene19.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 2
- Route: All (route-inflected investigation)
- Previous: Scene 18
- Summary: Climactic investigation scene. The player pieces together the
  full conspiracy from accumulated evidence. Skill checks gate how much
  they learn. The true enemy is suspected (confirmed in Scene 26).
- Choices: 3 *choice (investigation steps, confrontation decisions),
  1 *fake_choice (processing revelations)
- Variables modified: identified_true_enemy (true), recovered_from_betrayal
  (true), evidence_count (major increase), conspiracy flags,
  skills (+3 for successful checks)
- Key moments:
  - The evidence board -- everything connected
  - A breakthrough skill check revealing the mastermind's identity
  - Confrontation with a suspect
  - The scope of the conspiracy fully revealed
- Ends with: The player knows who the enemy is. Now they need to prepare.
```

---

```
SCENE 20: "The Eve of Battle" (scene20.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 2
- Route: All (hub structure, route-inflected)
- Previous: Scene 19
- Summary: Final preparation hub. The player secures alliances, has a last
  private moment with the romance partner, a defining conversation with
  the Emperor, and strategic planning for the confrontation.
- Choices: Hub structure (3-4 selections), romance choice,
  Emperor conversation choice, strategic planning choice
- Variables modified: Final alliance setup flags, love_fulfilled (if
  romance rel > 75), rel_emperor (defining moment), multiple
  relationship consolidation
- Key moments:
  - Final romantic moment (if active) -- promises, fears, intimacy
  - The Emperor conversation (defining the endgame relationship)
  - Strategic council with allies
  - A quiet moment alone before the storm
- Ends with: "Tomorrow, everything changes." Transition to Act 3.
```

---

## ACT 3: "THE RECKONING" (PAID)

---

```
SCENE 21: "The Storm Breaks" (scene21.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 3
- Route: All (converged, with route-inflected details)
- Previous: Scene 20
- Summary: The conspiracy's endgame begins: coordinated Khanate invasion,
  economic crisis, and Prince Kaveh's public claim to the throne. All
  three crises hit simultaneously.
- Choices: 2 *choice (priority: which crisis to address first, delegation),
  2 *fake_choice (reactions)
- Variables modified: Multiple crisis flags, alliance tests, boldness,
  ruthless, route-specific reputation shifts
- Key moments:
  - Triple crisis announcement (overwhelming)
  - Prince Kaveh's public challenge (personal and political)
  - The player must triage -- cannot solve everything personally
  - Allied NPCs step up (or fail to) based on relationship levels
- Ends with: The player has chosen their priority. The other crises continue.
```

---

```
SCENE 22: "The Northern Front" (scene22.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 3
- Route: All (military focus)
- Previous: Scene 21
- Summary: The Khanate invasion. Whether the player handles this personally
  or delegates to Kadir, the military crisis demands resolution. Battle
  sequences with skill checks. The player must choose between border
  defense and capital protection.
- Choices: 2 *choice (military strategy, resource allocation),
  2 *fake_choice (battlefield reactions)
- Variables modified: rep_military, rel_general, final_alliance_military
  (if military alliance secured), strength (+3 to +5),
  heir_alive may be at risk if capital left undefended
- Key moments:
  - Battle at the northern wall (action set-piece)
  - General Kadir at his finest (or his worst)
  - The cost of war -- soldiers dying
  - A choice between strategic retreat and costly stand
- Ends with: The northern front stabilized or lost. Consequences ripple.
```

---

```
SCENE 23: "The Treasury War" (scene23.txt)
- Word target: 8,000
- Free/Paid: PAID
- Act: 3
- Route: All (economic focus)
- Previous: Scene 22
- Summary: Economic collapse threatens. Conspiracy agents have disrupted trade
  and raided the treasury. The player works with Priya to stabilize the
  economy or lets it crash to focus on other priorities.
- Choices: 2 *choice (economic strategy), 1 *fake_choice (priorities)
- Variables modified: gold (significant shifts), rep_trade, rel_guild,
  final_alliance_trade (if trade alliance secured), empire_intact
  may be threatened if economy collapses
- Key moments:
  - The treasury is nearly empty (stakes)
  - Priya's resourcefulness (or desperation)
  - A moral choice about who bears the economic pain
  - The merchant class's loyalty tested
- Ends with: Economy stabilized or collapsing. The player cannot save
  everything.
```

---

```
SCENE 24: "The Temple Divided" (scene24.txt)
- Word target: 8,000
- Free/Paid: PAID
- Act: 3
- Route: All (religious focus)
- Previous: Scene 23
- Summary: The religious establishment splits. Conservative elders support
  Kaveh. Ashoka must choose between temple unity and the player. The
  Eternal Flame gutters -- a terrifying omen.
- Choices: 2 *choice (temple politics, response to the omen),
  1 *fake_choice (spiritual reflection)
- Variables modified: rep_temple, rel_priest, final_alliance_temple
  (if temple alliance secured), possible rel_asha shifts
- Key moments:
  - The Eternal Flame guttering (visceral omen)
  - Ashoka's agonized choice (character moment)
  - The conservative elders' pronouncement
  - A spiritual moment for the player (regardless of personal belief)
- Ends with: The temple chooses a side. The spiritual crisis echoes the
  political one.
```

---

```
SCENE 25: "The Shadow War" (scene25.txt)
- Word target: 8,000
- Free/Paid: PAID
- Act: 3
- Route: All (intelligence focus)
- Previous: Scene 24
- Summary: Espionage battle. Zara's network versus the conspiracy's agents.
  Cat-and-mouse through the Old City. The player participates directly
  or coordinates from the Citadel.
- Choices: 2 *choice (intelligence strategy, direct involvement),
  1 *fake_choice (tactical assessment)
- Variables modified: rep_intelligence, rel_spy, final_alliance_intelligence
  (if intelligence alliance secured), evidence_count (final pieces),
  cunning (+3 to +5)
- Key moments:
  - The Old City chase (action sequence)
  - Zara at her most dangerous
  - Lila's role as street-level intelligence
  - The conspiracy's last agents identified
- Ends with: The shadow war won or lost. All pieces in place for the
  final confrontation.
```

---

```
SCENE 26: "The True Enemy" (scene26.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 3
- Route: All (mastermind identity varies by route)
- Previous: Scene 25
- Summary: The conspiracy mastermind is unmasked in a confrontation scene.
  Loyalist: Dowager Empress Nur. Kingmaker: Lord Reza. Revolutionary:
  coalition of threatened interests. Emotional and personal stakes.
- Choices: 2 *choice (confrontation approach, what to do with the truth),
  2 *fake_choice (emotional reaction, moral judgment)
- Variables modified: conspiracy_revealed (true), massive relationship
  shifts with the mastermind, dowager_confronted / equivalent flags,
  personality axes (significant final shifts)
- Key moments:
  - The unmasking (revelation scene)
  - The mastermind's justification ("I did this for the empire")
  - The emotional weight: someone known the entire game is the enemy
  - The player must decide: mercy, justice, or pragmatism
- Ends with: The truth is known. The final battle approaches.
```

---

```
SCENE 27: "Choose Your Weapons" (scene27.txt)
- Word target: 8,000
- Free/Paid: PAID
- Act: 3
- Route: All (strategy selection)
- Previous: Scene 26
- Summary: Final preparation. The player selects which alliances to invoke
  and which strategy to use for the climactic confrontation. Strategic
  choices based on accumulated alliance flags.
- Choices: 3 *choice (primary strategy, ally deployment, backup plan),
  1 *fake_choice (strategic confidence)
- Variables modified: Final alliance flags confirmed, strategy variables,
  relationship consolidation with chosen allies
- Key moments:
  - The war council (epic planning scene)
  - Each ally declares their commitment (payoff for relationship building)
  - Absent allies are felt (consequence of neglected relationships)
  - The romance partner's promise
- Ends with: The plan is set. Dawn brings the confrontation.
```

---

```
SCENE 28: "The Siege" (scene28.txt)
- Word target: 12,000
- Free/Paid: PAID
- Act: 3
- Route: All (approach varies by strategy chosen in Scene 27)
- Previous: Scene 27
- Summary: The climactic confrontation. Varies by strategy: military siege,
  political trial, covert operation, or combination. The game's action
  climax. Every earlier choice pays off or punishes.
- Choices: 3 *choice (tactical decisions during the confrontation),
  2 *fake_choice (combat/tension reactions)
- Variables modified: siege_outcome (1-5), possible heir_alive (false),
  possible empire_intact (false), major relationship shifts,
  skills tested extensively
- Key moments:
  - The confrontation begins (epic set-piece)
  - Allied NPCs fulfill their roles (or fail)
  - A critical moment where one skill check determines success/failure
  - The moment of victory or defeat
  - A cost: someone important may die
- Ends with: The confrontation is over. The player stands in the aftermath.
```

---

```
SCENE 29: "The Throne Room" (scene29.txt)
- Word target: 10,000
- Free/Paid: PAID
- Act: 3
- Route: All (the final decision)
- Previous: Scene 28
- Summary: The emotional climax. The player stands in the Jade Throne Room
  and makes the final decision about the empire's future: claim the
  throne, defend the Emperor, abolish the monarchy, compromise with
  reform, or walk away.
- Choices: 1 *choice (THE FINAL DECISION -- throne_room_choice 1-5),
  1 *choice (confirmation), 2 *fake_choice (emotional processing)
- Variables modified: throne_room_choice (1-5), ending_type (calculated),
  final relationship moments
- Key moments:
  - The Jade Throne Room, empty and quiet after the battle
  - The Emperor's reaction to the player's choice
  - The romance partner's final moment
  - The Dowager's fate resolved
  - The player's defining moment: what kind of ruler/person are they?
- Ends with: The choice is made. The empire's future is set.
```

---

```
SCENE 30: "The Scales of Fate" (scene30.txt)
- Word target: 6,000
- Free/Paid: PAID
- Act: 3
- Route: All (ending calculation)
- Previous: Scene 29
- Summary: Ending determination. Evaluates all variables using the Ending
  Gate Pattern to determine which of 15 endings the player receives.
  Minimal new prose -- primarily conditional logic. Short narrative
  transitions into the appropriate ending.
- Choices: 0 *choice, 0 *fake_choice (this is a calculation scene)
- Variables modified: ending_type (finalized), achievement triggers
- Key moments:
  - Brief narrative reflecting on the journey
  - The Ending Gate logic executes
  - Achievement unlocked notification
  - Transition to epilogue
- Ends with: *goto_scene epilogue [label based on ending_type]
```

---

## EPILOGUE (PAID)

---

```
SCENE 31: "The Silk Throne" (epilogue.txt)
- Word target: 20,000 (15 endings x ~1,300 words average)
- Free/Paid: PAID
- Act: Epilogue
- Route: All (15 ending variants)
- Previous: Scene 30
- Summary: Extended ending narrations. Each of 15 endings receives a full
  narrative conclusion covering: the player's fate, the Emperor's fate,
  each major NPC's fate, the romance partner's fate (if applicable),
  the empire's future, and a final image.
- Choices: 0 *choice (pure narration)
- Variables modified: None (final display only)
- Key moments (per ending):
  - Ending 1 (Golden Age): Coronation anniversary, empire prospering
  - Ending 2 (Iron Throne): Functional rule, emotional distance
  - Ending 3 (Fallen Crown): Aftermath of failure, what remains
  - Ending 4 (Broken Oath): The truth comes out, everything shatters
  - Ending 5 (Shadow Emperor): Power without glory
  - Ending 6 (Puppet Master): Control without connection
  - Ending 7 (Tyrant): Fear and order, no love
  - Ending 8 (Usurper's Fall): Exile or execution
  - Ending 9 (New Dawn): Reform realized, hope
  - Ending 10 (People's Vizier): Beloved leader, gradual change
  - Ending 11 (Burning Throne): Revolution's cost
  - Ending 12 (Martyr): Posthumous legacy
  - Ending 13 (Exile): A different life, freedom and loss
  - Ending 14 (Eternal Flame): Mystical transcendence
  - Ending 15 (Last Poem): Love and the open road
- Ends with: *ending (game over)
```

---

## SCENE FILE CHECKLIST

| Scene | File | Words | Free? | Act | Route |
|---|---|---|---|---|---|
| 1 | startup.txt | 8,000 | FREE | 1 | All |
| 2 | scene2.txt | 10,000 | FREE | 1 | All |
| 3 | scene3.txt | 12,000 | FREE | 1 | All |
| 4 | scene4.txt | 10,000 | FREE | 1 | All |
| 5 | scene5.txt | 10,000 | FREE | 1 | All |
| 6 | scene6.txt | 8,000 | FREE | 1 | All |
| 7 | scene7.txt | 10,000 | FREE | 1 | All |
| 8 | scene8.txt | 8,000 | FREE | 1 | All |
| 9 | scene9.txt | 12,000 | PAID | 2 | Divergent |
| 10 | scene10.txt | 12,000 | PAID | 2 | Divergent |
| 11 | scene11.txt | 10,000 | PAID | 2 | Divergent |
| 12 | scene12.txt | 10,000 | PAID | 2 | Divergent |
| 13 | scene13.txt | 10,000 | PAID | 2 | Divergent |
| 14 | scene14.txt | 10,000 | PAID | 2 | Shared Hub |
| 15 | scene15.txt | 12,000 | PAID | 2 | Shared |
| 16 | scene16.txt | 10,000 | PAID | 2 | Shared |
| 17 | scene17.txt | 10,000 | PAID | 2 | Shared |
| 18 | scene18.txt | 10,000 | PAID | 2 | Shared |
| 19 | scene19.txt | 10,000 | PAID | 2 | Shared |
| 20 | scene20.txt | 10,000 | PAID | 2 | Shared Hub |
| 21 | scene21.txt | 10,000 | PAID | 3 | Shared |
| 22 | scene22.txt | 10,000 | PAID | 3 | Shared |
| 23 | scene23.txt | 8,000 | PAID | 3 | Shared |
| 24 | scene24.txt | 8,000 | PAID | 3 | Shared |
| 25 | scene25.txt | 8,000 | PAID | 3 | Shared |
| 26 | scene26.txt | 10,000 | PAID | 3 | Shared |
| 27 | scene27.txt | 8,000 | PAID | 3 | Shared |
| 28 | scene28.txt | 12,000 | PAID | 3 | Shared |
| 29 | scene29.txt | 10,000 | PAID | 3 | Shared |
| 30 | scene30.txt | 6,000 | PAID | 3 | Shared |
| 31 | epilogue.txt | 20,000 | PAID | Epi | Shared |
| **TOTAL** | | **~302,000** | | | |

#!/bin/bash
# bug-fixer-parallel.sh — ClawTeam parallel bug fixing
# Uses multiple Claude Code agents simultaneously

REPO="mohaktnbt/silk-throne"
LABEL="cowork-bug"
POLL_INTERVAL=90
REPO_DIR="$HOME/silk-throne"

cd "$REPO_DIR" || exit 1

echo ""
echo "=========================================="
echo "  SILK THRONE — Parallel Bug Fixer"
echo "  Mode: ClawTeam Swarm"
echo "  Watching: $REPO (label: $LABEL)"
echo "  Polling: every ${POLL_INTERVAL}s"
echo "=========================================="
echo ""

while true; do
    git checkout main 2>/dev/null
    git pull origin main 2>/dev/null

    # Count open bugs
    ISSUES=$(gh issue list --repo "$REPO" --label "$LABEL" --state open --json number,title,body --limit 5 2>/dev/null)

    if [ -z "$ISSUES" ] || [ "$ISSUES" = "[]" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') — No bugs. Sleeping ${POLL_INTERVAL}s..."
        sleep "$POLL_INTERVAL"
        continue
    fi

    BUG_COUNT=$(echo "$ISSUES" | jq length)
    echo ""
    echo "$(date '+%Y-%m-%d %H:%M:%S') — Found $BUG_COUNT bugs! Dispatching..."
    echo ""

    if [ "$BUG_COUNT" -eq 1 ]; then
        # Single bug — use direct Claude Code (faster, no swarm overhead)
        NUMBER=$(echo "$ISSUES" | jq -r '.[0].number')
        TITLE=$(echo "$ISSUES" | jq -r '.[0].title')
        BODY=$(echo "$ISSUES" | jq -r '.[0].body')

        echo "Single bug — using direct Claude Code"
        gh issue edit "$NUMBER" --repo "$REPO" --add-label "in-progress" --remove-label "cowork-bug" 2>/dev/null

        BRANCH="fix/cowork-bug-${NUMBER}"
        git branch -D "$BRANCH" 2>/dev/null
        git checkout -b "$BRANCH"

        claude --dangerously-skip-permissions -p "
Read CLAUDE.md first.

Fix this bug — Issue #$NUMBER: $TITLE

$BODY

Steps:
1. Find and fix the bug in web/src/
2. Run: cd web && npm run build
3. Run: cd web && npm run lint
4. Commit: git add -A && git commit -m 'fix: resolve #$NUMBER — $TITLE'

Rules: TypeScript strict, no any, mobile-first, minimal changes only.
"

        git push origin "$BRANCH" --force 2>/dev/null
        PR_URL=$(gh pr create --repo "$REPO" --base main --head "$BRANCH" \
            --title "fix: #$NUMBER — $TITLE" \
            --body "Closes #$NUMBER — Auto-fix by Claude Code" 2>/dev/null)

        gh issue edit "$NUMBER" --repo "$REPO" --add-label "fix-submitted" --remove-label "in-progress" 2>/dev/null
        gh issue comment "$NUMBER" --repo "$REPO" --body "🤖 Fix submitted: $PR_URL" 2>/dev/null
        git checkout main 2>/dev/null

    else
        # Multiple bugs — use ClawTeam parallel swarm
        echo "Multiple bugs — spawning ClawTeam swarm"

        # Relabel all issues as in-progress
        echo "$ISSUES" | jq -r '.[].number' | while read -r NUM; do
            gh issue edit "$NUM" --repo "$REPO" --add-label "in-progress" --remove-label "cowork-bug" 2>/dev/null
        done

        # Build the leader prompt with all bugs
        LEADER_PROMPT="You are the bug-fix team leader for The Silk Throne.

Read CLAUDE.md first for project conventions.

Here are the bugs to fix in parallel. For EACH bug, spawn a separate worker using:
clawteam spawn --team silk-bugs --agent-name fixer-ISSUE_NUMBER --task \"THE_TASK\"

Each worker gets its own git worktree automatically — no conflicts.

BUGS TO FIX:
"
        # Append each bug to the prompt
        echo "$ISSUES" | jq -c '.[]' | while read -r ISSUE; do
            NUM=$(echo "$ISSUE" | jq -r '.number')
            TTL=$(echo "$ISSUE" | jq -r '.title')
            BDY=$(echo "$ISSUE" | jq -r '.body')
            LEADER_PROMPT="$LEADER_PROMPT

--- BUG #$NUM: $TTL ---
$BDY
---
"
        done

        LEADER_PROMPT="$LEADER_PROMPT

After all workers finish:
1. For each worker's worktree, check if build passes
2. If yes: create branch fix/cowork-bug-NUMBER, push, create PR
3. If no: report the failure
4. Relabel each issue: remove 'in-progress', add 'fix-submitted' (success) or 'needs-manual-fix' (failure)
5. Comment on each issue with the result
"

        # Launch ClawTeam leader
        claude --dangerously-skip-permissions -p "$LEADER_PROMPT"

        git checkout main 2>/dev/null
    fi

    echo ""
    echo "$(date '+%Y-%m-%d %H:%M:%S') — Batch complete. Sleeping ${POLL_INTERVAL}s..."
    sleep "$POLL_INTERVAL"
done

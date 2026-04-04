#!/bin/bash
# bug-fixer.sh — Watches GitHub Issues, dispatches Claude Code to fix bugs
# Runs forever in tmux. Your laptop can be closed.

REPO="mohaktnbt/silk-throne"
LABEL="cowork-bug"
POLL_INTERVAL=60
REPO_DIR="$HOME/silk-throne"

cd "$REPO_DIR" || exit 1

echo ""
echo "=========================================="
echo "  SILK THRONE — Bug Fixer Running"
echo "  Watching: $REPO"
echo "  Label:    $LABEL"
echo "  Polling:  every ${POLL_INTERVAL}s"
echo "=========================================="
echo ""

while true; do
    # Pull latest code before checking issues
    git checkout main 2>/dev/null
    git pull origin main 2>/dev/null

    # Check for open issues with cowork-bug label
    ISSUES=$(gh issue list --repo "$REPO" --label "$LABEL" --state open --json number,title,body --limit 3 2>/dev/null)

    if [ -z "$ISSUES" ] || [ "$ISSUES" = "[]" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') — No bugs found. Sleeping ${POLL_INTERVAL}s..."
        sleep "$POLL_INTERVAL"
        continue
    fi

    # Process each issue one at a time
    echo "$ISSUES" | jq -c '.[]' | while read -r ISSUE; do
        NUMBER=$(echo "$ISSUE" | jq -r '.number')
        TITLE=$(echo "$ISSUE" | jq -r '.title')
        BODY=$(echo "$ISSUE" | jq -r '.body')

        echo ""
        echo "=========================================="
        echo "  BUG FOUND: Issue #$NUMBER"
        echo "  $TITLE"
        echo "=========================================="
        echo ""

        # Step A: Relabel so we don't pick it up again
        gh issue edit "$NUMBER" --repo "$REPO" --add-label "in-progress" --remove-label "cowork-bug" 2>/dev/null
        gh issue comment "$NUMBER" --repo "$REPO" --body "🤖 Bug fixer picked this up. Working on a fix..." 2>/dev/null

        # Step B: Make sure we're on latest main
        git checkout main 2>/dev/null
        git pull origin main 2>/dev/null

        # Step C: Create a new branch for this fix
        BRANCH="fix/cowork-bug-${NUMBER}"
        git branch -D "$BRANCH" 2>/dev/null
        git checkout -b "$BRANCH"

        # Step D: Tell Claude Code to fix the bug
        echo "Dispatching Claude Code..."
        claude --dangerously-skip-permissions -p "
You are fixing a bug in The Silk Throne web app.

FIRST: Read the file CLAUDE.md in this repo for project conventions.

BUG REPORT — Issue #$NUMBER: $TITLE

$BODY

YOUR INSTRUCTIONS:
1. Understand the bug from the report above
2. Find the relevant source files (the app is in web/src/)
3. Make the minimal fix needed
4. Test your fix by running: cd web && npm run build
5. Also run: cd web && npm run lint
6. If build and lint pass, commit with: git add -A && git commit -m 'fix: resolve #$NUMBER — $TITLE'
7. If the bug report is too vague to fix, just commit a comment explaining why

RULES:
- TypeScript strict, no any
- Mobile-first design
- Don't break existing features
- Keep changes small and focused
- Paid scene files must NEVER be in public directory
"

        # Step E: Push the branch
        git push origin "$BRANCH" --force 2>/dev/null

        # Step F: Create a Pull Request
        PR_URL=$(gh pr create \
            --repo "$REPO" \
            --base main \
            --head "$BRANCH" \
            --title "fix: cowork-bug #$NUMBER — $TITLE" \
            --body "Closes #$NUMBER

Auto-fix by Claude Code from Cowork bug report.

**Review the changes and merge if they look good.**" 2>/dev/null)

        if [ -n "$PR_URL" ]; then
            echo "PR created: $PR_URL"
            gh issue edit "$NUMBER" --repo "$REPO" --add-label "fix-submitted" --remove-label "in-progress" 2>/dev/null
            gh issue comment "$NUMBER" --repo "$REPO" --body "🤖 Fix submitted! PR: $PR_URL — please review and merge." 2>/dev/null
        else
            echo "PR creation failed — branch may already have a PR"
            gh issue edit "$NUMBER" --repo "$REPO" --add-label "needs-manual-fix" --remove-label "in-progress" 2>/dev/null
            gh issue comment "$NUMBER" --repo "$REPO" --body "🤖 Attempted fix but could not create PR. May need manual review." 2>/dev/null
        fi

        # Step G: Go back to main for the next issue
        git checkout main 2>/dev/null

        echo ""
        echo "Done with Issue #$NUMBER"
        echo ""
    done

    sleep "$POLL_INTERVAL"
done

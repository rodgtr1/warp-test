name: Auto Fix Issue

on:
  issues:
    types: [labeled]

jobs:
  auto_fix:
    if: github.event.label.name == 'oz-agent'
    name: Auto Fix Issue
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      # Added metadata permission just to be safe
      metadata: read

    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Construct Prompt
        id: prompt
        uses: actions/github-script@v7
        with:
          script: |
            const issue = context.payload.issue;
            const prompt = `You are the Oz Agent. Fix GitHub Issue #${issue.number}.

            **Issue Title**: ${issue.title}
            **Description**: ${issue.body}

            **INSTRUCTIONS**:
            1. Analyze the code and fix the bug.
            2. **DO NOT** run git commands.
            3. **MANDATORY**: Before you exit, you MUST create a new file named 'pr_description.txt'.
            4. In that file, write a 2-sentence summary of what you fixed.
            5. EXIT when done.
            `;
            core.setOutput('prompt', prompt);

      - name: Run Oz Agent
        uses: warpdotdev/oz-agent-action@v1
        id: agent
        with:
          prompt: ${{ steps.prompt.outputs.prompt }}
          warp_api_key: ${{ secrets.WARP_API_KEY }}

      - name: Create PR
        env:
          GH_TOKEN: ${{ secrets.PR_TOKEN }}
          ISSUE_NUMBER: ${{ github.event.issue.number }}
        run: |
          echo "Checking who I am..."
          gh auth status
          # 1. Check if Agent did work
          if [[ -z $(git status --porcelain) ]]; then
             echo "No changes made."
             exit 0
          fi

          # 2. Configure Git
          git config user.name "Oz Agent"
          git config user.email "agent@warp.dev"

          # 3. Get the Summary (With a Backup Plan)
          if [ -f pr_description.txt ]; then
            PR_BODY=$(cat pr_description.txt)
            rm pr_description.txt
          else
            PR_BODY="I fixed the issue. (Agent did not provide a summary)."
          fi

          # 4. Commit and Push
          BRANCH_NAME="fix/issue-$ISSUE_NUMBER"
          git checkout -b "$BRANCH_NAME"
          git add .
          git commit -m "Fix for Issue #$ISSUE_NUMBER"
          git push origin "$BRANCH_NAME" --force

          # 5. Create PR (With Safety Checks)
          # Check if PR exists first to avoid crashing
          EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --json url --jq '.[0].url')

          if [ -z "$EXISTING_PR" ]; then
            PR_URL=$(gh pr create \
              --repo ${{ github.repository }} \
              --title "Fix: ${{ github.event.issue.title }}" \
              --body "$PR_BODY" \
              --base main \
              --head "$BRANCH_NAME")
          else
            echo "PR already exists, updating..."
            PR_URL=$EXISTING_PR
            gh pr edit "$PR_URL" --body "$PR_BODY"
          fi

          # 6. Post Success Comment
          gh issue comment "$ISSUE_NUMBER" --repo ${{ github.repository }} --body "✅ **Fix Ready!**\n\n**Agent Summary:**\n$PR_BODY\n\n[View Pull Request]($PR_URL)"

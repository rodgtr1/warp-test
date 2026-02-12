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
            3. **IMPORTANT:** When you are done, you MUST create a file named 'pr_description.txt'.
            4. Inside 'pr_description.txt', write a short summary of what you fixed and why.
            5. Exit when done.
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
          GH_TOKEN: ${{ github.token }}
          ISSUE_NUMBER: ${{ github.event.issue.number }}
        run: |
          # 1. Check if the agent did the work
          if [[ -z $(git status --porcelain) ]]; then
             echo "No changes made."
             exit 0
          fi

          # 2. Configure Git
          git config user.name "Oz Agent"
          git config user.email "agent@warp.dev"

          # 3. Read the Agent's Description (or use a default if missing)
          if [ -f pr_description.txt ]; then
            PR_BODY=$(cat pr_description.txt)
            rm pr_description.txt # Don't commit this file!
          else
            PR_BODY="I fixed the issue. (Agent provided no details)."
          fi

          # 4. Commit and Push
          BRANCH_NAME="fix/issue-$ISSUE_NUMBER"
          git checkout -b "$BRANCH_NAME"
          git add .
          git commit -m "Fix for Issue #$ISSUE_NUMBER"
          git push origin "$BRANCH_NAME" --force

          # 5. Create PR with the Agent's Body
          PR_URL=$(gh pr create \
            --title "Fix: ${{ github.event.issue.title }}" \
            --body "$PR_BODY" \
            --base main \
            --head "$BRANCH_NAME")

          # 6. Post Success Comment
          gh issue comment "$ISSUE_NUMBER" --body "✅ **Fix Ready!**\n\nI have analyzed the issue and created a Pull Request.\n\n**My Analysis:**\n$PR_BODY\n\n[View Pull Request]($PR_URL)"

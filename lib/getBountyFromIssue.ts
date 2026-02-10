import { octokit } from "../index"

/**
 * Fetches bounty amount from issue comments by looking for algora bot comments
 * @param repo - Repository in format "owner/repo"
 * @param issueNumber - Issue number
 * @returns Bounty amount in dollars or null if no bounty found
 */
export async function getBountyFromIssue(
  repo: string,
  issueNumber: number,
): Promise<number | null> {
  try {
    const [owner, repo_name] = repo.split("/")
    
    // Fetch issue comments
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo: repo_name,
      issue_number: issueNumber,
    })

    // Look for algora bot comment
    const algoraComment = comments.find(
      (comment) =>
        comment.user?.login === "algora-pbc" &&
        comment.body?.includes("bounty"),
    )

    if (!algoraComment || !algoraComment.body) {
      return null
    }

    // Extract bounty amount using regex
    // Looking for pattern like: ## 💎 $25 bounty
    const bountyMatch = algoraComment.body.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+bounty/i)
    
    if (bountyMatch && bountyMatch[1]) {
      // Remove commas and parse as number
      const amount = Number.parseFloat(bountyMatch[1].replace(/,/g, ""))
      return amount
    }

    return null
  } catch (error) {
    console.error(`Error fetching bounty for issue ${issueNumber}:`, error)
    return null
  }
}

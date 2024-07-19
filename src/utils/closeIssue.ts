import { error, info } from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";

export const closeIssue = async (
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  issueNr: number,
  closeOnSuccessMsg: string,
  quite: boolean
): Promise<void> => {
  if (!quite) {
    info(`Closing issue: ${issueNr}`);
  }

  if (closeOnSuccessMsg) {
    try {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNr,
        body: closeOnSuccessMsg,
      });
    } catch (_) {
      error(`Failed to create comment on issue: ${issueNr}`);
    }
  }

  try {
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNr,
      state: "closed",
    });
  } catch (_) {
    error(`Failed to close issue: ${issueNr}`);
  }
};

import { error, info } from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";
import { FailedTestInfo } from "models";
import { createIssueBody } from "./createIssueBody";

export const createComment = async (
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  issueNr: number,
  test: FailedTestInfo,
  addComment: boolean,
  issueFooter: string,
  quite: boolean
): Promise<string | undefined> => {
  // Add a comment to the issue
  if (!addComment || !issueNr) {
    return;
  }

  if (!quite) {
    info(`Adding comment to issue: ${test.title}`);
  }

  let issueUrl: string | undefined;

  try {
    const comment = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNr,
      body: createIssueBody(test, issueFooter),
    });

    if (comment.data.html_url) {
      issueUrl = comment.data.html_url;
    }
  } catch (_) {
    error(`Failed to add comment to issue: ${test.title}`);
  }

  return issueUrl;
};

import { error, info } from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";
import { TestInfo } from "../models";
import { createIssueBody } from ".";

export const createNewIssue = async (
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  test: TestInfo,
  issueLabels: string[],
  issueFooter: string,
  issueAssignees: string[],
  addProjectLabel: boolean,
  quite: boolean
): Promise<string | undefined> => {
  // Create a new issue
  if (!quite) {
    info(`Creating issue: ${test.issueTitle}`);
  }

  let issueUrl: string | undefined;

  try {
    const newIssue = await octokit.rest.issues.create({
      owner,
      repo,
      title: test.issueTitle,
      labels: issueLabels,
      body: createIssueBody(test, issueFooter),
      assignees: issueAssignees,
    });

    if (newIssue.data.html_url) {
      issueUrl = newIssue.data.html_url;
    }

    if (newIssue.data.number && addProjectLabel) {
      if (!quite) {
        info(`Adding project labels to issue: ${test.issueTitle}`);
      }

      try {
        await octokit.rest.issues.addLabels({
          owner,
          repo,
          issue_number: newIssue.data.number,
          labels: [test.projectName],
        });
      } catch (_) {
        error(`Failed to add project labels to issue: ${test.issueTitle}`);
      }
    }
  } catch (_) {
    error(`Failed to create issue: ${test.issueTitle}`);
  }

  return issueUrl;
};

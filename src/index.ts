import { readFile } from "fs/promises";
import { resolve } from "path";
import { JSONReport } from "./models";
import {
  createIssueBody,
  fileExists,
  getAllFailedTests,
  getLastResultError,
} from "./utils";
import { context, getOctokit } from "@actions/github";
import {
  debug,
  getBooleanInput,
  getInput,
  info,
  error,
  setFailed,
  summary,
} from "@actions/core";

const reportAnalyzer = async () => {
  // Action configuration
  const token = getInput("github-token");
  const reportPath = getInput("report-path", { required: true });
  const issuePrefix = getInput("issue-prefix");
  const issueLabels = getInput("issue-labels")
    ? getInput("issue-labels").split(",")
    : [];
  const issueFooter =
    getInput("issue-footer") ||
    `> This issue was created by the Playwright issue creator action.`;
  const addProjectLabel = getInput("add-project-label")
    ? getBooleanInput("add-project-label")
    : false;
  const addComment = getInput("add-comment")
    ? getBooleanInput("add-comment")
    : false;
  const createSummary = getInput("job-summary")
    ? getBooleanInput("job-summary")
    : true;
  const quite = getInput("quite") ? getBooleanInput("quite") : false;

  // Debug configuration
  debug(`report-path: ${reportPath}`);
  debug(`issue-prefix: ${issuePrefix}`);
  debug(`issue-labels: ${issueLabels.join(",")}`);
  debug(`issue-footer: ${issueFooter}`);
  debug(`add-project-label: ${addProjectLabel}`);
  debug(`add-comment: ${addComment}`);

  if (!token) {
    throw new Error("github-token is not set");
  }

  const octokit = getOctokit(token);
  const {
    repo: { owner, repo },
  } = context;
  if (!owner || !repo) {
    throw new Error("Failed to get owner and repo");
  }

  // Start path
  const cwd = process.cwd();

  // Retrieve the report file
  const absReportPath = resolve(cwd, reportPath);
  if (!(await fileExists(absReportPath))) {
    throw new Error(`Report file not found: ${absReportPath}`);
  }
  const file = await readFile(absReportPath, "utf8");

  let report: JSONReport | undefined;
  try {
    report = JSON.parse(file);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse report file: ${error.message}`);
    }
  }
  if (!report) {
    throw new Error("Failed to parse report file");
  }

  const allFailedTests = getAllFailedTests(report);
  if (!quite) {
    info(`Total failed tests: ${allFailedTests.length}`);
  }

  // Get all issues
  const issues = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open", // Only open issues
  });

  const failedTestInfo = allFailedTests
    .map(({ specTitle, suiteTilte, file, test }) => {
      const lastResult = getLastResultError(test);
      return {
        title: `${
          issuePrefix ? `${issuePrefix} ` : ""
        }${suiteTilte} - ${specTitle} (${test.projectName})`,
        file: file,
        projectName: test.projectName,
        annotations: test.annotations,
        retries: (test.results || []).length,
        error: lastResult,
      };
    })
    .filter(
      // Filter out the unique titles
      (failedTest, index, self) =>
        index === self.findIndex((t) => t.title === failedTest.title)
    );

  let comments: string[] = [];
  let newIssues: string[] = [];
  for (const failedTest of failedTestInfo) {
    const issue = issues.data.find((issue) => issue.title === failedTest.title);

    // Check if the test is already reported
    if (issue) {
      // Add a comment to the issue
      if (!addComment) {
        continue;
      }

      if (!quite) {
        info(`Adding comment to issue: ${failedTest.title}`);
      }

      try {
        const comment = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: issue.number,
          body: createIssueBody(failedTest, issueFooter),
        });

        if (comment.data.html_url) {
          comments.push(comment.data.html_url);
        }
      } catch (_) {
        error(`Failed to add comment to issue: ${failedTest.title}`);
      }
    } else {
      // Create a new issue
      if (!quite) {
        info(`Creating issue: ${failedTest.title}`);
      }

      try {
        const newIssue = await octokit.rest.issues.create({
          owner,
          repo,
          title: failedTest.title,
          labels: issueLabels,
          body: createIssueBody(failedTest, issueFooter),
        });

        if (newIssue.data.html_url) {
          comments.push(newIssue.data.html_url);
        }

        if (newIssue.data.number && addProjectLabel) {
          if (!quite) {
            info(`Adding project labels to issue: ${failedTest.title}`);
          }

          try {
            await octokit.rest.issues.addLabels({
              owner,
              repo,
              issue_number: newIssue.data.number,
              labels: [failedTest.projectName],
            });
          } catch (_) {
            error(`Failed to add project labels to issue: ${failedTest.title}`);
          }
        }
      } catch (_) {
        error(`Failed to create issue: ${failedTest.title}`);
      }
    }
  }

  if (createSummary) {
    if (newIssues.length > 0) {
      summary.addHeading("New Issues", 2);
      summary.addList(newIssues);
    }

    if (comments.length > 0) {
      summary.addHeading("Issue comments", 2);
      summary.addList(comments);
    }

    await summary.write();
  }
};

const run = async () => {
  try {
    await reportAnalyzer();
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
};

run();

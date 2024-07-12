import { readFile } from "fs/promises";
import { resolve } from "path";
import { FailedTestInfo, JSONReport } from "./models";
import {
  createComment,
  createList,
  createNewIssue,
  fileExists,
  getAllFailedTests,
  getConfiguration,
  getLastResultError,
} from "./utils";
import { context, getOctokit } from "@actions/github";
import { info, setFailed, summary } from "@actions/core";

const reportAnalyzer = async () => {
  // Action configuration
  const {
    addComment,
    addProjectLabel,
    createSummary,
    issueAssignees,
    issueFooter,
    issueLabels,
    issuePrefix,
    quite,
    reportPath,
    token,
  } = getConfiguration();

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

  const failedTestInfo: FailedTestInfo[] = allFailedTests
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
      const commentUrl = await createComment(
        octokit,
        owner,
        repo,
        issue.number,
        failedTest,
        addComment,
        issueFooter,
        quite
      );
      if (commentUrl) {
        comments.push(commentUrl);
      }
    } else {
      const issueUrl = await createNewIssue(
        octokit,
        owner,
        repo,
        failedTest,
        issueLabels,
        issueFooter,
        issueAssignees,
        addProjectLabel,
        quite
      );
      if (issueUrl) {
        newIssues.push(issueUrl);
      }
    }
  }

  if (createSummary) {
    if (newIssues.length > 0) {
      summary.addHeading("New Issues", 2);
      summary.addRaw(createList(newIssues));
    }

    if (comments.length > 0) {
      summary.addHeading("Issue comments", 2);
      summary.addRaw(createList(comments));
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

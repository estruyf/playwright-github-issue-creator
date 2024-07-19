import { context } from "@actions/github";
import Convert from "ansi-to-html";
import { TestInfo } from "models";

export const createIssueBody = (test: TestInfo, issueFooter?: string) => {
  const convert = new Convert();

  const body: string[] = [];

  if (test.error?.location) {
    body.push(`| File | Project | Location | Retries |`);
    body.push(`| --- | --- | --- | --- |`);
    body.push(
      `| ${test.file} | ${test.projectName} | \`${test.error.location.file}#${test.error.location.line}\` | ${test.retries} |`
    );
  } else {
    body.push(`| File | Project | Retries |`);
    body.push(`| --- | --- | --- |`);
    body.push(`| ${test.file} | ${test.projectName} | ${test.retries} |`);
  }

  body.push("");

  if (test.annotations.length) {
    body.push("## Annotations");
    body.push("");
    body.push(
      test.annotations.map((a) => `- ${a.type}: ${a.description}`).join("\n")
    );
    body.push("");
  }

  if (test.error?.message) {
    body.push("## Error details");
    body.push("");
    body.push(convert.toHtml(test.error.message));
  }

  const {
    repo: { owner, repo },
    runId,
    serverUrl,
  } = context;
  if (serverUrl && runId && owner && repo) {
    body.push("");
    body.push(
      `[View workflow run](${serverUrl}/${owner}/${repo}/actions/runs/${runId})`
    );
  }

  if (issueFooter) {
    body.push("");
    body.push(issueFooter);
  }

  return body.join("\n");
};

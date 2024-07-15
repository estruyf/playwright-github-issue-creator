import { JSONReport, JSONReportSuite, TestInfo } from "../models";
import { createIssueTitle, getLastResultError } from ".";

export const getAllTests = (report: JSONReport, issuePrefix?: string) => {
  const tests: TestInfo[] = [];

  const addTests = (suite: JSONReportSuite) => {
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        const lastResult = getLastResultError(test);

        tests.push({
          file: suite.file,
          issueTitle: createIssueTitle(
            suite.title,
            spec.title,
            test.projectName,
            issuePrefix
          ),
          suiteTilte: suite.title,
          specTitle: spec.title,
          failed:
            test.status !== test.expectedStatus && test.status === "unexpected",
          projectName: test.projectName,
          annotations: test.annotations,
          error: lastResult,
          retries: test.results.length,
          test,
        });
      }
    }
    if (suite.suites) {
      for (const childSuite of suite.suites) {
        addTests(childSuite);
      }
    }
  };

  for (const suite of report.suites) {
    addTests(suite);
  }

  return tests;
};

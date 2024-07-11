import { JSONReport, JSONReportSuite, JSONReportTest } from "../models";

export const getAllTests = (report: JSONReport) => {
  const tests: {
    file: string;
    suiteTilte: string;
    specTitle: string;
    test: JSONReportTest;
  }[] = [];

  const addTests = (suite: JSONReportSuite) => {
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        tests.push({
          file: suite.file,
          suiteTilte: suite.title,
          specTitle: spec.title,
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

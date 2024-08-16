import { JSONReportTest } from "models";

export const getLastResultError = (test: JSONReportTest) => {
  if (!test.results || !test.results.length) {
    return;
  }

  const lastResult = test.results[test.results.length - 1];
  if (!lastResult) {
    return;
  }

  return lastResult;
};

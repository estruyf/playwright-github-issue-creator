import { JSONReport } from "models";
import { getAllTests } from ".";

export const getAllFailedTests = (report: JSONReport) => {
  const allTests = getAllTests(report);

  const unexpected = allTests.filter(
    ({ test }) =>
      test.status !== test.expectedStatus && test.status === "unexpected"
  );

  return unexpected;
};

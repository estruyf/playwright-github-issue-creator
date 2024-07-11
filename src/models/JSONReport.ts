import { TestError, TestStatus } from ".";

/**
 * Source: https://github.com/microsoft/playwright/blob/main/packages/playwright/types/testReporter.d.ts
 */
export interface JSONReport {
  suites: JSONReportSuite[];
  errors: TestError[];
  stats: {
    startTime: string; // Date in ISO 8601 format.
    duration: number; // In milliseconds;
    expected: number;
    unexpected: number;
    flaky: number;
    skipped: number;
  };
}

export interface JSONReportSuite {
  title: string;
  file: string;
  column: number;
  line: number;
  specs: JSONReportSpec[];
  suites?: JSONReportSuite[];
}

export interface JSONReportSpec {
  tags: string[];
  title: string;
  ok: boolean;
  tests: JSONReportTest[];
  id: string;
  file: string;
  line: number;
  column: number;
}

export interface JSONReportTest {
  timeout: number;
  annotations: TestAnnotation[];
  expectedStatus: TestStatus;
  projectName: string;
  projectId: string;
  results: JSONReportTestResult[];
  status: "skipped" | "expected" | "unexpected" | "flaky";
}

export interface TestAnnotation {
  type: string;
  description?: string;
}

export interface JSONReportError {
  message: string;
  location?: Location;
}

export interface JSONReportTestResult {
  workerIndex: number;
  status: TestStatus | undefined;
  duration: number;
  error: TestError | undefined;
  errors: JSONReportError[];
  stdout: JSONReportSTDIOEntry[];
  stderr: JSONReportSTDIOEntry[];
  retry: number;
  steps?: JSONReportTestStep[];
  startTime: string; // Date in ISO 8601 format.
  attachments: {
    name: string;
    path?: string;
    body?: string;
    contentType: string;
  }[];
  errorLocation?: Location;
}

export interface JSONReportTestStep {
  title: string;
  duration: number;
  error: TestError | undefined;
  steps?: JSONReportTestStep[];
}

export type JSONReportSTDIOEntry = { text: string } | { buffer: string };

export interface Location {
  /**
   * Column number in the source file.
   */
  column: number;

  /**
   * Path to the source file.
   */
  file: string;

  /**
   * Line number in the source file.
   */
  line: number;
}

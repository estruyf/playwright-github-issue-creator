import { JSONReportTest, TestAnnotation } from "./JSONReport";
import { TestError } from "./TestError";

export interface TestInfo {
  issueTitle: string;
  suiteTilte: string;
  specTitle: string;
  file: string;
  projectName: string;
  annotations: TestAnnotation[];
  retries: number;
  failed: boolean;
  error: TestError | undefined;
  attachments: TestAttachment[];
  test: JSONReportTest;
}

export interface TestAttachment {
  name: string;
  path?: string;
  body?: string;
  contentType: string;
}

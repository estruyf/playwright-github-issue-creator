import { TestAnnotation } from "./JSONReport";
import { TestError } from "./TestError";

export interface FailedTestInfo {
  title: string;
  file: string;
  projectName: string;
  annotations: TestAnnotation[];
  retries: number;
  error: TestError | undefined;
}

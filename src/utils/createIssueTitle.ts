export const createIssueTitle = (
  suiteTilte: string,
  specTitle: string,
  projectName: string,
  issuePrefix?: string
) => {
  return `${
    issuePrefix ? `${issuePrefix} ` : ""
  }${suiteTilte} - ${specTitle} (${projectName})`;
};

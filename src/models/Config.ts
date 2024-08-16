export interface Config {
  token: string;
  reportPath: string;
  issuePrefix: string;
  issueLabels: string[];
  issueAssignees: string[];
  issueFooter: string;
  addProjectLabel: boolean;
  addComment: boolean;
  closeOnSuccess: boolean;
  closeOnSuccessMsg: string;
  createSummary: boolean;
  azureContainerSas: string;
  azureContainerUrl: string;
  quite: boolean;
}

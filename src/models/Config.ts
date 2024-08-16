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
  azureContainerSas?: string;
  azureContainerUrl?: string;
  s3BucketName?: string;
  s3BucketRegion?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  quite: boolean;
}

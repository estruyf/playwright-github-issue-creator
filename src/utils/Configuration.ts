import { debug, getBooleanInput, getInput } from "@actions/core";
import { VARIABLES } from "../constants";
import { Config } from "../models";

export class Configuration {
  private static _config: Config;

  public static initialize() {
    const token = getInput(VARIABLES.githubToken);
    const reportPath = getInput(VARIABLES.reportPath, { required: true });
    const issuePrefix = getInput(VARIABLES.issuePrefix);
    const azureContainerSas = getInput(VARIABLES.azureContainerSas);
    const azureContainerUrl = getInput(VARIABLES.azureContainerUrl);
    const s3AccessKey = getInput(VARIABLES.s3AccessKey);
    const s3BucketName = getInput(VARIABLES.s3BucketName);
    const s3BucketRegion = getInput(VARIABLES.s3BucketRegion);
    const s3SecretKey = getInput(VARIABLES.s3SecretKey);
    const issueLabels: string[] = getInput(VARIABLES.issueLabels)
      ? getInput(VARIABLES.issueLabels)
          .split(",")
          .map((label) => label.trim())
      : [];
    const issueAssignees: string[] = getInput(VARIABLES.issueAssignees)
      ? getInput(VARIABLES.issueAssignees)
          .split(",")
          .map((label) => label.trim())
      : [];
    const issueFooter =
      getInput(VARIABLES.issueFooter) ||
      `> This issue was created by the Playwright Issue Creator action.`;
    const addProjectLabel = getInput(VARIABLES.addProjectLabel)
      ? getBooleanInput(VARIABLES.addProjectLabel)
      : false;
    const addComment = getInput(VARIABLES.addComment)
      ? getBooleanInput(VARIABLES.addComment)
      : false;
    const createSummary = getInput(VARIABLES.jobSummary)
      ? getBooleanInput(VARIABLES.jobSummary)
      : true;
    const closeOnSuccess = getInput(VARIABLES.closeOnSuccess)
      ? getBooleanInput(VARIABLES.closeOnSuccess)
      : true;
    const closeOnSuccessMsg =
      getInput(VARIABLES.closeOnSuccessMsg) ||
      "This issue was automatically closed after the test passed.";
    const quite = getInput(VARIABLES.quite)
      ? getBooleanInput(VARIABLES.quite)
      : false;

    // Debug configuration
    debug(`${VARIABLES.reportPath}: ${reportPath}`);
    debug(`${VARIABLES.issuePrefix}: ${issuePrefix}`);
    debug(`${VARIABLES.issueLabels}: ${issueLabels.join(",")}`);
    debug(`${VARIABLES.issueAssignees}: ${issueAssignees.join(",")}`);
    debug(`${VARIABLES.issueFooter}: ${issueFooter}`);
    debug(`${VARIABLES.addProjectLabel}: ${addProjectLabel}`);
    debug(`${VARIABLES.addComment}: ${addComment}`);
    debug(`${VARIABLES.closeOnSuccess}: ${closeOnSuccess}`);
    debug(`${VARIABLES.closeOnSuccessMsg}: ${closeOnSuccessMsg}`);
    debug(`${VARIABLES.jobSummary}: ${createSummary}`);
    debug(`${VARIABLES.azureContainerUrl}: ${azureContainerUrl}`);
    debug(
      `${VARIABLES.azureContainerSas}: ${
        azureContainerSas ? "*****" : "NOT DEFINED"
      }`
    );
    debug(`${VARIABLES.s3AccessKey}: ${s3AccessKey}`);
    debug(`${VARIABLES.s3BucketName}: ${s3BucketName}`);
    debug(`${VARIABLES.s3BucketRegion}: ${s3BucketRegion}`);
    debug(`${VARIABLES.s3SecretKey}: ${s3SecretKey ? "*****" : "NOT DEFINED"}`);
    debug(`${VARIABLES.quite}: ${quite}`);

    this._config = {
      token,
      reportPath,
      issuePrefix,
      issueLabels,
      issueAssignees,
      issueFooter,
      addProjectLabel,
      addComment,
      closeOnSuccess,
      closeOnSuccessMsg,
      createSummary,
      azureContainerSas,
      azureContainerUrl,
      s3AccessKey,
      s3BucketName,
      s3BucketRegion,
      s3SecretKey,
      quite,
    };
  }

  public static get config() {
    return this._config;
  }
}

import { readFile } from "fs/promises";
import { resolve } from "path";

(async () => {
  const readme = await readFile(resolve(process.cwd(), "README.md"), "utf8");
  const action = await readFile(resolve(process.cwd(), "action.yml"), "utf8");
  const variablesText = await readFile(resolve(process.cwd(), "src/constants/variables.ts"), "utf8");

  // Get all the variable names
  const variables = variablesText.match(/export const VARIABLES = {([\s\S]*?)}/)[1]
    .split("\n")
    .filter((line) => line.includes(":"))
    .map((line) => line.split(":")[1].trim())
    .map((line) => line.replace(/"/g, ""))
    .map((line) => line.replace(/,/g, ""));

  // Check if all the variables are in the README
  let readMeNotIncluded = [];
  for (const variable of variables) {
    if (!readme.includes(`\`${variable}\``)) {
      readMeNotIncluded.push(variable);
    }
  }

  // Check if all the variables are in the action.yml
  let actionNotIncluded = [];
  for (const variable of variables) {
    if (!action.includes(`${variable}:`)) {
      actionNotIncluded.push(variable);
    }
  }

  if (readMeNotIncluded.length > 0) {
    console.error("The following variables are not included in the README:");
    console.error(readMeNotIncluded.join(", "));
  }

  if (actionNotIncluded.length > 0) {
    console.error("The following variables are not included in the action.yml:");
    console.error(actionNotIncluded.join(", "));
  }

  if (readMeNotIncluded.length > 0 || actionNotIncluded.length > 0) {
    process.exit(1);
  }
})();
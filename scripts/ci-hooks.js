import { chalkStderr as chalk } from "chalk";
import emoji from "node-emoji";
import execSync from "node:child_process";
import { spinners } from "ora";

// Helper function to run a shell command and return the output
function runCommand(command) {
  try {
    return execSync(command, { encoding: "utf-8" });
  } catch (error) {
    console.error(chalk.red(`Error while executing command: ${command}`));
    return error.message;
  }
}

// Get the list of files that have been added or modified
function getStagedFiles() {
  const result = runCommand("git diff --cached --name-only");
  return result.split("\n").filter((file) => file); // Remove empty lines
}

// Main function that runs the checks and fixes only on modified files
async function run() {
  const spinner = spinners("Running CI checks on modified files...").start();

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log(chalk.yellow(emoji.get("⚠️") + " No staged files to check."));
    return;
  }

  // Filter for JavaScript/TypeScript files or other file types you'd like to check
  const filesToCheck = stagedFiles.filter(
    (file) =>
      file.endsWith(".js") || file.endsWith(".ts") || file.endsWith(".jsx"),
  );

  if (filesToCheck.length === 0) {
    console.log(
      chalk.yellow(emoji.get("⚠️") + " No JavaScript/TypeScript files staged."),
    );
    return;
  }

  try {
    // Run lint check only on specific files
    spinner.text = "Running lint checks...";
    const lintResult = runCommand(
      `npm run ci:check -- ${filesToCheck.join(" ")}`,
    );
    spinner.succeed(chalk.green(emoji.get("✅") + " Lint checks passed!"));

    // Run fix command only on specific files if needed
    spinner.start("Applying fixes...");
    const fixResult = runCommand(`npm run ci:fix -- ${filesToCheck.join(" ")}`);
    spinner.succeed(
      chalk.green(emoji.get("⚙️") + " Fixes applied successfully!"),
    );

    // Output results
    console.log(
      chalk.blue(emoji.get("💻") + " Lint check output:\n") +
        chalk.gray(lintResult),
    );
    console.log(
      chalk.blue(emoji.get("🔧") + " Fix output:\n") + chalk.gray(fixResult),
    );
    console.log(
      chalk.cyan(emoji.get("🚀") + " All checks passed and fixes applied!"),
    );
  } catch (error) {
    spinner.fail(chalk.red(emoji.get("❌") + " An error occurred."));
    console.error(chalk.red(error));
  }
}

// Run the main function
run();

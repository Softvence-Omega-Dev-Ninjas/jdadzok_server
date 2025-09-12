const fs = require("fs");
const path = require("path");

const envFilePath = path.resolve(__dirname, "../.env");
const actionFilePath = path.resolve(
  __dirname,
  "../.github/actions/setup-and-load-env/action.yml",
);
const workflowFilePath = path.resolve(
  __dirname,
  "../.github/workflows/setup-environement-variable.yml",
);

function parseEnv(filePath) {
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const envVars = {};
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    envVars[key.trim()] = rest
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return envVars;
}

function updateActionYml(envVars) {
  const lines = fs.readFileSync(actionFilePath, "utf-8").split("\n");
  const updatedLines = [];
  let inInputs = false;
  let inEnvBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Replace the inputs block
    if (line.trim() === "inputs:") {
      inInputs = true;
      updatedLines.push("inputs:");
      for (const key of Object.keys(envVars)) {
        updatedLines.push(`  ${key}:`);
        updatedLines.push(`    description: "${key}"`);
        updatedLines.push(`    required: true`);
      }
      // Skip old input lines
      while (++i < lines.length && lines[i].startsWith("  "));
      i--; // backtrack one line
      continue;
    }

    // Replace the cat <<EOF > .env block
    if (line.includes("cat <<EOF > .env")) {
      inEnvBlock = true;
      updatedLines.push("        cat <<EOF > .env");
      for (const key of Object.keys(envVars)) {
        updatedLines.push(`        ${key}=\${{ inputs.${key} }}`);
      }
      updatedLines.push("        EOF");
      // Skip until end of old block
      while (++i < lines.length && !lines[i].includes("EOF")) {}
      continue;
    }

    if (!inInputs && !inEnvBlock) {
      updatedLines.push(line);
    }
  }

  fs.writeFileSync(actionFilePath, updatedLines.join("\n"), "utf-8");
  console.log("✅ Updated action.yml");
}

function updateWorkflowYml(envVars) {
  const lines = fs.readFileSync(workflowFilePath, "utf-8").split("\n");
  const updatedLines = [];

  let inSecrets = false;
  let inWith = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Replace secrets block
    if (line.trim().startsWith("secrets:")) {
      inSecrets = true;
      updatedLines.push("      secrets:");
      for (const key of Object.keys(envVars)) {
        updatedLines.push(`        ${key}:`);
        updatedLines.push(`          required: true`);
      }
      // Skip old secrets
      while (++i < lines.length && lines[i].startsWith("        ")) {}
      i--; // backtrack one line
      continue;
    }

    // Replace with: block
    if (line.trim().startsWith("with:")) {
      inWith = true;
      updatedLines.push("        with:");
      for (const key of Object.keys(envVars)) {
        updatedLines.push(`          ${key}: \${{ secrets.${key} }}`);
      }
      // Skip old with lines
      while (++i < lines.length && lines[i].startsWith("          ")) {}
      i--; // backtrack
      continue;
    }

    if (!inSecrets && !inWith) {
      updatedLines.push(line);
    }
  }

  fs.writeFileSync(workflowFilePath, updatedLines.join("\n"), "utf-8");
  console.log("✅ Updated setup-environement-variable.yml");
}

function main() {
  const envVars = parseEnv(envFilePath);
  if (Object.keys(envVars).length === 0) {
    console.error("❌ No environment variables found in .env file");
    process.exit(1);
  }

  updateActionYml(envVars);
  updateWorkflowYml(envVars);
  console.log("🎉 All files synced successfully!");
}

main();

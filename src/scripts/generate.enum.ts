import {
  applicationStatus,
  authProvider,
  capLevel,
  chatType,
  feelings,
  mediaType,
  messageStatus,
  notificationType,
  orderStatus,
  paymentMethod,
  payOutStatus,
  postVisibility,
  reportStatus,
  reportTargetType,
  role,
  subscriptionStatus,
  volunteerStatus,
} from "@constants/enums";
import { capitalize } from "@project/utils";
import fs from "fs";
import path from "path";

const enums: Record<string, readonly string[]> = {
  role,
  authProvider,
  capLevel,
  mediaType,
  postVisibility,
  volunteerStatus,
  applicationStatus,
  orderStatus,
  paymentMethod,
  notificationType,
  reportTargetType,
  reportStatus,
  chatType,
  messageStatus,
  payOutStatus,
  subscriptionStatus,
  feelings,
};

function generateEnumBlock<V>(name: string, values: readonly V[]) {
  return `enum ${capitalize(name)} {\n  ${values.join("\n  ")}\n}`;
}

function generateAllEnumBlocks() {
  return Object.entries(enums)
    .map(([name, values]) => generateEnumBlock(capitalize(name), values))
    .join("\n\n");
}

function injectEnumsIntoSchema(schemaPath: string) {
  const schema = fs.readFileSync(schemaPath, "utf-8");

  const startTag = "// ENUMS_START";
  const endTag = "// ENUMS_END";

  const beforeEnums = schema.split(startTag)[0];
  const afterEnums = schema.includes(endTag) ? schema.split(endTag)[1] : "";

  const enumBlocks = generateAllEnumBlocks();

  const newSchema = `${beforeEnums}${startTag}\n\n${enumBlocks}\n\n${endTag}${afterEnums}`;

  fs.writeFileSync(schemaPath, newSchema.trim() + "\n", "utf-8");
  // eslint-disable-next-line
  console.log("✅ Prisma enums injected successfully into schema.prisma");
}

// Run it
const schemaPath = path.join(process.cwd(), "prisma", "models", "enum.prisma");
if (!fs.existsSync(schemaPath)) {
  console.error("❌ enum.prisma not found at prisma/models/enum.prisma");
  process.exit(1);
}

injectEnumsIntoSchema(schemaPath);

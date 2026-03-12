import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const templateSpecs = [
  {
    subjectKey: "mailer_subjects_confirmation",
    contentKey: "mailer_templates_confirmation_content",
    subject: "Confirm your HalaSaves account",
    file: "confirmation.html",
  },
  {
    subjectKey: "mailer_subjects_magic_link",
    contentKey: "mailer_templates_magic_link_content",
    subject: "Your HalaSaves sign-in link",
    file: "magic-link.html",
  },
  {
    subjectKey: "mailer_subjects_recovery",
    contentKey: "mailer_templates_recovery_content",
    subject: "Reset your HalaSaves password",
    file: "recovery.html",
  },
];

async function readTemplate(fileName) {
  const templatePath = join(projectRoot, "supabase", "templates", "auth", fileName);
  return readFile(templatePath, "utf8");
}

async function buildPayload() {
  const payload = {};

  for (const spec of templateSpecs) {
    payload[spec.subjectKey] = spec.subject;
    payload[spec.contentKey] = await readTemplate(spec.file);
  }

  return payload;
}

function isApplyMode() {
  return process.argv.includes("--apply");
}

function printDryRunSummary(payload) {
  const summary = templateSpecs.map((spec) => ({
    template: spec.file,
    subject: payload[spec.subjectKey],
    htmlLength: payload[spec.contentKey].length,
  }));

  console.log("Dry run complete. Templates loaded:");
  console.table(summary);
  console.log("\nRun with --apply to push templates to Supabase.");
}

async function updateSupabase(payload) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  if (!accessToken || !projectRef) {
    throw new Error(
      "Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF environment variable.",
    );
  }

  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Supabase API request failed with ${response.status} ${response.statusText}: ${text}`,
    );
  }
}

async function main() {
  const payload = await buildPayload();

  if (!isApplyMode()) {
    printDryRunSummary(payload);
    return;
  }

  await updateSupabase(payload);
  console.log("Supabase auth email templates updated successfully.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram";

// ── Seed-user check (cached per request) ─────────────────────

const seedCache = new Map<string, boolean>();

async function isSeedUser(userId: string): Promise<boolean> {
  if (seedCache.has(userId)) return seedCache.get(userId)!;

  const admin = createAdminClient();
  const { data } = await admin
    .from("seed_accounts")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  const isSeed = !!data;
  seedCache.set(userId, isSeed);
  return isSeed;
}

// ── Helpers ──────────────────────────────────────────────────

function getNotifyGroupId(): string | undefined {
  return process.env.TELEGRAM_NOTIFY_GROUP_ID;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stringifyFieldValue(key: string, value: unknown): string {
  if (/(password|token|secret|cookie|authorization)/i.test(key)) {
    return "[redacted]";
  }

  if (value === null || value === undefined) return "-";

  let text: string;
  if (typeof value === "string") {
    text = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    text = String(value);
  } else {
    try {
      text = JSON.stringify(value);
    } catch {
      text = String(value);
    }
  }

  const trimmed = text.trim();
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
}

async function getUsername(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  return data?.username ?? "unknown";
}

// ── Public notification functions ────────────────────────────

export async function notifyDealPosted(
  userId: string,
  dealTitle: string
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId || (await isSeedUser(userId))) return;

  const username = await getUsername(userId);

  await sendTelegramMessage(
    groupId,
    `📦 <b>New deal posted</b>\n\n👤 ${username}\n🏷️ ${dealTitle}`
  );
}

export async function notifyCommentPosted(
  userId: string,
  dealId: string,
  commentPreview: string
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId || (await isSeedUser(userId))) return;

  const username = await getUsername(userId);

  await sendTelegramMessage(
    groupId,
    `💬 <b>New comment</b>\n\n👤 ${username}\n📝 ${commentPreview.slice(0, 200)}`
  );
}

export async function notifyDealVoted(
  userId: string,
  dealId: string,
  voteType: 1 | -1
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId || (await isSeedUser(userId))) return;

  const admin = createAdminClient();
  const { data: deal } = await admin
    .from("deals")
    .select("title")
    .eq("id", dealId)
    .single();

  const username = await getUsername(userId);
  const emoji = voteType === 1 ? "👍" : "👎";

  await sendTelegramMessage(
    groupId,
    `${emoji} <b>Deal ${voteType === 1 ? "upvoted" : "downvoted"}</b>\n\n👤 ${username}\n🏷️ ${deal?.title ?? dealId}`
  );
}

export async function notifyAnonymousDealVoted(
  dealId: string,
  voteType: 1 | -1
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId) return;

  const admin = createAdminClient();
  const { data: deal } = await admin
    .from("deals")
    .select("title")
    .eq("id", dealId)
    .single();

  const emoji = voteType === 1 ? "👍" : "👎";

  await sendTelegramMessage(
    groupId,
    `${emoji} <b>Deal ${voteType === 1 ? "upvoted" : "downvoted"}</b>\n\n👤 Anonymous visitor\n🏷️ ${deal?.title ?? dealId}`
  );
}

export async function notifyCommentVoted(
  userId: string,
  commentId: string,
  voteType: 1 | -1
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId || (await isSeedUser(userId))) return;

  const username = await getUsername(userId);
  const emoji = voteType === 1 ? "👍" : "👎";

  await sendTelegramMessage(
    groupId,
    `${emoji} <b>Comment ${voteType === 1 ? "upvoted" : "downvoted"}</b>\n\n👤 ${username}\n💬 Comment ${commentId.slice(0, 8)}`
  );
}

export async function notifyCouponSubmitted(
  userId: string,
  couponTitle: string
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId || (await isSeedUser(userId))) return;

  const username = await getUsername(userId);

  await sendTelegramMessage(
    groupId,
    `🎟️ <b>Coupon submitted</b>\n\n👤 ${username}\n🏷️ ${couponTitle}`
  );
}

export async function notifyUserSignedUp({
  userId,
  provider,
  email,
}: {
  userId: string;
  provider: string;
  email?: string | null;
}): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId) return;

  const username = await getUsername(userId);
  const identity = username !== "unknown" ? username : (email ?? "unknown");

  await sendTelegramMessage(
    groupId,
    `👋 <b>New signup on HalaSaves!</b>\n\n👤 ${escapeHtml(identity)}\n🔗 via ${escapeHtml(provider)}`
  );
}

export async function notifyFormSubmitted(
  formName: string,
  payload: Record<string, unknown>,
  userId?: string | null
): Promise<void> {
  const groupId = getNotifyGroupId();
  if (!groupId) return;

  let submitter = "Guest";
  if (userId) {
    submitter = await getUsername(userId);
  } else if (typeof payload.email === "string" && payload.email.trim()) {
    submitter = payload.email;
  }

  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  const visibleEntries = entries.slice(0, 8);
  const body =
    visibleEntries.length > 0
      ? visibleEntries
          .map(([key, value]) => {
            const safeKey = escapeHtml(key);
            const safeValue = escapeHtml(stringifyFieldValue(key, value));
            return `• <b>${safeKey}</b>: ${safeValue}`;
          })
          .join("\n")
      : "• No fields";

  const extraFields = entries.length - visibleEntries.length;
  const extraLine =
    extraFields > 0
      ? `\n• ...and ${extraFields} more field${extraFields === 1 ? "" : "s"}`
      : "";

  await sendTelegramMessage(
    groupId,
    `📝 <b>Form submitted</b>\n\n📄 ${escapeHtml(formName)}\n👤 ${escapeHtml(submitter)}\n\n${body}${extraLine}`
  );
}

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

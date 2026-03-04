"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Not authorized");

  return user;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type PushResult = {
  error?: string;
  messageId?: number;
};

export async function pushDealToTelegram(dealId: string): Promise<PushResult> {
  try {
    const user = await requireAdmin();
    const admin = createAdminClient();

    const { data: deal, error: dealError } = await admin
      .from("deals")
      .select("id, title, price, original_price, discount_percentage")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return { error: dealError?.message ?? "Deal not found" };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !chatId) {
      return { error: "Telegram is not configured" };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://halasaves.com";
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
    const dealUrl = `${normalizedBaseUrl}/deals/${deal.id}?utm_source=telegram&utm_medium=channel&utm_campaign=deal_push`;

    const priceLine =
      deal.price != null
        ? `💰 AED ${deal.price}${
            deal.discount_percentage
              ? ` (${deal.discount_percentage}% off)`
              : ""
          }`
        : deal.original_price != null
        ? `💰 AED ${deal.original_price}`
        : "";

    let text = `🔥 <b>${escapeHtml(deal.title)}</b>\n`;

    if (priceLine) {
      text += `\n${priceLine}\n`;
    }

    text += `\n👉 See the deal, upvote it & grab it before it's gone:\n${dealUrl}`;

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      }
    );

    if (!tgResponse.ok) {
      return { error: "Failed to send message to Telegram" };
    }

    const data = (await tgResponse.json()) as {
      ok: boolean;
      result?: { message_id: number };
      description?: string;
    };

    if (!data.ok) {
      return { error: data.description ?? "Failed to send message to Telegram" };
    }

    const messageId = data.result?.message_id;

    const { error: insertError } = await admin.from("telegram_pushes").insert({
      deal_id: deal.id,
      pushed_by: user.id,
      telegram_message_id: messageId ?? null,
    });

    if (insertError) {
      return {
        error: "Message sent to Telegram, but failed to record push",
      };
    }

    return { messageId: messageId ?? undefined };
  } catch (e) {
    return { error: (e as Error).message };
  }
}


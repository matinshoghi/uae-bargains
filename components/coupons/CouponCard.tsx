import Link from "next/link";
import { BadgeCheck, Clock, ExternalLink } from "lucide-react";
import { CopyCodeButton } from "@/components/coupons/CopyCodeButton";
import { CouponFeedback } from "@/components/coupons/CouponFeedback";
import type { CouponRow } from "@/lib/types";

function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  if (diffDays <= 30) return `Expires in ${diffDays} days`;
  return `Expires ${expiry.toLocaleDateString("en-AE", { month: "short", day: "numeric" })}`;
}

function DiscountBadge({ type, value }: { type: string; value: string | null }) {
  let label = value || "";
  switch (type) {
    case "percentage":
      label = value ? `${value}% OFF` : "% OFF";
      break;
    case "flat":
      label = value ? `AED ${value} OFF` : "AED OFF";
      break;
    case "bogo":
      label = "BOGO";
      break;
    case "free_shipping":
      label = "FREE SHIPPING";
      break;
    default:
      label = value || "DEAL";
  }

  return (
    <span className="inline-block rounded bg-foreground px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-background">
      {label}
    </span>
  );
}

export function CouponCard({
  coupon,
  storeSlug,
  userFeedback,
  expired = false,
}: {
  coupon: CouponRow;
  storeSlug: string;
  userFeedback?: boolean | null;
  expired?: boolean;
}) {
  const expiryText = formatExpiry(coupon.expires_at);
  const hasLink = !!(coupon.affiliate_url || coupon.url);

  return (
    <div className={`flex flex-col gap-3 rounded-xl border-2 border-border p-4 transition-colors ${expired ? "opacity-60" : "hover:border-foreground/20"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DiscountBadge type={coupon.discount_type} value={coupon.discount_value} />
          {expired && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
              Expired
            </span>
          )}
          {!expired && coupon.is_verified && (
            <span className="flex items-center gap-0.5 text-xs text-green-600">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
          {!expired && coupon.is_featured && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
              Featured
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold leading-tight">{coupon.title}</h3>
        {coupon.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {coupon.description}
          </p>
        )}
      </div>

      {coupon.min_purchase && (
        <p className="text-xs text-muted-foreground">
          Min. purchase: {coupon.min_purchase}
        </p>
      )}

      <div className="mt-auto flex items-center gap-3">
        {coupon.code && <CopyCodeButton code={coupon.code} />}

        {hasLink && (
          <Link
            href={`/go/${storeSlug}/${coupon.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={coupon.code
              ? "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              : "flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            }
          >
            Get Deal
            <ExternalLink className={coupon.code ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </Link>
        )}
      </div>

      {!expired && expiryText && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {expiryText}
        </div>
      )}

      {!expired && (
        <CouponFeedback
          couponId={coupon.id}
          successCount={coupon.success_count}
          failCount={coupon.fail_count}
          userFeedback={userFeedback ?? null}
        />
      )}
    </div>
  );
}

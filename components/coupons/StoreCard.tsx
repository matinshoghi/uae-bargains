import Link from "next/link";
import type { StoreWithCouponCount } from "@/lib/types";
import { getOptimizedImageUrl } from "@/lib/image-loader";

export function StoreCard({ store }: { store: StoreWithCouponCount }) {
  return (
    <Link
      href={`/coupons/${store.slug}`}
      className="group flex flex-col items-center gap-3 border-[1.5px] border-[#e4e3dd] bg-card p-5 text-center transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:border-primary hover:shadow-[3px_3px_0_var(--primary)]"
    >
      {store.logo_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getOptimizedImageUrl(store.logo_url, { width: 96, quality: 80 })}
          alt={store.name}
          className="h-12 w-12 rounded-sm object-contain"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-lg font-bold text-muted-foreground">
          {store.name.charAt(0)}
        </div>
      )}
      <div>
        <h3 className="font-display font-semibold group-hover:text-foreground">{store.name}</h3>
        <p className="mt-0.5 font-mono-display text-[11px] text-muted-foreground">
          {store.coupon_count} {store.coupon_count === 1 ? "coupon" : "coupons"}
        </p>
      </div>
    </Link>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { DealCard } from "@/components/deals/DealCard";
import {
  fetchProfileByUsername,
  fetchUserStats,
  fetchUserDeals,
} from "@/lib/queries/profiles";
import { getUserDealVotes } from "@/lib/queries/deals";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfileByUsername(username);

  if (!profile) return { title: "User Not Found — UAE Bargains" };

  return {
    title: `${profile.display_name ?? profile.username} (@${profile.username})`,
    description: `View deals posted by ${profile.display_name ?? profile.username} on UAE Bargains.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await fetchProfileByUsername(username);

  if (!profile) notFound();

  const [stats, deals, { userVotes, isLoggedIn }] = await Promise.all([
    fetchUserStats(profile.id),
    fetchUserDeals(profile.id),
    getUserDealVotes(),
  ]);

  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile header */}
      <div className="mb-8 text-center">
        <UserAvatar
          src={profile.avatar_url}
          name={displayName}
          size="lg"
          className="mx-auto mb-3"
        />
        <h1 className="text-xl font-bold">{displayName}</h1>
        <p className="text-sm text-muted-foreground">
          @{profile.username} &middot; Member since{" "}
          {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
        </p>

        <div className="mt-4 flex justify-center gap-8 text-sm">
          <div>
            <span className="font-semibold">{stats.dealCount}</span>{" "}
            <span className="text-muted-foreground">deals posted</span>
          </div>
          <div>
            <span className="font-semibold">{stats.totalUpvotes}</span>{" "}
            <span className="text-muted-foreground">upvotes received</span>
          </div>
        </div>
      </div>

      {/* User's deals */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Their Deals</h2>
        {deals.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No deals posted yet.
          </p>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                userVote={(userVotes[deal.id] as 1 | -1) ?? null}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

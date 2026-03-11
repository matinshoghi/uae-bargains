import { getPlatformStats } from "@/lib/queries/platform-stats";
import { HeroContent } from "./HeroContent";

export async function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const stats = await getPlatformStats();
  return <HeroContent stats={stats} isLoggedIn={isLoggedIn} />;
}

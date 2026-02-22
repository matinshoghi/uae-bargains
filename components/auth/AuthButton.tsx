"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogOut, User, Settings } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Profile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export function AuthButton({ variant = "default" }: { variant?: "default" | "link" }) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, display_name, avatar_url")
          .eq("id", data.user.id)
          .single();
        setProfile(profileData as Profile | null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-sm bg-muted" />;
  }

  if (!user) {
    if (variant === "link") {
      return (
        <Link
          href="/login"
          className="font-display text-sm font-semibold text-foreground transition-colors duration-200 hover:text-muted-foreground"
        >
          Sign In
        </Link>
      );
    }
    return (
      <Button asChild variant="default" size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const displayName =
    profile?.display_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User";

  const avatarUrl =
    profile?.avatar_url ?? user.user_metadata?.avatar_url;

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-sm">
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="rounded-sm text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="font-display px-2 py-1.5 text-sm font-semibold">{displayName}</div>
        <DropdownMenuSeparator />
        {profile && (
          <DropdownMenuItem asChild>
            <Link href={`/user/${profile.username}`} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            toast.success("Signed out");
            router.refresh();
          }}
          className="flex items-center gap-2 text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

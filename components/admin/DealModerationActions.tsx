import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActiveView = "edit" | "comments";

interface DealModerationActionsProps {
  dealId: string;
  dealSlug: string | null;
  activeView: ActiveView;
}

export function DealModerationActions({
  dealId,
  dealSlug,
  activeView,
}: DealModerationActionsProps) {
  return (
    <nav
      aria-label="Deal moderation navigation"
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      <Button asChild size="sm" variant="outline">
        <Link href="/admin/moderation">
          <ArrowLeft className="h-3.5 w-3.5" />
          Moderation
        </Link>
      </Button>

      <Button asChild size="sm" variant={activeView === "edit" ? "default" : "outline"}>
        <Link
          href={`/admin/moderation/${dealId}/edit`}
          aria-current={activeView === "edit" ? "page" : undefined}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Deal
        </Link>
      </Button>

      <Button
        asChild
        size="sm"
        variant={activeView === "comments" ? "default" : "outline"}
      >
        <Link
          href={`/admin/deals/${dealId}/comments`}
          aria-current={activeView === "comments" ? "page" : undefined}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Moderate Comments
        </Link>
      </Button>

      {dealSlug && (
        <Button asChild size="sm" variant="secondary">
          <Link href={`/deals/${dealSlug}`}>
            <ExternalLink className="h-3.5 w-3.5" />
            View Deal
          </Link>
        </Button>
      )}
    </nav>
  );
}

"use client";

import { MoreHorizontal, Flag, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommentMenu({
  isAuthor,
}: {
  commentId: string;
  isAuthor: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Comment options"
          className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info("Report submitted")}>
          <Flag className="mr-2 h-4 w-4" />
          Report
        </DropdownMenuItem>
        {isAuthor && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Coming soon")}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => toast("Coming soon")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

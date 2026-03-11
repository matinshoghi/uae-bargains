"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, Clock, PackageX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDeal, markDealExpired, reactivateDeal } from "@/lib/actions/deals";
import { toast } from "sonner";

interface DealActionsProps {
  dealId: string;
  dealSlug: string;
  dealStatus: "active" | "expired" | "removed";
}

export function DealActions({ dealId, dealSlug, dealStatus }: DealActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteDeal(dealId);
    if (result?.error) {
      toast.error(result.error);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
    // On success, deleteDeal redirects to homepage
  }

  function handleMarkExpired(reason: "manual" | "out_of_stock") {
    startTransition(async () => {
      const result = await markDealExpired(dealId, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(reason === "out_of_stock" ? "Marked as out of stock" : "Marked as expired");
      }
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateDeal(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal reactivated");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Deal options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dealStatus === "active" && (
            <>
              <DropdownMenuItem onClick={() => router.push(`/deals/${dealSlug}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMarkExpired("manual")} disabled={isPending}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as Expired
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMarkExpired("out_of_stock")} disabled={isPending}>
                <PackageX className="mr-2 h-4 w-4" />
                Mark as Out of Stock
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {dealStatus === "expired" && (
            <>
              <DropdownMenuItem onClick={() => router.push(`/deals/${dealSlug}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReactivate} disabled={isPending}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivate Deal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This deal will be removed from the feed and will no longer be visible to others. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

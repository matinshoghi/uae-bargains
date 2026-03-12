"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, RotateCcw, Shield, PenOff, MessageSquare, Clock, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REMOVAL_REASONS } from "@/lib/constants";
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
import {
  removeDeal,
  restoreDeal,
  resetEditedFlag,
  adminExpireDeal,
  adminReactivateDeal,
} from "@/lib/actions/admin";
import { toast } from "sonner";

interface AdminDealActionsProps {
  dealId: string;
  dealStatus: "active" | "expired" | "removed";
  isRemoved: boolean;
  isEdited: boolean;
}

export function AdminDealActions({ dealId, dealStatus, isRemoved, isEdited }: AdminDealActionsProps) {
  const router = useRouter();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeDeal(dealId, removeReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal removed");
      }
      setShowRemoveDialog(false);
      setRemoveReason("");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreDeal(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal restored");
      }
    });
  }

  function handleExpire() {
    startTransition(async () => {
      const result = await adminExpireDeal(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal expired");
      }
    });
  }

  function handleMarkOutOfStock() {
    startTransition(async () => {
      const result = await adminExpireDeal(dealId, "out_of_stock");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Marked as out of stock");
      }
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await adminReactivateDeal(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal reactivated");
      }
    });
  }

  function handleResetEdited() {
    startTransition(async () => {
      const result = await resetEditedFlag(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Edited flag cleared");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Shield className="h-4 w-4" />
            <span className="sr-only">Admin actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/admin/moderation/${dealId}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Admin Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/deals/${dealId}/comments`)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Moderate Comments
          </DropdownMenuItem>
          {isEdited && (
            <DropdownMenuItem onClick={handleResetEdited} disabled={isPending}>
              <PenOff className="mr-2 h-4 w-4" />
              Clear Edited Flag
            </DropdownMenuItem>
          )}
          {dealStatus === "active" && (
            <>
              <DropdownMenuItem onClick={handleExpire} disabled={isPending}>
                <Clock className="mr-2 h-4 w-4" />
                Expire Deal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkOutOfStock} disabled={isPending}>
                <PackageX className="mr-2 h-4 w-4" />
                Mark as Out of Stock
              </DropdownMenuItem>
            </>
          )}
          {dealStatus === "expired" && (
            <DropdownMenuItem onClick={handleReactivate} disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reactivate Deal
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isRemoved ? (
            <DropdownMenuItem onClick={handleRestore} disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Deal
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setShowRemoveDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Deal
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              The deal will be hidden from the public feed. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium">Reason</label>
            <Select value={removeReason} onValueChange={setRemoveReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {REMOVAL_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

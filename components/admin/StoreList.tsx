"use client";

import { useState, useTransition } from "react";
import { deleteStore } from "@/lib/actions/coupons";
import { StoreForm } from "@/components/admin/StoreForm";
import type { StoreRow } from "@/lib/types";

export function StoreList({ stores }: { stores: StoreRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its coupons?`)) return;
    startTransition(async () => {
      const result = await deleteStore(id);
      if (result.error) alert(result.error);
    });
  }

  if (stores.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No stores yet. Add one above.</p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {stores.map((store) => (
        <div key={store.id} className="px-4 py-3">
          {editingId === store.id ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold">Editing: {store.name}</h3>
              <StoreForm
                store={store}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {store.logo_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={store.logo_url}
                      alt=""
                      className="h-6 w-6 rounded object-contain"
                    />
                  )}
                  <span className="font-medium">{store.name}</span>
                  <span className="text-xs text-muted-foreground">/{store.slug}</span>
                  {!store.is_active && (
                    <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">
                      Inactive
                    </span>
                  )}
                </div>
                {store.affiliate_network && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {store.affiliate_network}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingId(store.id)}
                  className="text-xs text-foreground hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(store.id, store.name)}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

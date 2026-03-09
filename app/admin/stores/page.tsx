import { fetchAllStoresAdmin } from "@/lib/queries/coupons";
import { StoreForm } from "@/components/admin/StoreForm";
import { StoreList } from "@/components/admin/StoreList";

export default async function AdminStoresPage() {
  const stores = await fetchAllStoresAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Stores</h1>
      <p className="mt-2 text-muted-foreground">
        Manage stores for the coupons section.
      </p>

      <div className="mt-6 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Add Store
        </h2>
        <div className="mt-4">
          <StoreForm />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          All Stores ({stores.length})
        </h2>
        <div className="mt-4">
          <StoreList stores={stores} />
        </div>
      </div>
    </div>
  );
}

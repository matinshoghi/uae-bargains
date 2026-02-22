import { fetchSeedUsers } from "@/lib/queries/seed";
import { SeedUserForm } from "@/components/admin/SeedUserForm";
import { SeedUserList } from "@/components/admin/SeedUserList";

export default async function SeedUsersPage() {
  const users = await fetchSeedUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold">Seed Users</h1>
      <p className="mt-2 text-muted-foreground">
        Create and manage seed accounts. These are real users that appear
        indistinguishable from organic sign-ups.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Create Seed User</h2>
        <div className="mt-4 rounded-xl border border-border p-6">
          <SeedUserForm />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          All Seed Users{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({users.length})
          </span>
        </h2>
        <div className="mt-4">
          <SeedUserList users={users} />
        </div>
      </section>
    </div>
  );
}

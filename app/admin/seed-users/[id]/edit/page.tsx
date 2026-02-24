import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchSeedUser } from "@/lib/queries/seed";
import { SeedUserEditForm } from "@/components/admin/SeedUserEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSeedUserPage({ params }: Props) {
  const { id } = await params;
  const user = await fetchSeedUser(id);

  if (!user) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/seed-users"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Seed Users
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Edit Seed User</h1>
      <p className="mt-2 text-muted-foreground">
        Edit profile details and join date for @{user.profiles.username}.
      </p>

      <div className="mt-8 max-w-lg">
        <SeedUserEditForm user={user} />
      </div>
    </div>
  );
}

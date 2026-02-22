import { fetchAllBanners } from "@/lib/queries/banners";
import { BannerForm } from "@/components/admin/BannerForm";
import { BannerList } from "@/components/admin/BannerList";

export default async function AdminBannersPage() {
  const banners = await fetchAllBanners();

  return (
    <div>
      <h1 className="text-2xl font-bold">Hero Banners</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload banners that display at the top of the home page. Design your
        banners in Figma or Canva and upload the final images here.
      </p>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Add New Banner</h2>
        <div className="mt-4">
          <BannerForm />
        </div>
      </div>

      <hr className="my-8" />

      <div>
        <h2 className="text-lg font-semibold">
          All Banners{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({banners.length})
          </span>
        </h2>
        <div className="mt-4">
          <BannerList banners={banners} />
        </div>
      </div>
    </div>
  );
}

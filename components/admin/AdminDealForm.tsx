"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/deals/MarkdownEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminEditDeal, adminUploadDealImage, adminRemoveDealImage } from "@/lib/actions/admin";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];

type Category = {
  id: string;
  label: string;
  slug: string;
};

type ProfileOption = {
  id: string;
  username: string;
  is_seed: boolean;
};

interface AdminDealFormProps {
  deal: DealRow;
  categories: Category[];
  profiles: ProfileOption[];
}

export function AdminDealForm({ deal, categories, profiles }: AdminDealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(deal.title);
  const [description, setDescription] = useState(deal.description);
  const [categoryId, setCategoryId] = useState(deal.category_id);
  const [isFree, setIsFree] = useState(
    deal.price === 0 && deal.original_price === null
  );
  const [price, setPrice] = useState(
    deal.price != null && deal.price !== 0 ? String(deal.price) : ""
  );
  const [originalPrice, setOriginalPrice] = useState(
    deal.original_price != null ? String(deal.original_price) : ""
  );
  const [url, setUrl] = useState(deal.url ?? "");
  const [location, setLocation] = useState(deal.location ?? "");
  const [expiresAt, setExpiresAt] = useState(
    deal.expires_at ? deal.expires_at.split("T")[0] : ""
  );
  const [userId, setUserId] = useState(deal.user_id ?? "");

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(deal.image_url);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are accepted");
      e.target.value = "";
      return;
    }

    setExistingImage(null);
    setRemoveImage(false);
    setPendingImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImagePreview(null);
    setExistingImage(null);
    setPendingImageFile(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const fields: Parameters<typeof adminEditDeal>[1] = {
        title,
        description,
        category_id: categoryId,
        price: isFree ? 0 : (price ? Number(price) : null),
        original_price: isFree ? null : (originalPrice ? Number(originalPrice) : null),
        url: url || null,
        location: location || null,
        expires_at: expiresAt ? `${expiresAt}T23:59:59` : null,
        user_id: userId || null,
      };

      const result = await adminEditDeal(deal.id, fields);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Handle image changes after the main edit
      if (pendingImageFile) {
        const fd = new FormData();
        fd.append("image", pendingImageFile);
        const imgResult = await adminUploadDealImage(deal.id, fd);
        if (imgResult.error) {
          toast.error(imgResult.error);
          return;
        }
      } else if (removeImage) {
        const imgResult = await adminRemoveDealImage(deal.id);
        if (imgResult.error) {
          toast.error(imgResult.error);
          return;
        }
      }

      toast.success("Deal updated");
      router.push("/admin/moderation");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Author */}
      <div className="space-y-2">
        <Label className="section-label">Author</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select author" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.username}
                {p.is_seed ? " 🌱" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          🌱 indicates seed accounts. Change this to reassign the deal to another user.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="admin-title" className="section-label">Title</Label>
        <Input
          id="admin-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="section-label">Description</Label>
        <MarkdownEditor
          name="description"
          defaultValue={description}
          onChange={setDescription}
          required
        />
      </div>

      {/* Free checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="admin-is-free"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          className="h-4 w-4 rounded-sm border-2 border-foreground/20 accent-primary"
        />
        <Label htmlFor="admin-is-free" className="cursor-pointer font-normal">
          This deal is free
        </Label>
      </div>

      {/* Price row */}
      {!isFree && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-price" className="section-label">Deal Price (AED)</Label>
            <Input
              id="admin-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="299"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-original-price" className="section-label">Original Price (AED)</Label>
            <Input
              id="admin-original-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="599"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Category */}
      <div className="space-y-2">
        <Label className="section-label">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="admin-url" className="section-label">Deal URL</Label>
        <Input
          id="admin-url"
          type="text"
          placeholder="https://example.com/deal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="admin-location" className="section-label">Location</Label>
        <Input
          id="admin-location"
          placeholder="e.g. Dubai Mall, Level 2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <Label htmlFor="admin-expires" className="section-label">Expiry Date</Label>
        <Input
          id="admin-expires"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label className="section-label">Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
        {imagePreview ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-[200px] max-w-[300px] rounded-sm border-2 border-foreground/10 object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 rounded-sm border-2 border-foreground/15 bg-background p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : existingImage ? (
          <div className="relative w-fit">
            <Image
              src={existingImage}
              alt="Current image"
              width={300}
              height={200}
              className="max-h-[200px] rounded-sm border-2 border-foreground/10 object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 rounded-sm border-2 border-foreground/15 bg-background p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed border-foreground/20 px-6 py-8 transition-colors hover:border-foreground/40 hover:bg-muted/50"
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload (JPEG, PNG, WebP — max 10MB)
            </span>
          </button>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}

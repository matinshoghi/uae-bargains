"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createDeal, updateDeal, type DealFormState } from "@/lib/actions/deals";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

type Category = {
  id: string;
  label: string;
  slug: string;
};

type InitialData = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  original_price: number | null;
  url: string | null;
  location: string | null;
  category_id: string;
  expires_at: string | null;
  image_url: string | null;
};

interface DealFormProps {
  categories: Category[];
  initialData?: InitialData;
}

export function DealForm({ categories, initialData }: DealFormProps) {
  const isEditing = !!initialData;

  const [state, formAction, isPending] = useActionState(
    async (prevState: DealFormState, formData: FormData) => {
      const result = isEditing
        ? await updateDeal(initialData!.id, prevState, formData)
        : await createDeal(prevState, formData);
      if (result?.message) {
        toast.error(result.message);
      }
      return result;
    },
    null
  );

  // Persist form values from server action response
  const v = state?.values ?? {};

  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [isFree, setIsFree] = useState(
    initialData ? initialData.price === 0 && initialData.original_price === null : false
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(
    initialData?.image_url ?? null
  );
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync category from returned values
  useEffect(() => {
    if (v.category_id) setCategoryId(v.category_id);
  }, [v.category_id]);

  useEffect(() => {
    if (v.is_free === "on") setIsFree(true);
  }, [v.is_free]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
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
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImagePreview(null);
    setExistingImage(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Parse expiry date for the date input (strip time portion)
  const defaultExpiry = initialData?.expires_at
    ? initialData.expires_at.split("T")[0]
    : "";

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden field to signal image removal */}
      <input type="hidden" name="remove_image" value={removeImage ? "true" : "false"} />

      {/* Title — locked in edit mode */}
      {isEditing ? (
        <div className="space-y-2">
          <Label>Title</Label>
          <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
            {initialData.title}
          </p>
          <p className="text-muted-foreground text-xs">
            Title cannot be changed after posting.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. 50% off Nike Air Max at Dubai Mall"
            defaultValue={v.title ?? ""}
            required
          />
          {state?.errors?.title && (
            <p className="text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the deal — where to find it, any conditions, why it's good..."
          rows={4}
          defaultValue={v.description ?? initialData?.description ?? ""}
          required
        />
        {state?.errors?.description && (
          <p className="text-sm text-red-500">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Free checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_free"
          name="is_free"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        <Label htmlFor="is_free" className="cursor-pointer font-normal">
          This deal is free
        </Label>
      </div>

      {/* Price row — hidden when free */}
      {!isFree && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Deal Price (AED)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="299"
              defaultValue={
                v.price ?? (initialData?.price != null && initialData.price !== 0
                  ? String(initialData.price)
                  : "")
              }
            />
            {state?.errors?.price && (
              <p className="text-sm text-red-500">{state.errors.price[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="original_price">Original Price (AED)</Label>
            <Input
              id="original_price"
              name="original_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="599"
              defaultValue={
                v.original_price ?? (initialData?.original_price != null
                  ? String(initialData.original_price)
                  : "")
              }
            />
            {state?.errors?.original_price && (
              <p className="text-sm text-red-500">
                {state.errors.original_price[0]}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <input type="hidden" name="category_id" value={categoryId} />
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
        {state?.errors?.category_id && (
          <p className="text-sm text-red-500">{state.errors.category_id[0]}</p>
        )}
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="url">Deal URL</Label>
        <Input
          id="url"
          name="url"
          type="text"
          placeholder="www.example.com/deal or https://example.com/deal"
          defaultValue={v.url ?? initialData?.url ?? ""}
        />
        {state?.errors?.url && (
          <p className="text-sm text-red-500">{state.errors.url[0]}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g. Dubai Mall, Level 2"
          defaultValue={v.location ?? initialData?.location ?? ""}
        />
        {state?.errors?.location && (
          <p className="text-sm text-red-500">{state.errors.location[0]}</p>
        )}
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <Label htmlFor="expires_at">Expiry Date</Label>
        <Input
          id="expires_at"
          name="expires_at"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          defaultValue={v.expires_at ?? defaultExpiry}
        />
        {state?.errors?.expires_at && (
          <p className="text-sm text-red-500">{state.errors.expires_at[0]}</p>
        )}
      </div>

      {/* Image — file input always in DOM so FormData includes the file */}
      <div className="space-y-2">
        <Label>Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          name="image"
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
              className="max-h-[200px] max-w-[300px] rounded-lg border object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="bg-background absolute -top-2 -right-2 rounded-full border p-1 shadow-sm"
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
              className="max-h-[200px] rounded-lg border object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={clearImage}
              className="bg-background absolute -top-2 -right-2 rounded-full border p-1 shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            onClick={() => fileInputRef.current?.click()}
            className="border-input hover:bg-accent flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors"
          >
            <ImagePlus className="text-muted-foreground h-8 w-8" />
            <span className="text-muted-foreground text-sm">
              Click to upload (JPEG, PNG, WebP — max 5MB)
            </span>
          </label>
        )}
        {state?.errors?.image && (
          <p className="text-sm text-red-500">{state.errors.image[0]}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? isEditing
            ? "Saving..."
            : "Posting..."
          : isEditing
            ? "Save Changes"
            : "Post Deal"}
      </Button>
    </form>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  items: CatalogItemRow[];
};

type CatalogItemRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrls: string[];
  quantityAvailable: number;
  isActive: boolean;
  sizes: string[];
  setOptions: string[];
  setIncludes: string | null;
  bondCents: number | null;
  selectionLabel: string | null;
  selectionDisplay: string | null;
  colorImages?: Record<string, string> | null;
  variantPrices?: Record<string, number> | null;
};

type VariantPriceRow = { label: string; dollars: string };

function linesToList(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function dollarsToCents(value: string): number | null {
  const normalized = value.trim().replace(/^\$/, "");
  if (!normalized) return null;
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed");
  }
  return data.url as string;
}

type EditableItem = CatalogItemRow & {
  categoryId: string;
  categoryName: string;
};

function centsToDollarsField(cents: number | null | undefined): string {
  if (cents == null || cents === 0) return cents === 0 ? "0" : "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

export function AdminCatalogView({ onChanged }: { onChanged: () => void }) {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/items");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCategories(data.categories as CatalogCategory[]);
    } catch {
      toast.error("Could not load catalogue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCatalog();
    });
  }, [loadCatalog]);

  async function handleCatalogChanged() {
    setEditingItem(null);
    await loadCatalog();
    onChanged();
  }

  if (loading) {
    return (
      <p className="text-sm font-light text-foreground-soft">
        Loading catalogue...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
        <h2 className="font-serif text-xl font-light text-foreground">
          Website catalogue
        </h2>
        <p className="mt-2 text-sm font-light text-foreground-soft">
          Add or edit live hire listings. Changes to price, photos, bond, and
          details update on the website.
        </p>
      </section>

      <AddItemForm categories={categories} onCreated={handleCatalogChanged} />
      <ExistingItems
        categories={categories}
        editingItem={editingItem}
        onEdit={(item) => {
          if (item.id.startsWith("static-")) {
            toast.error(
              "This listing is from the seed catalogue. Add it through “Add item” to manage it live.",
            );
            return;
          }
          setEditingItem(item);
        }}
        onCancelEdit={() => setEditingItem(null)}
        onChanged={handleCatalogChanged}
      />
    </div>
  );
}

function AddItemForm({
  categories,
  onCreated,
}: {
  categories: CatalogCategory[];
  onCreated: () => void;
}) {
  const [categoryMode, setCategoryMode] = useState<"existing" | "create">(
    categories.length > 0 ? "existing" : "create",
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceDollars, setPriceDollars] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [sizesText, setSizesText] = useState("");
  const [setsText, setSetsText] = useState("");
  const [setIncludes, setSetIncludes] = useState("");
  const [bondDollars, setBondDollars] = useState("");
  const [selectionLabel, setSelectionLabel] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<VariantPriceRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categoryMode === "existing" && !categoryId && categories[0]?.id) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, categoryMode]);

  const sizeOptions = useMemo(() => linesToList(sizesText), [sizesText]);
  const setOptions = useMemo(() => linesToList(setsText), [setsText]);

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file));
      }
      setImageUrls((current) => [...current, ...uploaded]);
      toast.success(
        `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCategoryPhoto(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setNewCategoryImageUrl(url);
      toast.success("Category photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addVariantRow() {
    const nextLabel = sizeOptions[0] || setOptions[0] || "";
    setVariantRows((current) => [...current, { label: nextLabel, dollars: "" }]);
  }

  async function resolveCategoryId(): Promise<string | null> {
    if (categoryMode === "existing") {
      if (!categoryId) {
        toast.error("Choose a category");
        return null;
      }
      return categoryId;
    }

    if (!newCategoryName.trim()) {
      toast.error("Enter a name for the new category");
      return null;
    }

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || newCategoryName.trim(),
        imageUrl: newCategoryImageUrl || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not create category");
      return null;
    }
    return data.category.id as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = dollarsToCents(priceDollars);
    if (priceCents === null) {
      toast.error("Enter a valid hire price");
      return;
    }
    if (imageUrls.length === 0) {
      toast.error("Add at least one photo");
      return;
    }

    const variantPrices: Record<string, number> = {};
    for (const row of variantRows) {
      if (!row.label.trim() || !row.dollars.trim()) continue;
      const cents = dollarsToCents(row.dollars);
      if (cents === null) {
        toast.error(`Invalid price for ${row.label}`);
        return;
      }
      variantPrices[row.label.trim()] = cents;
    }

    const bondCents = bondDollars.trim()
      ? dollarsToCents(bondDollars)
      : null;
    if (bondDollars.trim() && bondCents === null) {
      toast.error("Enter a valid bond amount");
      return;
    }

    setSubmitting(true);
    try {
      const resolvedCategoryId = await resolveCategoryId();
      if (!resolvedCategoryId) return;

      const res = await fetch("/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: resolvedCategoryId,
          name,
          description,
          priceCents,
          quantityAvailable: Number.parseInt(quantity, 10) || 1,
          imageUrls,
          sizes: sizeOptions,
          setOptions,
          setIncludes: setIncludes || undefined,
          bondCents,
          selectionLabel: selectionLabel || undefined,
          variantPrices:
            Object.keys(variantPrices).length > 0 ? variantPrices : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create item");
        return;
      }
      toast.success("Item added — live on the website");
      setName("");
      setDescription("");
      setPriceDollars("");
      setQuantity("1");
      setSizesText("");
      setSetsText("");
      setSetIncludes("");
      setBondDollars("");
      setSelectionLabel("");
      setImageUrls([]);
      setVariantRows([]);
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryImageUrl("");
      setCategoryMode("existing");
      onCreated();
    } catch {
      toast.error("Could not create item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
      <h3 className="font-serif text-xl font-light text-foreground">
        Add item
      </h3>
      <p className="mt-2 text-sm font-light text-foreground-soft">
        Choose or create a category, then add photos and details. The item goes
        live under that category immediately.
      </p>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
          <div className="space-y-3 sm:col-span-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategoryMode("existing")}
                disabled={categories.length === 0}
                className={cn(
                  "h-11 rounded-2xl border text-sm",
                  categoryMode === "existing"
                    ? "border-sage bg-sage/20 font-medium text-foreground"
                    : "border-sage/30 bg-warm-white font-light text-foreground-soft",
                  categories.length === 0 && "opacity-50",
                )}
              >
                Choose a category
              </button>
              <button
                type="button"
                onClick={() => setCategoryMode("create")}
                className={cn(
                  "h-11 rounded-2xl border text-sm",
                  categoryMode === "create"
                    ? "border-sage bg-sage/20 font-medium text-foreground"
                    : "border-sage/30 bg-warm-white font-light text-foreground-soft",
                )}
              >
                Create a category
              </button>
            </div>

            {categoryMode === "existing" ? (
              <div className="space-y-2">
                <Label htmlFor="item-category">Existing category</Label>
                <select
                  id="item-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required={categoryMode === "existing"}
                  className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories yet</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs font-light text-foreground-soft">
                  e.g. Neon Signs, Backdrops, Cutouts
                </p>
              </div>
            ) : (
              <div className="grid gap-4 rounded-2xl border border-sage/20 bg-warm-white p-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="new-cat-name">New category name</Label>
                  <Input
                    id="new-cat-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required={categoryMode === "create"}
                    placeholder="e.g. Neon Signs"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="new-cat-description">
                    Category description
                  </Label>
                  <Textarea
                    id="new-cat-description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows={2}
                    placeholder="Shown on the website collection page"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="new-cat-photo">Category photo (optional)</Label>
                  <Input
                    id="new-cat-photo"
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) =>
                      void handleCategoryPhoto(e.target.files?.[0] ?? null)
                    }
                  />
                </div>
                {newCategoryImageUrl ? (
                  <div className="relative h-28 overflow-hidden rounded-2xl bg-cream sm:col-span-2">
                    <Image
                      src={newCategoryImageUrl}
                      alt="New category preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="item-name">Item name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-price">Hire price (AUD)</Label>
            <Input
              id="item-price"
              inputMode="decimal"
              placeholder="80"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-qty">Quantity available</Label>
            <Input
              id="item-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-bond">Bond (AUD, optional)</Label>
            <Input
              id="item-bond"
              inputMode="decimal"
              placeholder="150"
              value={bondDollars}
              onChange={(e) => setBondDollars(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-selection-label">
              Size label (optional)
            </Label>
            <Input
              id="item-selection-label"
              placeholder="e.g. Colour or Size"
              value={selectionLabel}
              onChange={(e) => setSelectionLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="item-sizes">
              Sizes / options (one per line)
            </Label>
            <Textarea
              id="item-sizes"
              value={sizesText}
              onChange={(e) => setSizesText(e.target.value)}
              rows={3}
              placeholder={"White\nBlush\nSage"}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="item-sets">Sets (one per line, optional)</Label>
            <Textarea
              id="item-sets"
              value={setsText}
              onChange={(e) => setSetsText(e.target.value)}
              rows={3}
              placeholder={"1 set\n2 sets\n3 sets"}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="item-includes">What a set includes (optional)</Label>
            <Input
              id="item-includes"
              value={setIncludes}
              onChange={(e) => setSetIncludes(e.target.value)}
              placeholder="e.g. 4 raisers per set"
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Different prices per size/set (optional)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addVariantRow}>
                Add price
              </Button>
            </div>
            {variantRows.length === 0 ? (
              <p className="text-xs font-light text-foreground-soft">
                Leave empty to use the main hire price for every option.
              </p>
            ) : (
              <div className="space-y-2">
                {variantRows.map((row, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                    <Input
                      value={row.label}
                      onChange={(e) =>
                        setVariantRows((current) =>
                          current.map((entry, i) =>
                            i === index
                              ? { ...entry, label: e.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder="Option name"
                      list={`variant-options-${index}`}
                    />
                    <datalist id={`variant-options-${index}`}>
                      {[...sizeOptions, ...setOptions].map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                    <Input
                      inputMode="decimal"
                      placeholder="Price"
                      value={row.dollars}
                      onChange={(e) =>
                        setVariantRows((current) =>
                          current.map((entry, i) =>
                            i === index
                              ? { ...entry, dollars: e.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setVariantRows((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <PhotoPicker
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            uploading={uploading}
            onUploadFiles={(files) => void handlePhotos(files)}
          />

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={
                submitting ||
                uploading ||
                (categoryMode === "existing" && categories.length === 0)
              }
            >
              {submitting ? "Publishing..." : "Add item to website"}
            </Button>
          </div>
        </form>
    </section>
  );
}

function PhotoPicker({
  imageUrls,
  setImageUrls,
  uploading,
  onUploadFiles,
}: {
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  uploading: boolean;
  onUploadFiles: (files: FileList | null) => void;
}) {
  const [urlInput, setUrlInput] = useState("");

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    try {
      // Allow absolute URLs and site-relative paths like /props/...
      if (!url.startsWith("/") && !/^https?:\/\//i.test(url)) {
        toast.error("Enter a full image URL or a path starting with /");
        return;
      }
      setImageUrls((current) =>
        current.includes(url) ? current : [...current, url],
      );
      setUrlInput("");
      toast.success("Photo added");
    } catch {
      toast.error("Could not add that image URL");
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <Label htmlFor="item-photos">Photos</Label>
      <Input
        id="item-photos"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        disabled={uploading}
        onChange={(e) => onUploadFiles(e.target.files)}
      />
      <p className="text-xs font-light text-foreground-soft">
        JPG, PNG or WebP under 4MB. If upload fails, paste an image URL below.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://… or /props/backdrops/photo.jpg"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addUrl}
          disabled={!urlInput.trim()}
        >
          Add URL
        </Button>
      </div>
      {imageUrls.length > 0 ? (
        <ul className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {imageUrls.map((url) => (
            <li
              key={url}
              className="relative aspect-square overflow-hidden rounded-2xl bg-warm-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-cream/90 px-2 py-1 text-[10px] uppercase tracking-wider"
                onClick={() =>
                  setImageUrls((current) =>
                    current.filter((entry) => entry !== url),
                  )
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function EditItemForm({
  item,
  categories,
  onSaved,
  onCancel,
}: {
  item: EditableItem;
  categories: CatalogCategory[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [priceDollars, setPriceDollars] = useState(
    centsToDollarsField(item.priceCents),
  );
  const [quantity, setQuantity] = useState(String(item.quantityAvailable || 1));
  const [sizesText, setSizesText] = useState((item.sizes ?? []).join("\n"));
  const [setsText, setSetsText] = useState((item.setOptions ?? []).join("\n"));
  const [setIncludes, setSetIncludes] = useState(item.setIncludes ?? "");
  const [bondDollars, setBondDollars] = useState(
    centsToDollarsField(item.bondCents),
  );
  const [selectionLabel, setSelectionLabel] = useState(
    item.selectionLabel ?? "",
  );
  const [selectionDisplay, setSelectionDisplay] = useState(
    item.selectionDisplay ?? "",
  );
  const [slug, setSlug] = useState(item.slug);
  const [imageUrls, setImageUrls] = useState<string[]>(item.imageUrls ?? []);
  const [colorImages, setColorImages] = useState<Record<string, string>>(
    item.colorImages ?? {},
  );
  const [variantRows, setVariantRows] = useState<VariantPriceRow[]>(() =>
    Object.entries(item.variantPrices ?? {}).map(([label, cents]) => ({
      label,
      dollars: centsToDollarsField(cents),
    })),
  );
  const [isActive, setIsActive] = useState(item.isActive);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sizeOptions = useMemo(() => linesToList(sizesText), [sizesText]);
  const setOptions = useMemo(() => linesToList(setsText), [setsText]);

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file));
      }
      setImageUrls((current) => [...current, ...uploaded]);
      toast.success(
        `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addVariantRow() {
    const nextLabel = sizeOptions[0] || setOptions[0] || "";
    setVariantRows((current) => [...current, { label: nextLabel, dollars: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = dollarsToCents(priceDollars);
    if (priceCents === null) {
      toast.error("Enter a valid hire price");
      return;
    }
    if (imageUrls.length === 0) {
      toast.error("Add at least one photo");
      return;
    }

    const variantPrices: Record<string, number> = {};
    for (const row of variantRows) {
      if (!row.label.trim() || !row.dollars.trim()) continue;
      const cents = dollarsToCents(row.dollars);
      if (cents === null) {
        toast.error(`Invalid price for ${row.label}`);
        return;
      }
      variantPrices[row.label.trim()] = cents;
    }

    const bondCents = bondDollars.trim()
      ? dollarsToCents(bondDollars)
      : null;
    if (bondDollars.trim() && bondCents === null) {
      toast.error("Enter a valid bond amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          name,
          slug: slug.trim() || undefined,
          description,
          priceCents,
          quantityAvailable: Number.parseInt(quantity, 10) || 1,
          imageUrls,
          sizes: sizeOptions,
          setOptions,
          setIncludes: setIncludes || "",
          bondCents,
          selectionLabel: selectionLabel || "",
          selectionDisplay: selectionDisplay || "",
          colorImages,
          variantPrices:
            Object.keys(variantPrices).length > 0 ? variantPrices : null,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update listing");
        return;
      }
      toast.success("Listing updated on the website");
      onSaved();
    } catch {
      toast.error("Could not update listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border-2 border-sage/40 bg-cream p-5 shadow-luxury sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-light text-foreground">
            Edit live listing
          </h3>
          <p className="mt-2 text-sm font-light text-foreground-soft">
            Update {item.name}. Changes go live on the hire pages.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel edit
        </Button>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-category">Category</Label>
          <select
            id="edit-item-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="flex h-11 w-full rounded-2xl border border-sage/30 bg-warm-white px-3 text-sm font-light text-foreground"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-name">Item name</Label>
          <Input
            id="edit-item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-slug">Website link name</Label>
          <Input
            id="edit-item-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="black-plinth"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-description">Description</Label>
          <Textarea
            id="edit-item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-item-price">Hire price (AUD)</Label>
          <Input
            id="edit-item-price"
            inputMode="decimal"
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-item-qty">Quantity available</Label>
          <Input
            id="edit-item-qty"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-item-bond">Bond (AUD, optional)</Label>
          <Input
            id="edit-item-bond"
            inputMode="decimal"
            value={bondDollars}
            onChange={(e) => setBondDollars(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-item-selection-label">Option label</Label>
          <Input
            id="edit-item-selection-label"
            value={selectionLabel}
            onChange={(e) => setSelectionLabel(e.target.value)}
            placeholder="e.g. Choose colour"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-item-selection-display">Shown on hire as</Label>
          <Input
            id="edit-item-selection-display"
            value={selectionDisplay}
            onChange={(e) => setSelectionDisplay(e.target.value)}
            placeholder="Colour, Size, Set, Number, or Package"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-sizes">Sizes / options (one per line)</Label>
          <Textarea
            id="edit-item-sizes"
            value={sizesText}
            onChange={(e) => setSizesText(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-sets">Sets (one per line, optional)</Label>
          <Textarea
            id="edit-item-sets"
            value={setsText}
            onChange={(e) => setSetsText(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-item-includes">What a set includes (optional)</Label>
          <Input
            id="edit-item-includes"
            value={setIncludes}
            onChange={(e) => setSetIncludes(e.target.value)}
          />
        </div>

        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Different prices per size/set (optional)</Label>
            <Button type="button" size="sm" variant="outline" onClick={addVariantRow}>
              Add price
            </Button>
          </div>
          {variantRows.length === 0 ? (
            <p className="text-xs font-light text-foreground-soft">
              Leave empty to use the main hire price for every option.
            </p>
          ) : (
            <div className="space-y-2">
              {variantRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-2 sm:grid-cols-[1fr_120px_auto]"
                >
                  <Input
                    value={row.label}
                    onChange={(e) =>
                      setVariantRows((current) =>
                        current.map((entry, i) =>
                          i === index
                            ? { ...entry, label: e.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Option name"
                  />
                  <Input
                    inputMode="decimal"
                    placeholder="Price"
                    value={row.dollars}
                    onChange={(e) =>
                      setVariantRows((current) =>
                        current.map((entry, i) =>
                          i === index
                            ? { ...entry, dollars: e.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setVariantRows((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <PhotoPicker
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          uploading={uploading}
          onUploadFiles={(files) => void handlePhotos(files)}
        />

        {sizeOptions.length > 0 ? (
          <div className="space-y-3 sm:col-span-2">
            <Label>Photo for each option</Label>
            <p className="text-xs font-light text-foreground-soft">
              Optional. Used when a customer picks that colour or size.
            </p>
            {sizeOptions.map((option) => (
              <div key={option} className="grid gap-2 sm:grid-cols-[140px_1fr]">
                <p className="self-center text-sm text-foreground">{option}</p>
                <Input
                  value={colorImages[option] ?? ""}
                  onChange={(e) =>
                    setColorImages((current) => ({
                      ...current,
                      [option]: e.target.value,
                    }))
                  }
                  placeholder="Image URL or /props/…"
                />
              </div>
            ))}
          </div>
        ) : null}

        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--sage)]"
          />
          <span className="text-sm text-foreground">
            Live on website (uncheck to hide)
          </span>
        </label>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? "Saving..." : "Save listing changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

function ExistingItems({
  categories,
  editingItem,
  onEdit,
  onCancelEdit,
  onChanged,
}: {
  categories: CatalogCategory[];
  editingItem: EditableItem | null;
  onEdit: (item: EditableItem) => void;
  onCancelEdit: () => void;
  onChanged: () => void;
}) {
  const items = categories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryId: category.id,
      categoryName: category.name,
    })),
  );

  async function toggleActive(item: EditableItem) {
    if (item.id.startsWith("static-")) {
      toast.error("Seed listings can’t be toggled here. Add the item first.");
      return;
    }
    const res = await fetch(`/api/admin/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not update item");
      return;
    }
    toast.success(item.isActive ? "Item hidden from website" : "Item live again");
    onChanged();
  }

  return (
    <section className="rounded-3xl bg-cream p-5 shadow-luxury sm:p-6">
      <h3 className="font-serif text-xl font-light text-foreground">
        All listings ({items.length})
      </h3>
      <p className="mt-2 text-sm font-light text-foreground-soft">
        Every item has an Edit button. You can change name, price, bond,
        photos, sizes, sets, and everything else on the listing.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm font-light text-foreground-soft">
          No items yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "rounded-2xl bg-warm-white px-4 py-3",
                editingItem?.id === item.id && "ring-2 ring-sage/50",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                    {item.imageUrls[0] ? (
                      <Image
                        src={item.imageUrls[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-light text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-sage">
                      {item.categoryName} · {formatPrice(item.priceCents)}
                      {item.bondCents
                        ? ` · bond ${formatPrice(item.bondCents)}`
                        : ""}
                      {item.isActive ? " · Live" : " · Hidden"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      editingItem?.id === item.id
                        ? onCancelEdit()
                        : onEdit(item)
                    }
                  >
                    {editingItem?.id === item.id ? "Close edit" : "Edit"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void toggleActive(item)}
                  >
                    {item.isActive ? "Hide from website" : "Make live"}
                  </Button>
                </div>
              </div>
              {editingItem?.id === item.id ? (
                <div className="mt-4">
                  <EditItemForm
                    key={item.id}
                    item={item}
                    categories={categories}
                    onSaved={onChanged}
                    onCancel={onCancelEdit}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";
/**
 * components/admin/ProductManager.tsx
 * Client component for the Product Manager section of the admin dashboard.
 * Handles: add product form (with Cloudinary upload), product table, delete action.
 */
import { useState, useRef } from "react";
import Image from "next/image";
import type { Product, CreateProductPayload, ActionResult } from "@/types";

interface ProductManagerProps {
  initialProducts: Product[];
}

/** Placeholder SVG for products without an image */
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23E4E1D5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='11' fill='%23A3B18A'%3ENo img%3C/text%3E%3C/svg%3E";

export default function ProductManager({ initialProducts }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Upload image to Cloudinary via unsigned upload preset */
  async function uploadToCloudinary(file: File): Promise<string | null> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.warn("[ProductManager] Cloudinary env vars not set — skipping upload.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return (data.secure_url as string) ?? null;
  }

  /** Handle image file selection and generate preview */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  /** Submit new product */
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !price) {
      setFormError("Product name and price are required.");
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setFormError("Enter a valid price.");
      return;
    }

    setSubmitting(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }

    const payload: CreateProductPayload = {
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      image_url: imageUrl,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: ActionResult<Product> = await res.json();

      if (!result.success || !result.data) {
        setFormError(result.error ?? "Failed to add product.");
        return;
      }

      // Prepend to local state — no page reload needed
      setProducts((prev) => [result.data as Product, ...prev]);
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /** Delete a product by ID */
  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      const result: ActionResult = await res.json();

      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(result.error ?? "Failed to delete product.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Product button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add New Product
        </button>
      )}

      {/* Add Product form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <h2 className="font-serif text-lg text-matcha">New Product</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-name" className="label">Name *</label>
              <input
                id="prod-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Handwoven Basket"
                required
              />
            </div>
            <div>
              <label htmlFor="prod-price" className="label">Price (PHP) *</label>
              <input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input"
                placeholder="450.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="prod-desc" className="label">Description</label>
            <textarea
              id="prod-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              placeholder="Brief product description..."
            />
          </div>

          <div>
            <label className="label">Product Image (Cloudinary)</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-cream-dark bg-cream-dark shrink-0">
                <Image
                  src={imagePreview ?? PLACEHOLDER}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs px-3 py-2"
              >
                {imageFile ? "Change Image" : "Select Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-sesame-muted mt-1.5">
              Leave blank to use the default placeholder. Requires Cloudinary env vars to be set.
            </p>
          </div>

          {formError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Saving..." : "Save Product"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Product table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-cream-dark">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-sesame-muted">Product</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-sesame-muted">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-sesame-muted hidden sm:table-cell">Description</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-sesame-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sesame-muted text-sm">
                    No products yet. Add your first product above.
                  </td>
                </tr>
              )}
              {products.map((product, idx) => (
                <tr
                  key={product.id}
                  className={`border-b border-cream-dark last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-cream/40"}`}
                >
                  {/* Image + name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-cream-dark bg-cream-dark shrink-0">
                        <Image
                          src={product.image_url ?? PLACEHOLDER}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized={!product.image_url}
                        />
                      </div>
                      <span className="font-medium text-sesame line-clamp-1">{product.name}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-semibold text-matcha whitespace-nowrap">
                    PHP {product.price.toFixed(2)}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-sesame-muted hidden sm:table-cell max-w-xs">
                    <span className="line-clamp-2">{product.description ?? "—"}</span>
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
                      aria-label={`Delete ${product.name}`}
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

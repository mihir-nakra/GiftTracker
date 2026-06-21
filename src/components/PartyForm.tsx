"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MAX_PHOTOS = 4;

interface Party {
  id?: string;
  title: string;
  date: string;
  description: string;
  gift_description: string;
  gift_image_urls: string[];
  outfit_description: string;
  outfit_image_urls: string[];
}

export function PartyForm({ party }: { party?: Party }) {
  const isEdit = !!party?.id;
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(party?.title || "");
  const [date, setDate] = useState(party?.date || "");
  const [description, setDescription] = useState(party?.description || "");
  const [giftDescription, setGiftDescription] = useState(party?.gift_description || "");
  const [giftImageUrls, setGiftImageUrls] = useState<string[]>(party?.gift_image_urls || []);
  const [outfitDescription, setOutfitDescription] = useState(party?.outfit_description || "");
  const [outfitImageUrls, setOutfitImageUrls] = useState<string[]>(party?.outfit_image_urls || []);
  const [saving, setSaving] = useState(false);
  const [uploadingGift, setUploadingGift] = useState(false);
  const [uploadingOutfit, setUploadingOutfit] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File, type: "gift" | "outfit") {
    const setUploading = type === "gift" ? setUploadingGift : setUploadingOutfit;
    const urls = type === "gift" ? giftImageUrls : outfitImageUrls;
    const setUrls = type === "gift" ? setGiftImageUrls : setOutfitImageUrls;

    if (urls.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos per section`);
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${type}/${fileName}`;

    const { error } = await supabase.storage
      .from("party-images")
      .upload(path, file);

    if (error) {
      setError(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("party-images")
      .getPublicUrl(path);

    setUrls([...urls, data.publicUrl]);
    setUploading(false);
  }

  function removeImage(type: "gift" | "outfit", index: number) {
    if (type === "gift") {
      setGiftImageUrls(giftImageUrls.filter((_, i) => i !== index));
    } else {
      setOutfitImageUrls(outfitImageUrls.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const payload = {
      title,
      date,
      description: description || null,
      gift_description: giftDescription || null,
      gift_image_urls: giftImageUrls,
      outfit_description: outfitDescription || null,
      outfit_image_urls: outfitImageUrls,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEdit) {
      result = await supabase
        .from("parties")
        .update(payload)
        .eq("id", party.id);
    } else {
      result = await supabase.from("parties").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!party?.id) return;
    if (!confirm("Delete this party entry?")) return;

    const imagePaths: string[] = [];
    [...giftImageUrls, ...outfitImageUrls].forEach((url) => {
      const path = url.split("/storage/v1/object/public/party-images/")[1];
      if (path) imagePaths.push(path);
    });

    if (imagePaths.length > 0) {
      await supabase.storage.from("party-images").remove(imagePaths);
    }

    const { error } = await supabase
      .from("parties")
      .delete()
      .eq("id", party.id);

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function renderImageSection(type: "gift" | "outfit") {
    const urls = type === "gift" ? giftImageUrls : outfitImageUrls;
    const uploading = type === "gift" ? uploadingGift : uploadingOutfit;
    const label = type === "gift" ? "Gift" : "Outfit";

    return (
      <div>
        <label className="block text-sm text-[var(--color-warm-600)] mb-1">
          {label} Photos ({urls.length}/{MAX_PHOTOS})
        </label>
        {urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {urls.map((url, i) => (
              <div key={i} className="relative h-32 rounded-xl overflow-hidden">
                <Image
                  src={url}
                  alt={`${label} ${i + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(type, i)}
                  className="absolute top-1.5 right-1.5 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-[var(--color-warm-700)] hover:bg-white text-sm"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        {urls.length < MAX_PHOTOS && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file, type);
            }}
            disabled={uploading}
            className="w-full text-sm text-[var(--color-warm-500)] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--color-warm-100)] file:text-[var(--color-warm-700)] hover:file:bg-[var(--color-warm-200)]"
          />
        )}
        {uploading && <p className="text-xs text-[var(--color-warm-400)] mt-1">Uploading...</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[var(--color-warm-700)] mb-1">
          Party Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-warm-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-400)] bg-[var(--color-warm-50)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-warm-700)] mb-1">
          Date *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-warm-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-400)] bg-[var(--color-warm-50)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-warm-700)] mb-1">
          Party Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-warm-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-400)] bg-[var(--color-warm-50)] resize-none"
        />
      </div>

      <div className="border-t border-[var(--color-warm-200)] pt-5">
        <h3 className="font-medium text-[var(--color-warm-700)] mb-3">Gift</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[var(--color-warm-600)] mb-1">
              Gift Description
            </label>
            <textarea
              value={giftDescription}
              onChange={(e) => setGiftDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-warm-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-400)] bg-[var(--color-warm-50)] resize-none"
            />
          </div>
          {renderImageSection("gift")}
        </div>
      </div>

      <div className="border-t border-[var(--color-warm-200)] pt-5">
        <h3 className="font-medium text-[var(--color-warm-700)] mb-3">Outfit</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[var(--color-warm-600)] mb-1">
              Outfit Description
            </label>
            <textarea
              value={outfitDescription}
              onChange={(e) => setOutfitDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-warm-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-400)] bg-[var(--color-warm-50)] resize-none"
            />
          </div>
          {renderImageSection("outfit")}
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--color-rose-600)]">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-warm-600)] text-white font-medium hover:bg-[var(--color-warm-700)] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="py-2.5 px-4 rounded-xl border border-[var(--color-warm-200)] text-[var(--color-warm-600)] font-medium hover:bg-[var(--color-warm-100)] transition-colors"
        >
          Cancel
        </button>
      </div>

      {isEdit && (
        <button
          type="button"
          onClick={handleDelete}
          className="w-full py-2.5 px-4 rounded-xl text-[var(--color-rose-600)] font-medium hover:bg-[var(--color-rose-50)] transition-colors text-sm"
        >
          Delete this entry
        </button>
      )}
    </form>
  );
}

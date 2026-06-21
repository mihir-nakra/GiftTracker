"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Party {
  id?: string;
  title: string;
  date: string;
  description: string;
  gift_description: string;
  gift_image_url: string;
  outfit_description: string;
  outfit_image_url: string;
}

export function PartyForm({ party }: { party?: Party }) {
  const isEdit = !!party?.id;
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(party?.title || "");
  const [date, setDate] = useState(party?.date || "");
  const [description, setDescription] = useState(party?.description || "");
  const [giftDescription, setGiftDescription] = useState(party?.gift_description || "");
  const [giftImageUrl, setGiftImageUrl] = useState(party?.gift_image_url || "");
  const [outfitDescription, setOutfitDescription] = useState(party?.outfit_description || "");
  const [outfitImageUrl, setOutfitImageUrl] = useState(party?.outfit_image_url || "");
  const [saving, setSaving] = useState(false);
  const [uploadingGift, setUploadingGift] = useState(false);
  const [uploadingOutfit, setUploadingOutfit] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File, type: "gift" | "outfit") {
    const setUploading = type === "gift" ? setUploadingGift : setUploadingOutfit;
    const setUrl = type === "gift" ? setGiftImageUrl : setOutfitImageUrl;
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

    setUrl(data.publicUrl);
    setUploading(false);
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
      gift_image_url: giftImageUrl || null,
      outfit_description: outfitDescription || null,
      outfit_image_url: outfitImageUrl || null,
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
          <div>
            <label className="block text-sm text-[var(--color-warm-600)] mb-1">
              Gift Photo
            </label>
            {giftImageUrl && (
              <div className="relative w-full h-48 mb-2 rounded-xl overflow-hidden">
                <Image
                  src={giftImageUrl}
                  alt="Gift"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setGiftImageUrl("")}
                  className="absolute top-2 right-2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-[var(--color-warm-700)] hover:bg-white"
                >
                  &times;
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "gift");
              }}
              disabled={uploadingGift}
              className="w-full text-sm text-[var(--color-warm-500)] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--color-warm-100)] file:text-[var(--color-warm-700)] hover:file:bg-[var(--color-warm-200)]"
            />
            {uploadingGift && <p className="text-xs text-[var(--color-warm-400)] mt-1">Uploading...</p>}
          </div>
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
          <div>
            <label className="block text-sm text-[var(--color-warm-600)] mb-1">
              Outfit Photo
            </label>
            {outfitImageUrl && (
              <div className="relative w-full h-48 mb-2 rounded-xl overflow-hidden">
                <Image
                  src={outfitImageUrl}
                  alt="Outfit"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setOutfitImageUrl("")}
                  className="absolute top-2 right-2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-[var(--color-warm-700)] hover:bg-white"
                >
                  &times;
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "outfit");
              }}
              disabled={uploadingOutfit}
              className="w-full text-sm text-[var(--color-warm-500)] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--color-warm-100)] file:text-[var(--color-warm-700)] hover:file:bg-[var(--color-warm-200)]"
            />
            {uploadingOutfit && <p className="text-xs text-[var(--color-warm-400)] mt-1">Uploading...</p>}
          </div>
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

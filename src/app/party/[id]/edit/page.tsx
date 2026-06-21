import { createClient } from "@/lib/supabase/server";
import { PartyForm } from "@/components/PartyForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditPartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("id", id)
    .single();

  if (!party) {
    notFound();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link
        href="/"
        className="text-sm text-[var(--color-warm-500)] hover:text-[var(--color-warm-700)] transition-colors mb-4 inline-block"
      >
        &larr; Back
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--color-warm-800)] mb-6">
        Edit Party
      </h1>
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-[var(--color-warm-100)]">
        <PartyForm party={party} />
      </div>
    </div>
  );
}

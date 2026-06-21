import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { PartyCard } from "@/components/PartyCard";

export default async function Home() {
  const supabase = await createClient();
  const { data: parties } = await supabase
    .from("parties")
    .select("*")
    .order("date", { ascending: false });

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-warm-800)]">
          My Parties
        </h1>
        <LogoutButton />
      </div>

      <Link
        href="/party/new"
        className="block w-full text-center py-3 px-4 rounded-xl bg-[var(--color-warm-600)] text-white font-medium hover:bg-[var(--color-warm-700)] transition-colors mb-6"
      >
        + Add Party
      </Link>

      {parties && parties.length > 0 ? (
        <div className="space-y-3">
          {parties.map((party) => (
            <PartyCard key={party.id} party={party} />
          ))}
        </div>
      ) : (
        <p className="text-center text-[var(--color-warm-400)] mt-12">
          No parties yet. Add your first one!
        </p>
      )}
    </div>
  );
}

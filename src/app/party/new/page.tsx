import { PartyForm } from "@/components/PartyForm";
import Link from "next/link";

export default function NewPartyPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link
        href="/"
        className="text-sm text-[var(--color-warm-500)] hover:text-[var(--color-warm-700)] transition-colors mb-4 inline-block"
      >
        &larr; Back
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--color-warm-800)] mb-6">
        New Party
      </h1>
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-[var(--color-warm-100)]">
        <PartyForm />
      </div>
    </div>
  );
}

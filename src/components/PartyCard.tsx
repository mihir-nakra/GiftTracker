"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Party {
  id: string;
  title: string;
  date: string;
  description: string | null;
  gift_description: string | null;
  gift_image_url: string | null;
  outfit_description: string | null;
  outfit_image_url: string | null;
}

export function PartyCard({ party }: { party: Party }) {
  const [open, setOpen] = useState(false);

  const hasDetails =
    party.description ||
    party.gift_description ||
    party.gift_image_url ||
    party.outfit_description ||
    party.outfit_image_url;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-warm-100)] overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-[var(--color-warm-800)]">
              {party.title}
            </h2>
            <span className="text-sm text-[var(--color-warm-400)]">
              {new Date(party.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Link
              href={`/party/${party.id}/edit`}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-warm-100)] text-[var(--color-warm-700)] hover:bg-[var(--color-warm-200)] transition-colors"
            >
              Edit
            </Link>
            {hasDetails && (
              <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-warm-100)] transition-colors text-[var(--color-warm-500)]"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-warm-100)] pt-3">
          {party.description && (
            <p className="text-sm text-[var(--color-warm-600)]">{party.description}</p>
          )}

          {(party.gift_description || party.gift_image_url) && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-warm-400)] mb-1">
                Gift
              </h3>
              {party.gift_image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={party.gift_image_url}
                    alt="Gift"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {party.gift_description && (
                <p className="text-sm text-[var(--color-warm-600)]">{party.gift_description}</p>
              )}
            </div>
          )}

          {(party.outfit_description || party.outfit_image_url) && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-warm-400)] mb-1">
                Outfit
              </h3>
              {party.outfit_image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={party.outfit_image_url}
                    alt="Outfit"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {party.outfit_description && (
                <p className="text-sm text-[var(--color-warm-600)]">{party.outfit_description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

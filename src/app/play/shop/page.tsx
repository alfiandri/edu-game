"use client";

import { useState } from "react";
import { useChildStore } from "@/stores/child-store";
import type { AvatarItem } from "@/lib/types";
import Shop from "@/components/gamification/Shop";

// Shop items (MVP — in production loaded from Supabase)
const SHOP_ITEMS: AvatarItem[] = [
  { id: "sh1", category: "head", name: "Pirate Hat", image_url: "🏴‍☠️", price_currency: 50, is_default: false },
  { id: "sh2", category: "head", name: "Tiara", image_url: "👸", price_currency: 60, is_default: false },
  { id: "sh3", category: "head", name: "Astronaut", image_url: "👨‍🚀", price_currency: 80, is_default: false },
  { id: "sh4", category: "body", name: "Robot Suit", image_url: "🤖", price_currency: 100, is_default: false },
  { id: "sh5", category: "body", name: "Dragon Rider", image_url: "🐉", price_currency: 120, is_default: false },
  { id: "sh6", category: "accessory", name: "Magic Wand", image_url: "🪄", price_currency: 40, is_default: false },
  { id: "sh7", category: "accessory", name: "Shield", image_url: "🛡️", price_currency: 45, is_default: false },
  { id: "sh8", category: "accessory", name: "Telescope", image_url: "🔭", price_currency: 55, is_default: false },
  { id: "sh9", category: "background", name: "Castle", image_url: "🏰", price_currency: 70, is_default: false },
  { id: "sh10", category: "background", name: "Candy Land", image_url: "🍭", price_currency: 75, is_default: false },
  { id: "sh11", category: "background", name: "Volcano", image_url: "🌋", price_currency: 90, is_default: false },
  { id: "sh12", category: "background", name: "Rainbow", image_url: "🌈", price_currency: 65, is_default: false },
];

export default function ShopPage() {
  const { selectedChild, updateChild } = useChildStore();
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  if (!selectedChild) return null;

  const handlePurchase = async (itemId: string): Promise<boolean> => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || selectedChild.currency_balance < item.price_currency) return false;

    // Deduct balance and add to inventory (local only in MVP)
    updateChild({
      id: selectedChild.id,
      currency_balance: selectedChild.currency_balance - item.price_currency,
    });
    setOwnedIds((prev) => new Set([...prev, itemId]));
    return true;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛍️ Shop</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
        <Shop
          items={SHOP_ITEMS}
          ownedItemIds={ownedIds}
          currencyBalance={selectedChild.currency_balance}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useChildStore } from "@/stores/child-store";
import type { AvatarItem, AvatarCategory, AvatarConfig } from "@/lib/types";
import AvatarBuilder from "@/components/gamification/AvatarBuilder";
import { useTranslation } from "@/lib/i18n";

// Default inventory items (MVP — in production, loaded from MySQL)
const DEFAULT_ITEMS: AvatarItem[] = [
  { id: "h1", category: "head", name: "Crown", image_url: "👑", price_currency: 0, is_default: true },
  { id: "h2", category: "head", name: "Cap", image_url: "🧢", price_currency: 0, is_default: true },
  { id: "h3", category: "head", name: "Wizard Hat", image_url: "🧙", price_currency: 50, is_default: false },
  { id: "b1", category: "body", name: "Super Hero", image_url: "🦸", price_currency: 0, is_default: true },
  { id: "b2", category: "body", name: "Ninja", image_url: "🥷", price_currency: 0, is_default: true },
  { id: "a1", category: "accessory", name: "Backpack", image_url: "🎒", price_currency: 0, is_default: true },
  { id: "a2", category: "accessory", name: "Sword", image_url: "⚔️", price_currency: 30, is_default: false },
  { id: "bg1", category: "background", name: "Forest", image_url: "🌲", price_currency: 0, is_default: true },
  { id: "bg2", category: "background", name: "Space", image_url: "🚀", price_currency: 40, is_default: false },
  { id: "bg3", category: "background", name: "Ocean", image_url: "🌊", price_currency: 40, is_default: false },
];

export default function ProfilePage() {
  const { selectedChild } = useChildStore();
  const { t } = useTranslation();
  const [config, setConfig] = useState<AvatarConfig>(
    selectedChild?.avatar_config || {
      equipped_head: null,
      equipped_body: null,
      equipped_accessory: null,
      equipped_background: null,
    }
  );

  if (!selectedChild) return null;

  // All default items are owned; plus any purchased ones
  const ownedItems = DEFAULT_ITEMS.filter((i) => i.is_default);

  const handleEquip = (category: AvatarCategory, itemId: string | null) => {
    setConfig((prev) => {
      const next = { ...prev };
      switch (category) {
        case "head": next.equipped_head = itemId; break;
        case "body": next.equipped_body = itemId; break;
        case "accessory": next.equipped_accessory = itemId; break;
        case "background": next.equipped_background = itemId; break;
      }
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t.play.customizeAvatar}
      </h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
        <AvatarBuilder
          inventory={ownedItems}
          currentConfig={config}
          onEquip={handleEquip}
        />
      </div>
    </div>
  );
}

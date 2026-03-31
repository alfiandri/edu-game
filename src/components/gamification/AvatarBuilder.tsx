"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AvatarItem, AvatarConfig, AvatarCategory } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface AvatarBuilderProps {
  inventory: AvatarItem[];
  currentConfig: AvatarConfig;
  onEquip: (category: AvatarCategory, itemId: string | null) => void;
}

const CATEGORY_LABELS: Record<AvatarCategory, string> = {
  head: "🎩 Head",
  body: "👕 Body",
  accessory: "🎒 Accessory",
  background: "🌈 Background",
};

const AVATAR_COLORS: Record<string, string> = {
  head: "from-pink-100 to-pink-200",
  body: "from-blue-100 to-blue-200",
  accessory: "from-green-100 to-green-200",
  background: "from-yellow-100 to-orange-200",
};

export default function AvatarBuilder({
  inventory,
  currentConfig,
  onEquip,
}: AvatarBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>("head");
  const { t } = useTranslation();
  const categories: AvatarCategory[] = ["head", "body", "accessory", "background"];

  const CATEGORY_LABELS_T: Record<AvatarCategory, string> = {
    head: t.play.headCategory,
    body: t.play.bodyCategory,
    accessory: t.play.accessoryCategory,
    background: t.play.backgroundCategory,
  };

  const categoryItems = inventory.filter((i) => i.category === activeCategory);

  const getEquippedId = (category: AvatarCategory): string | null => {
    switch (category) {
      case "head": return currentConfig.equipped_head;
      case "body": return currentConfig.equipped_body;
      case "accessory": return currentConfig.equipped_accessory;
      case "background": return currentConfig.equipped_background;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Avatar Preview */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 flex items-center justify-center shadow-xl">
          <div className="relative w-32 h-32">
            {/* Simple avatar placeholder — in production, this would compose SVG layers */}
            <div className="absolute inset-0 flex items-center justify-center text-7xl">
              🧒
            </div>
            {currentConfig.equipped_head && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">
                🎩
              </div>
            )}
            {currentConfig.equipped_accessory && (
              <div className="absolute bottom-0 right-0 text-3xl">🎒</div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">{t.play.yourAvatar}</p>
      </div>

      {/* Category Tabs & Items */}
      <div className="flex-1">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {CATEGORY_LABELS_T[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {/* None option */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEquip(activeCategory, null)}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
              getEquippedId(activeCategory) === null
                ? "border-purple-500 bg-purple-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">❌</span>
            <span className="text-xs font-medium text-gray-500">{t.common.none}</span>
          </motion.button>

          {categoryItems.map((item) => {
            const isEquipped = getEquippedId(activeCategory) === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEquip(activeCategory, item.id)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  isEquipped
                    ? "border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-300"
                    : `border-gray-200 bg-gradient-to-br ${AVATAR_COLORS[activeCategory]} hover:border-gray-300`
                }`}
              >
                <span className="text-3xl">
                  {item.image_url || "🎭"}
                </span>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

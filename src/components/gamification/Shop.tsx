"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AvatarItem, AvatarCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface ShopProps {
  items: AvatarItem[];
  ownedItemIds: Set<string>;
  currencyBalance: number;
  onPurchase: (itemId: string) => Promise<boolean>;
}

export default function Shop({
  items,
  ownedItemIds,
  currencyBalance,
  onPurchase,
}: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory | "all">("all");
  const [confirmItem, setConfirmItem] = useState<AvatarItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const categories: { key: AvatarCategory | "all"; label: string }[] = [
    { key: "all", label: "🛍️ All" },
    { key: "head", label: "🎩 Head" },
    { key: "body", label: "👕 Body" },
    { key: "accessory", label: "🎒 Accessory" },
    { key: "background", label: "🌈 Background" },
  ];

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const handlePurchase = async () => {
    if (!confirmItem) return;
    setPurchasing(true);
    const success = await onPurchase(confirmItem.id);
    setPurchasing(false);
    if (success) {
      setConfirmItem(null);
    }
  };

  return (
    <div>
      {/* Balance */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
        <span className="text-lg font-bold text-gray-700">Your Coins</span>
        <span className="text-2xl font-bold text-yellow-600">
          🪙 {formatCurrency(currencyBalance)}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const owned = ownedItemIds.has(item.id);
          const canAfford = currencyBalance >= item.price_currency;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                owned
                  ? "border-green-300 bg-green-50"
                  : canAfford
                    ? "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md cursor-pointer"
                    : "border-gray-200 bg-gray-50 opacity-60"
              }`}
              onClick={() => !owned && canAfford && setConfirmItem(item)}
            >
              {owned && (
                <span className="absolute top-2 right-2 text-green-500 text-sm font-bold">
                  ✓ Owned
                </span>
              )}
              <span className="text-5xl">{item.image_url || "🎭"}</span>
              <span className="text-sm font-bold text-gray-700 text-center">
                {item.name}
              </span>
              {!owned && (
                <span className="text-sm font-bold text-yellow-600">
                  🪙 {item.price_currency}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Purchase Confirmation Modal */}
      <Modal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        title="Buy Item?"
      >
        {confirmItem && (
          <div className="flex flex-col items-center gap-4">
            <span className="text-7xl">{confirmItem.image_url || "🎭"}</span>
            <h3 className="text-xl font-bold">{confirmItem.name}</h3>
            <p className="text-lg font-bold text-yellow-600">
              🪙 {confirmItem.price_currency} coins
            </p>
            <p className="text-sm text-gray-500">
              Balance after purchase:{" "}
              <span className="font-bold">
                🪙 {formatCurrency(currencyBalance - confirmItem.price_currency)}
              </span>
            </p>
            <div className="flex gap-3 mt-2">
              <Button
                variant="ghost"
                onClick={() => setConfirmItem(null)}
                disabled={purchasing}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? "Buying..." : "Buy! 🪙"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

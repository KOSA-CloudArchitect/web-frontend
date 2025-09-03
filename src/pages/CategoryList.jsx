import { ChevronRight, Menu, Folder } from "lucide-react";
import * as LucideIcons from "lucide-react";
import React from "react";

function getCategoryIcon(iconName, size = 24) {
  const IconComponent = LucideIcons[iconName];
  return IconComponent ? <IconComponent size={size} /> : <Folder size={size} />;
}

export default function CategoryList({ categories = [], onSelect, variant = "list" }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        카테고리가 없습니다.
      </div>
    );
  }

  return (
    <div className={variant === "grid" ? "p-0 bg-transparent shadow-none" : "bg-white w-full max-w-md mx-auto mt-8 rounded-2xl shadow-xl overflow-hidden border border-gray-100"}>
      {variant === "list" && (
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <Menu size={28} className="text-blue-600" />
          <span className="text-3xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
        </div>
      )}
      <ul className={variant === "grid" ? "grid grid-cols-4 gap-3 mb-2" : ""}>
        {categories.map((cat, i) => (
          <li
            key={cat.id || i}
            className={variant === "grid"
              ? "flex flex-col items-center bg-white rounded-xl shadow p-2 cursor-pointer transition"
              : "flex items-center gap-3 px-6 py-4 border-b last:border-b-0 group cursor-pointer transition-all hover:bg-blue-50"}
            onClick={() => onSelect(cat)}
          >
            <span className={variant === "grid"
              ? "text-blue-500"
              : "text-blue-500 group-hover:scale-110 group-hover:text-blue-700 transition-transform"}
            >
              {getCategoryIcon(cat.icon, variant === "grid" ? 32 : 24)}
            </span>
            <span className={variant === "grid"
              ? "text-xs mt-1 font-semibold text-gray-700"
              : "flex-1 text-lg font-semibold text-gray-900"}
            >
              {cat.name || cat.label}
            </span>
            {variant !== "grid" && <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-400 transition" />}
          </li>
        ))}
      </ul>
    </div>
  );
} 
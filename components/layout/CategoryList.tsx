"use client";

import Link from "next/link";
import {
  Smartphone,
  UtensilsCrossed,
  Shirt,
  ShoppingCart,
  Plane,
} from "lucide-react";

const CATEGORIES = [
  { slug: "electronics", label: "Electronics", icon: Smartphone },
  { slug: "dining", label: "Dining", icon: UtensilsCrossed },
  { slug: "fashion", label: "Fashion", icon: Shirt },
  { slug: "groceries", label: "Groceries", icon: ShoppingCart },
  { slug: "travel", label: "Travel", icon: Plane },
] as const;

export function CategoryList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
        >
          <category.icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{category.label}</span>
        </Link>
      ))}
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `AED ${amount.toFixed(2)}`;
}

export function formatPriceShort(amount: number): string {
  return `AED ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

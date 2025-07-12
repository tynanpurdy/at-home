import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatJoinDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateInitials(name?: string | null): string {
  if (!name || typeof name !== "string" || name.trim() === "") {
    return ""; // Return empty string or a default placeholder if name is invalid
  }
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean) // Remove any empty strings from split
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

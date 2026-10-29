import { randomBytes } from "node:crypto";

export const createContactEnquiryReference = (date = new Date()) => {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `SG-C-${stamp}-${suffix}`;
};

export const addRetentionYear = (date = new Date()) => {
  const retainedUntil = new Date(date);
  retainedUntil.setUTCFullYear(retainedUntil.getUTCFullYear() + 1);
  return retainedUntil;
};

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] as string,
  );

const categoryLabels: Record<string, string> = {
  order: "Order",
  delivery: "Delivery",
  returns: "Returns",
  products: "Products",
  services: "Services",
  privacy: "Privacy",
  other: "Other",
};

export const contactCategoryLabel = (category: string) =>
  categoryLabels[category] || "Other";

export const CATEGORY_TREE = [
  { name: "Phones", subs: ["Flagship", "Budget", "5G"] },
  { name: "Laptops", subs: ["Ultrabook", "Gaming", "Business"] },
  { name: "Audio", subs: ["Earbuds", "Headphones", "Speakers"] },
  { name: "Wearables", subs: ["Smartwatch", "Fitness Band"] },
  { name: "Tablets", subs: ["Standard", "Pro"] },
  { name: "Accessories", subs: ["Chargers", "Cases", "Cables"] },
];

const rev = (five, four, three, two, one) => {
  const total = five + four + three + two + one;
  const avg = (five * 5 + four * 4 + three * 3 + two * 2 + one * 1) / total;
  return { total, avg: Math.round(avg * 10) / 10, breakdown: { 5: five, 4: four, 3: three, 2: two, 1: one } };
};

// Small mock catalog used only as a fallback if the backend can't be reached
// (see App.jsx's loadError handling). Once /api/products responds, this array
// is replaced in place via replaceProducts() below.
export const PRODUCTS = [
  {
    id: "p1", name: "Nova Phone 15", cat: "Phones", sub: "Flagship", price: 699, stock: 12,
    popularity: 91, createdAt: "2026-05-02",
    specs: { Display: "6.4\" OLED 120Hz", Chip: "Nova X2", RAM: "8GB", Storage: "256GB", Battery: "4500mAh" },
    tint: "#2F5EFF", why: "Because you viewed similar phones",
    reviews: rev(210, 88, 20, 6, 4),
  },
  {
    id: "p2", name: "Nova Book Pro 14", cat: "Laptops", sub: "Ultrabook", price: 1299, stock: 5,
    popularity: 84, createdAt: "2026-03-18",
    specs: { Display: "14\" 2.8K 90Hz", Chip: "Nova M3", RAM: "16GB", Storage: "512GB SSD", Battery: "18h" },
    tint: "#12151B", why: "Frequently bought with Nova Phone 15",
    reviews: rev(140, 52, 10, 3, 1),
  },
  {
    id: "p3", name: "Nova Buds Air", cat: "Audio", sub: "Earbuds", price: 129, stock: 34,
    popularity: 76, createdAt: "2026-06-10",
    specs: { Driver: "11mm dynamic", ANC: "Adaptive, 42dB", Battery: "6h + 24h case", Codec: "LDAC", Weight: "4.5g" },
    tint: "#FF5A36", why: "Popular in Audio this week",
    reviews: rev(98, 40, 15, 5, 2),
  },
  {
    id: "p4", name: "Nova Watch S", cat: "Wearables", sub: "Smartwatch", price: 249, stock: 0,
    popularity: 68, createdAt: "2026-02-27",
    specs: { Display: "1.4\" AMOLED", Sensors: "SpO2, ECG, GPS", Battery: "5 days", "Water rating": "5ATM", Strap: "22mm" },
    tint: "#1C9A6C", why: "Based on your cart",
    reviews: rev(60, 30, 8, 4, 2),
  },
];

export const RELATED = {
  p1: ["p2", "p3"], p2: ["p1", "p3"], p3: ["p1", "p2"], p4: ["p1", "p3"],
};

export function replaceProducts(newList) {
  PRODUCTS.length = 0;
  PRODUCTS.push(...newList);
}
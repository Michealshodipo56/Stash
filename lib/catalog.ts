/**
 * Static retailer catalog for Aidex AI price lookup.
 * Curated list of known Nigerian retailers and popular tech/student items.
 */

export interface RetailerOption {
  id: string;
  retailer: "Slot Nigeria" | "Jumia Nigeria" | "Konga" | "iStore Nigeria" | "Studio 24";
  retailerBadgeColor: string;
  itemTitle: string;
  price: number;
  url: string;
  category: "phone" | "laptop" | "audio" | "projector" | "power" | "camera" | "other";
  emoji: string;
  description: string;
}

export const RETAILER_CATALOG: RetailerOption[] = [
  // iPhones / Phones
  {
    id: "slot-iphone-14",
    retailer: "Slot Nigeria",
    retailerBadgeColor: "#e63946",
    itemTitle: "Apple iPhone 14 (128GB, Midnight)",
    price: 920_000,
    url: "https://slot.ng/apple-iphone-14-128gb",
    category: "phone",
    emoji: "📱",
    description: "Official Nigerian warranty · Slot Store nationwide pickup",
  },
  {
    id: "jumia-iphone-14",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Apple iPhone 14 6.1\" 128GB ROM",
    price: 895_000,
    url: "https://www.jumia.com.ng/apple-iphone-14-128gb",
    category: "phone",
    emoji: "📱",
    description: "Jumia Express fast delivery · Verified Seller",
  },
  {
    id: "istore-iphone-14",
    retailer: "iStore Nigeria",
    retailerBadgeColor: "#4361ee",
    itemTitle: "iPhone 14 128GB - Authorized Apple Reseller",
    price: 940_000,
    url: "https://istore.com.ng/iphone-14",
    category: "phone",
    emoji: "📱",
    description: "Apple Certified 1-Year Local Warranty & Support",
  },
  {
    id: "konga-samsung-s23",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "Samsung Galaxy S23 Ultra (256GB)",
    price: 1_250_000,
    url: "https://www.konga.com/product/samsung-galaxy-s23-ultra",
    category: "phone",
    emoji: "📱",
    description: "Konga Pay verified guarantee",
  },
  {
    id: "slot-redmi-note-13",
    retailer: "Slot Nigeria",
    retailerBadgeColor: "#e63946",
    itemTitle: "Xiaomi Redmi Note 13 Pro (8GB / 256GB)",
    price: 345_000,
    url: "https://slot.ng/xiaomi-redmi-note-13",
    category: "phone",
    emoji: "📱",
    description: "Best student value phone with 200MP camera",
  },

  // MacBooks & Laptops
  {
    id: "istore-macbook-air-m2",
    retailer: "iStore Nigeria",
    retailerBadgeColor: "#4361ee",
    itemTitle: "MacBook Air 13-inch (M2 Chip, 8GB RAM, 256GB SSD)",
    price: 1_480_000,
    url: "https://istore.com.ng/macbook-air-m2",
    category: "laptop",
    emoji: "💻",
    description: "Genuine Apple with official AppleCare support in Lagos/Abuja",
  },
  {
    id: "slot-macbook-air-m1",
    retailer: "Slot Nigeria",
    retailerBadgeColor: "#e63946",
    itemTitle: "Apple MacBook Air M1 (8GB / 256GB Space Grey)",
    price: 980_000,
    url: "https://slot.ng/macbook-air-m1",
    category: "laptop",
    emoji: "💻",
    description: "Student workhorse laptop with all-day battery life",
  },
  {
    id: "jumia-hp-pavilion-15",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "HP Pavilion 15 Core i5 (16GB RAM, 512GB SSD)",
    price: 680_000,
    url: "https://www.jumia.com.ng/hp-pavilion-15",
    category: "laptop",
    emoji: "💻",
    description: "15.6\" FHD IPS screen, perfect for coding & coursework",
  },

  // Projectors
  {
    id: "konga-epson-projector",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "Epson EB-E01 3300 Lumens XGA 3LCD Projector",
    price: 480_000,
    url: "https://www.konga.com/product/epson-eb-e01-projector",
    category: "projector",
    emoji: "🎥",
    description: "Standard projector for lecture halls and department demos",
  },
  {
    id: "jumia-wanbo-mini-projector",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Wanbo T2 Max Full HD Portable Smart Projector",
    price: 210_000,
    url: "https://www.jumia.com.ng/wanbo-t2-max",
    category: "projector",
    emoji: "🎥",
    description: "Compact smart projector with built-in speakers & Android OS",
  },

  // Power Stations / Inverters
  {
    id: "jumia-ecoflow-river-2",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "EcoFlow RIVER 2 Portable Power Station 256Wh",
    price: 320_000,
    url: "https://www.jumia.com.ng/ecoflow-river-2",
    category: "power",
    emoji: "⚡",
    description: "Charges in 60 minutes · Powers laptops, phones and Wi-Fi routers",
  },
  {
    id: "konga-anker-powerhouse",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "Anker 521 PowerHouse (256Wh LiFePO4)",
    price: 360_000,
    url: "https://www.konga.com/product/anker-521-powerhouse",
    category: "power",
    emoji: "🔋",
    description: "10-year lifespan battery for uninterrupted hostel power",
  },

  // Cameras
  {
    id: "studio24-canon-m50",
    retailer: "Studio 24",
    retailerBadgeColor: "#1d3557",
    itemTitle: "Canon EOS M50 Mark II Mirrorless Camera with 15-45mm Lens",
    price: 780_000,
    url: "https://studio24store.ng/canon-eos-m50-mark-ii",
    category: "camera",
    emoji: "📷",
    description: "Ideal for student media, YouTube, content creation & events",
  },
  {
    id: "konga-sony-zv-e10",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "Sony ZV-E10 Vlog Camera (Body + 16-50mm Lens)",
    price: 920_000,
    url: "https://www.konga.com/product/sony-zv-e10",
    category: "camera",
    emoji: "📸",
    description: "4K Video, articulating screen, pristine audio input",
  },
];

export function searchCatalog(query: string): RetailerOption[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter((t) => t.length > 1);

  const scored = RETAILER_CATALOG.map((item) => {
    let score = 0;
    const title = item.itemTitle.toLowerCase();
    const cat = item.category.toLowerCase();
    const desc = item.description.toLowerCase();

    for (const token of tokens) {
      if (title.includes(token)) score += 3;
      if (cat.includes(token)) score += 2;
      if (desc.includes(token)) score += 1;
    }
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.item);
}

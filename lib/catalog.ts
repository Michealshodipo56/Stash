/**
 * Static retailer catalog for Aidex AI price lookup.
 * Broad Nigerian retail coverage — phones, laptops, appliances, travel, school, etc.
 */

export interface RetailerOption {
  id: string;
  retailer: "Slot Nigeria" | "Jumia Nigeria" | "Konga" | "iStore Nigeria" | "Studio 24" | "Travelbeta" | "Pointek";
  retailerBadgeColor: string;
  itemTitle: string;
  price: number;
  url: string;
  category:
    | "phone"
    | "laptop"
    | "audio"
    | "projector"
    | "power"
    | "camera"
    | "appliance"
    | "fashion"
    | "education"
    | "travel"
    | "furniture"
    | "other";
  emoji: string;
  description: string;
  keywords?: string[];
}

export const RETAILER_CATALOG: RetailerOption[] = [
  // Phones
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
    keywords: ["iphone", "apple", "phone", "smartphone", "ios"],
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
    keywords: ["iphone", "apple", "phone", "smartphone"],
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
    keywords: ["iphone", "apple", "phone"],
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
    keywords: ["samsung", "galaxy", "android", "phone", "s23"],
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
    keywords: ["redmi", "xiaomi", "android", "phone", "note"],
  },
  {
    id: "jumia-tecno-camon",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Tecno Camon 30 (8GB / 256GB)",
    price: 285_000,
    url: "https://www.jumia.com.ng/tecno-camon-30",
    category: "phone",
    emoji: "📱",
    description: "Popular Nigerian mid-range phone",
    keywords: ["tecno", "camon", "android", "phone"],
  },

  // Laptops
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
    keywords: ["macbook", "apple", "laptop", "notebook", "m2", "mac"],
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
    keywords: ["macbook", "apple", "laptop", "m1", "mac"],
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
    keywords: ["hp", "pavilion", "laptop", "notebook", "computer", "pc"],
  },
  {
    id: "konga-dell-inspiron",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "Dell Inspiron 15 Core i7 (16GB / 512GB SSD)",
    price: 890_000,
    url: "https://www.konga.com/product/dell-inspiron-15",
    category: "laptop",
    emoji: "💻",
    description: "Powerful Windows laptop for school and work",
    keywords: ["dell", "inspiron", "laptop", "notebook", "computer", "pc"],
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
    emoji: "📽️",
    description: "Standard projector for lecture halls and department demos",
    keywords: ["epson", "projector", "presentation", "beamer"],
  },
  {
    id: "jumia-wanbo-mini-projector",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Wanbo T2 Max Full HD Portable Smart Projector",
    price: 210_000,
    url: "https://www.jumia.com.ng/wanbo-t2-max",
    category: "projector",
    emoji: "📽️",
    description: "Compact smart projector with built-in speakers & Android OS",
    keywords: ["wanbo", "projector", "portable", "mini projector"],
  },

  // Power
  {
    id: "jumia-ecoflow-river-2",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "EcoFlow RIVER 2 Portable Power Station 256Wh",
    price: 320_000,
    url: "https://www.jumia.com.ng/ecoflow-river-2",
    category: "power",
    emoji: "⚡",
    description: "Charges in 60 minutes · Backup power for hostel or travel",
    keywords: ["ecoflow", "power station", "inverter", "generator", "powerbank", "battery"],
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
    keywords: ["anker", "powerhouse", "power station", "inverter", "battery"],
  },
  {
    id: "jumia-sumec-generator",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "SUMEC Firman 2.8kVA Petrol Generator",
    price: 425_000,
    url: "https://www.jumia.com.ng/sumec-firman-generator",
    category: "power",
    emoji: "⚙️",
    description: "Reliable backup generator for home and small shops",
    keywords: ["generator", "sumec", "firman", "petrol", "power"],
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
    keywords: ["canon", "camera", "mirrorless", "photography", "vlog"],
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
    keywords: ["sony", "camera", "vlog", "zv-e10", "photography"],
  },

  // Appliances
  {
    id: "jumia-hisense-ac",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Hisense 1.5HP Split Air Conditioner",
    price: 385_000,
    url: "https://www.jumia.com.ng/hisense-15hp-ac",
    category: "appliance",
    emoji: "❄️",
    description: "Energy-efficient AC for bedroom or small office",
    keywords: ["ac", "air conditioner", "hisense", "cooling", "split unit"],
  },
  {
    id: "konga-lg-fridge",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "LG 258L Double Door Refrigerator",
    price: 520_000,
    url: "https://www.konga.com/product/lg-258l-fridge",
    category: "appliance",
    emoji: "🧊",
    description: "Family-size fridge with inverter compressor",
    keywords: ["fridge", "refrigerator", "lg", "freezer", "appliance"],
  },
  {
    id: "jumia-nexus-washing",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Nexus 7kg Front Load Washing Machine",
    price: 295_000,
    url: "https://www.jumia.com.ng/nexus-washing-machine",
    category: "appliance",
    emoji: "🧺",
    description: "Compact washing machine for apartments",
    keywords: ["washing machine", "washer", "laundry", "nexus"],
  },
  {
    id: "konga-binatone-microwave",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "Binatone 20L Microwave Oven",
    price: 85_000,
    url: "https://www.konga.com/product/binatone-microwave",
    category: "appliance",
    emoji: "🍲",
    description: "Everyday kitchen microwave",
    keywords: ["microwave", "oven", "kitchen", "binatone"],
  },

  // Education
  {
    id: "jumia-school-fees-kit",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "University School Fees Savings Target (₦150,000)",
    price: 150_000,
    url: "https://www.jumia.com.ng/",
    category: "education",
    emoji: "🎓",
    description: "Typical semester fees benchmark for planning",
    keywords: ["school", "fees", "tuition", "university", "semester", "education"],
  },
  {
    id: "pointek-jamb-prep",
    retailer: "Pointek",
    retailerBadgeColor: "#2a9d8f",
    itemTitle: "JAMB / UTME Prep Laptop Bundle",
    price: 420_000,
    url: "https://pointekonline.com/",
    category: "education",
    emoji: "📚",
    description: "Entry laptop + study essentials for exam prep",
    keywords: ["jamb", "utme", "exam", "school", "study", "education"],
  },

  // Travel
  {
    id: "travelbeta-detty",
    retailer: "Travelbeta",
    retailerBadgeColor: "#023e8a",
    itemTitle: "Detty December Lagos Weekend Package (2 nights)",
    price: 360_000,
    url: "https://www.travelbeta.com/",
    category: "travel",
    emoji: "🏝️",
    description: "Hotel + activities package for December trip",
    keywords: ["detty", "december", "trip", "travel", "lagos", "holiday", "vacation"],
  },
  {
    id: "travelbeta-abuja",
    retailer: "Travelbeta",
    retailerBadgeColor: "#023e8a",
    itemTitle: "Abuja Return Flight + 3-Night Hotel",
    price: 275_000,
    url: "https://www.travelbeta.com/",
    category: "travel",
    emoji: "✈️",
    description: "Domestic trip package for business or family",
    keywords: ["flight", "abuja", "hotel", "travel", "trip", "ticket"],
  },
  {
    id: "travelbeta-dubai",
    retailer: "Travelbeta",
    retailerBadgeColor: "#023e8a",
    itemTitle: "Dubai 5-Day Group Tour (ex-Lagos)",
    price: 1_850_000,
    url: "https://www.travelbeta.com/",
    category: "travel",
    emoji: "🌍",
    description: "International holiday package including flights",
    keywords: ["dubai", "travel", "tour", "holiday", "vacation", "abroad"],
  },

  // Furniture / home
  {
    id: "jumia-sofa-set",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "3-Seater Fabric Sofa Set",
    price: 245_000,
    url: "https://www.jumia.com.ng/sofa-set",
    category: "furniture",
    emoji: "🛋️",
    description: "Living room sofa for new apartment",
    keywords: ["sofa", "couch", "furniture", "living room", "settee"],
  },
  {
    id: "konga-mattress",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "6x6 Orthopedic Foam Mattress",
    price: 165_000,
    url: "https://www.konga.com/product/foam-mattress",
    category: "furniture",
    emoji: "🛏️",
    description: "Quality mattress for hostel or apartment",
    keywords: ["mattress", "bed", "foam", "furniture", "sleep"],
  },

  // Fashion / other
  {
    id: "jumia-nike-sneakers",
    retailer: "Jumia Nigeria",
    retailerBadgeColor: "#f77f00",
    itemTitle: "Nike Air Force 1 Sneakers",
    price: 95_000,
    url: "https://www.jumia.com.ng/nike-air-force-1",
    category: "fashion",
    emoji: "👟",
    description: "Classic sneakers — popular gift/savings item",
    keywords: ["nike", "sneakers", "shoes", "trainers", "fashion"],
  },
  {
    id: "konga-ps5",
    retailer: "Konga",
    retailerBadgeColor: "#d90429",
    itemTitle: "PlayStation 5 Disc Console",
    price: 780_000,
    url: "https://www.konga.com/product/playstation-5",
    category: "other",
    emoji: "🎮",
    description: "Gaming console with DualSense controller",
    keywords: ["ps5", "playstation", "console", "gaming", "sony"],
  },
];

const STOPWORDS = new Set([
  "a", "an", "the", "for", "to", "of", "and", "or", "my", "i", "want", "save",
  "buy", "get", "need", "some", "before", "by", "in", "next", "soon", "with",
]);

const SYNONYMS: Record<string, string[]> = {
  phone: ["phone", "smartphone", "mobile", "iphone", "android"],
  laptop: ["laptop", "notebook", "macbook", "computer", "pc"],
  projector: ["projector", "beamer", "presentation"],
  fridge: ["fridge", "refrigerator", "freezer"],
  ac: ["ac", "air", "conditioner", "cooling"],
  trip: ["trip", "travel", "holiday", "vacation", "tour", "flight"],
  school: ["school", "fees", "tuition", "education", "semester", "university"],
  generator: ["generator", "inverter", "power"],
  camera: ["camera", "photography", "vlog", "mirrorless"],
  mattress: ["mattress", "bed", "foam"],
  sofa: ["sofa", "couch", "settee", "furniture"],
};

function expandTokens(tokens: string[]): string[] {
  const out = new Set(tokens);
  for (const t of tokens) {
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (syns.includes(t) || key === t) {
        syns.forEach((s) => out.add(s));
        out.add(key);
      }
    }
  }
  return [...out];
}

export function searchCatalog(query: string): RetailerOption[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const rawTokens = q
    .split(/[^a-z0-9+]+/i)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  const tokens = expandTokens(rawTokens);
  if (tokens.length === 0) return [];

  const scored = RETAILER_CATALOG.map((item) => {
    let score = 0;
    const title = item.itemTitle.toLowerCase();
    const cat = item.category.toLowerCase();
    const keys = (item.keywords || []).map((k) => k.toLowerCase());
    const haystack = `${title} ${cat} ${keys.join(" ")}`;

    // Full-phrase boost
    if (title.includes(q) || keys.some((k) => q.includes(k) && k.length > 3)) {
      score += 8;
    }

    for (const token of tokens) {
      if (keys.some((k) => k === token || k.includes(token))) score += 5;
      else if (title.includes(token)) score += 4;
      else if (cat === token || cat.includes(token)) score += 3;
      else if (haystack.includes(token)) score += 1;
    }

    // Penalize weak cross-category noise (e.g. "phone" inside unrelated copy)
    if (!tokens.some((t) => ["phone", "iphone", "samsung", "tecno", "redmi", "smartphone", "mobile"].includes(t))) {
      if (item.category === "phone") score -= 2;
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score >= 4)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .slice(0, 4)
    .map((s) => s.item);
}

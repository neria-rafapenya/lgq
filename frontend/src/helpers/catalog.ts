import type { CatalogItem } from "../lib/api";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const keywordGroups: Array<{
  keywords: string[];
  categoryHints: string[];
  room?: "bathroom" | "kitchen" | "general";
}> = [
  {
    keywords: ["inodoro", "lavabo", "bide", "sanitario", "banio", "mampara", "grifer"],
    categoryHints: ["sanitar", "bano", "grif", "mampar", "mobiliario"],
    room: "bathroom",
  },
  {
    keywords: ["lampara", "aplique", "ilumin", "interruptor", "enchufe"],
    categoryHints: ["ilumin", "electric", "mecanismo"],
    room: "general",
  },
  {
    keywords: ["suelo", "pavimento", "baldosa", "azulejo", "alicat", "pared"],
    categoryHints: ["pav", "alicat", "revest", "pint"],
    room: "general",
  },
  {
    keywords: ["puerta", "ventana", "carpinter"],
    categoryHints: ["puert", "ventan", "carp"],
    room: "general",
  },
  {
    keywords: ["cocina", "encimera", "fregadero", "campana", "electro", "mueble"],
    categoryHints: ["cocin", "electro", "encimer", "mueble"],
    room: "kitchen",
  },
];

export const inferCatalogFilter = (
  items: CatalogItem[],
  assistantMessage: string,
) => {
  if (!assistantMessage) return { items, room: "general" as const };
  const text = normalize(assistantMessage);
  const rule = keywordGroups.find((group) =>
    group.keywords.some((keyword) => text.includes(keyword)),
  );
  if (!rule) return { items, room: "general" as const };
  const filtered = items.filter((item) => {
    const category = normalize(item.category || "");
    const subcategory = normalize(item.subcategory || "");
    const name = normalize(item.name || "");
    return rule.categoryHints.some(
      (hint) =>
        category.includes(hint) ||
        subcategory.includes(hint) ||
        name.includes(hint),
    );
  });
  return {
    items: filtered.length ? filtered : items,
    room: rule.room ?? "general",
  };
};

export const isEquipmentItem = (item: CatalogItem) => {
  const category = normalize(item.category || "");
  const subcategory = normalize(item.subcategory || "");
  return (
    category.includes("sanitar") ||
    category.includes("mobiliario") ||
    category.includes("grifer") ||
    category.includes("mampar") ||
    category.includes("electro") ||
    category.includes("ilumin") ||
    category.includes("mecanismo") ||
    category.includes("puert") ||
    category.includes("ventan") ||
    subcategory.includes("sanitar") ||
    subcategory.includes("mobiliario") ||
    subcategory.includes("grifer") ||
    subcategory.includes("mampar") ||
    subcategory.includes("electro") ||
    subcategory.includes("ilumin") ||
    subcategory.includes("mecanismo") ||
    subcategory.includes("puert") ||
    subcategory.includes("ventan")
  );
};

export const formatCatalogSelectionMessage = (items: CatalogItem[]) => {
  if (!items.length) return "";
  const formatted = items.map((item) => {
    const name = item.name || "Artículo";
    return `${name} (ID ${item.lineitemId}/${item.variantId})`;
  });
  return `He elegido del catálogo: ${formatted.join(", ")}.`;
};

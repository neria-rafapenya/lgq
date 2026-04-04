export const formatValue = (
  value: string | number | boolean | null | undefined,
) => {
  if (value === null || value === undefined) return "Pendiente";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return `${value}`;
  return value;
};

export const humanize = (
  value: string | null | undefined,
  mapping: Record<string, string>,
) => {
  if (!value) return "Pendiente";
  return mapping[value] ?? value;
};

export const formatAssistantBody = (content: string): string => {
  if (content.includes("\n")) return content;
  const markerIndex = content.indexOf("¿");
  if (markerIndex > 0) {
    const before = content.slice(0, markerIndex).trim();
    const after = content.slice(markerIndex).trim();
    if (before && after) {
      return `${before}\n\n${after}`;
    }
  }
  return content;
};

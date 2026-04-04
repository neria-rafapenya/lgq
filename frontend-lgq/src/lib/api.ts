export type AuthUser = {
  id: number;
  email: string;
  name?: string | null;
  role: string;
};

export type ProjectSummary = {
  id: number;
  name: string;
};

export type LgqAction = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
};

export type LgqCatalogVariant = {
  id: number;
  name: string;
  material?: string | null;
  quality?: string | null;
  imageUrl?: string | null;
  sizeXcm?: number | null;
  sizeYcm?: number | null;
  sizeZcm?: number | null;
  price: number;
  isDefault: boolean;
};

export type LgqCatalogItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  description?: string | null;
  imageUrl?: string | null;
  variants: LgqCatalogVariant[];
};

export type LgqCatalogSummary = {
  id: number;
  code: string;
  name: string;
};

export type LgqCatalogResponse = {
  id: number;
  code: string;
  name: string;
  items: LgqCatalogItem[];
};

export type LgqTaskLine = {
  taskId: number;
  taskName: string;
  unit: string;
  quantity: number;
  hours: number;
  role: string;
  hourlyRate: number;
  amount: number;
};

export type LgqLaborLine = {
  role: string;
  hours: number;
  hourlyRate: number;
  amount: number;
};

export type LgqBudgetResponse = {
  projectId: number;
  subtotal: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
  catalog: unknown[];
  tasks: LgqTaskLine[];
  labor: LgqLaborLine[];
};

export type LgqSubactOption = {
  key: string;
  label: string;
};

export type LgqSubact = {
  id: number;
  key: string;
  label: string;
  helper?: string | null;
  type: "catalog" | "options" | "text";
  catalogCode?: string | null;
  options: LgqSubactOption[];
  sortOrder?: number | null;
};

export type LgqProjectBaseRequest = {
  actionId: number | null;
  city: string | null;
  province: string | null;
  answers: Record<string, unknown>;
};

export type LgqProjectBaseResponse = {
  projectId: number;
  actionId: number | null;
  city: string | null;
  province: string | null;
  answers: Record<string, unknown> | null;
};

export type LgqCatalogSelectionRequest = {
  catalogItemId: number;
  variantId: number;
  quantity: number;
  unitPrice: number | null;
  isSelected: boolean;
  colorHex?: string | null;
};

export type LgqCatalogSelectionResponse = {
  catalogItemId: number;
  itemName: string;
  variantId: number;
  variantLabel: string;
  quantity: number;
  unitPrice: number | null;
  catalogCode: string;
  colorHex?: string | null;
};

export type LgqCatalogItemUpsertRequest = {
  code: string;
  name: string;
  unit: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type LgqCatalogVariantUpsertRequest = {
  name: string;
  material?: string | null;
  quality?: string | null;
  imageUrl?: string | null;
  sizeXcm?: number | null;
  sizeYcm?: number | null;
  sizeZcm?: number | null;
  price: number;
  isDefault?: boolean;
  isActive?: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Request failed") as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    return text as unknown as T;
  }
}

export async function register(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me");
}

export async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", { method: "POST" });
}

export async function fetchLgqActions(): Promise<LgqAction[]> {
  return request<LgqAction[]>("/api/lgq/actions");
}

export async function fetchAiCopy(prompt: string): Promise<string> {
  const response = await request<{ text: string }>("/api/ai/copy", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
  return response?.text ?? "";
}

export async function fetchSubacts(actionCode: string): Promise<LgqSubact[]> {
  return request<LgqSubact[]>(`/api/lgq/actions/${actionCode}/subacts`);
}

export async function createProject(name: string): Promise<{ id: number }> {
  return request<{ id: number }>("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  return request<ProjectSummary[]>("/api/projects");
}

export async function fetchCatalogs(): Promise<LgqCatalogSummary[]> {
  return request<LgqCatalogSummary[]>("/api/lgq/catalogs");
}

export async function saveProjectActions(
  projectId: number,
  actionIds: number[],
): Promise<void> {
  await request<void>(`/api/lgq/projects/${projectId}/actions`, {
    method: "PUT",
    body: JSON.stringify(actionIds),
  });
}

export async function saveLgqBase(
  projectId: number,
  payload: LgqProjectBaseRequest,
): Promise<void> {
  await request<void>(`/api/lgq/projects/${projectId}/base`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchLgqBase(
  projectId: number,
): Promise<LgqProjectBaseResponse | null> {
  return request<LgqProjectBaseResponse | null>(
    `/api/lgq/projects/${projectId}/base`,
  );
}

export async function saveCatalogSelections(
  projectId: number,
  selections: LgqCatalogSelectionRequest[],
): Promise<void> {
  await request<void>(`/api/lgq/projects/${projectId}/catalog`, {
    method: "PUT",
    body: JSON.stringify(selections),
  });
}

export async function fetchCatalogSelections(
  projectId: number,
): Promise<LgqCatalogSelectionResponse[]> {
  return request<LgqCatalogSelectionResponse[]>(
    `/api/lgq/projects/${projectId}/catalog`,
  );
}

export async function fetchCatalogByCode(code: string): Promise<LgqCatalogResponse> {
  return request<LgqCatalogResponse>(`/api/lgq/catalogs/${code}`);
}

export async function calculateLgqBudget(
  projectId: number,
): Promise<LgqBudgetResponse> {
  return request<LgqBudgetResponse>(`/api/lgq/projects/${projectId}/calculate`, {
    method: "POST",
  });
}

export async function downloadLgqBudgetPdf(projectId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/lgq/projects/${projectId}/budget/pdf`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No pude descargar el PDF.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `presupuesto-lgq-${projectId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export async function createCatalogItem(
  catalogCode: string,
  payload: LgqCatalogItemUpsertRequest,
): Promise<{ id: number }> {
  return request<{ id: number }>(`/api/lgq/admin/catalogs/${catalogCode}/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCatalogItem(
  itemId: number,
  payload: LgqCatalogItemUpsertRequest,
): Promise<void> {
  await request<void>(`/api/lgq/admin/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCatalogItem(itemId: number): Promise<void> {
  await request<void>(`/api/lgq/admin/items/${itemId}`, { method: "DELETE" });
}

export async function createCatalogVariant(
  itemId: number,
  payload: LgqCatalogVariantUpsertRequest,
): Promise<{ id: number }> {
  return request<{ id: number }>(`/api/lgq/admin/items/${itemId}/variants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCatalogVariant(
  variantId: number,
  payload: LgqCatalogVariantUpsertRequest,
): Promise<void> {
  await request<void>(`/api/lgq/admin/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCatalogVariant(variantId: number): Promise<void> {
  await request<void>(`/api/lgq/admin/variants/${variantId}`, {
    method: "DELETE",
  });
}

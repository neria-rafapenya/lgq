export type ProjectSummary = {
  id: number
  name: string | null
}

export type ProjectScope = {
  reformType: string
  hasLayoutChanges: boolean
  moveKitchen: boolean
  moveBathroom: boolean
  demolishWalls: boolean
  openSpaces: boolean
}

export type ProjectSpaceState = {
  areaM2: number | null
  heightM: number | null
  hasDistributionPlan: boolean
  plumbingStatus: string | null
  electricalStatus: string | null
  drainageStatus: string | null
  wallType: string | null
  demolitionRequired: boolean
}

export type ProjectInstallations = {
  plumbingRenovation: string
  electricalRenovation: string
  gasRenovation: string
  newWaterPoints: number
  newLightPoints: number
  newSocketPoints: number
  heatingType: string
  hasHeatingSystem: boolean
}

export type BudgetResponse = {
  projectId: number
  materials: number
  equipment: number
  labor: number
  extras: number
  base: number
  marginPercentage: number
  contingencyPercentage: number
  total: number
  categories: CategoryTotal[]
}

export type CategoryTotal = {
  category: string
  total: number
}

export type PublicBudgetResponse = {
  projectId: number
  projectName: string | null
  materials: number
  equipment: number
  labor: number
  extras: number
  base: number
  marginPercentage: number
  contingencyPercentage: number
  total: number
  categories: CategoryTotal[]
}

export type WizardTurnResponse = {
  conversationId: number
  assistantMessage: string
  scope: ProjectScope
  spaceState: ProjectSpaceState
  installations: ProjectInstallations
  missing: string[]
  nextFocus?: string
}

export type ConversationMessage = {
  id: number
  role: 'assistant' | 'user'
  content: string
}

export type ConversationHistoryResponse = {
  conversationId: number | null
  messages: ConversationMessage[]
  missing: string[]
}

export type CatalogItem = {
  lineitemId: number
  variantId: number
  name: string
  category: string
  subcategory: string
  unit: string
  quality: string
  price: number
}

export type MaterialSelectionItem = {
  lineitemId: number
  variantId: number
  quantity: number
  unitPrice?: number
  isSelected?: boolean
  isCustom?: boolean
}

export type EquipmentSelectionItem = {
  lineitemId: number
  variantId: number
  quantity: number
  unitPrice?: number
  room: string
  isSelected?: boolean
}

export type AuthUser = {
  id: number
  email: string
  name?: string | null
  role: string
}

const runtimeApiBase =
  typeof window !== 'undefined' ? (window as Window).LGQ_API_BASE : undefined
const API_BASE = runtimeApiBase || import.meta.env.VITE_API_BASE || 'http://localhost:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || 'Request failed') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

async function publicRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || 'Request failed') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

async function downloadFile(path: string, filenameFallback: string): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || 'Request failed') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match ? match[1] : filenameFallback

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  return request<ProjectSummary[]>('/api/projects')
}

export async function register(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function logout(): Promise<void> {
  await request<void>('/api/auth/logout', { method: 'POST' })
}

export async function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/me')
}

export async function updateProfile(name: string | null): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export async function createProject(name: string): Promise<{ id: number }> {
  return request<{ id: number }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function deleteProject(projectId: number): Promise<void> {
  await request<void>(`/api/projects/${projectId}`, { method: 'DELETE' })
}

export async function fetchScope(projectId: number): Promise<ProjectScope> {
  return request<ProjectScope>(`/api/projects/${projectId}/scope`)
}

export async function saveScope(projectId: number, scope: ProjectScope): Promise<void> {
  await request<void>(`/api/projects/${projectId}/scope`, {
    method: 'PUT',
    body: JSON.stringify(scope),
  })
}

export async function fetchSpaceState(projectId: number): Promise<ProjectSpaceState> {
  return request<ProjectSpaceState>(`/api/projects/${projectId}/space-state`)
}

export async function saveSpaceState(
  projectId: number,
  state: ProjectSpaceState
): Promise<void> {
  await request<void>(`/api/projects/${projectId}/space-state`, {
    method: 'PUT',
    body: JSON.stringify(state),
  })
}

export async function fetchInstallations(projectId: number): Promise<ProjectInstallations> {
  return request<ProjectInstallations>(`/api/projects/${projectId}/installations`)
}

export async function saveInstallations(
  projectId: number,
  installations: ProjectInstallations
): Promise<void> {
  await request<void>(`/api/projects/${projectId}/installations`, {
    method: 'PUT',
    body: JSON.stringify(installations),
  })
}

export async function fetchBudget(projectId: number): Promise<BudgetResponse> {
  return request<BudgetResponse>(`/api/projects/${projectId}/budget`)
}

export async function downloadBudgetPdf(projectId: number): Promise<void> {
  await downloadFile(`/api/projects/${projectId}/budget/pdf`, `presupuesto-${projectId}.pdf`)
}

export async function fetchConversation(projectId: number): Promise<ConversationHistoryResponse> {
  return request<ConversationHistoryResponse>(`/api/projects/${projectId}/conversation`)
}

export async function fetchCatalogItems(category?: string): Promise<CatalogItem[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return request<CatalogItem[]>(`/api/catalog${query}`)
}

export async function fetchMaterials(projectId: number): Promise<MaterialSelectionItem[]> {
  return request<MaterialSelectionItem[]>(`/api/projects/${projectId}/materials`)
}

export async function fetchEquipment(projectId: number): Promise<EquipmentSelectionItem[]> {
  return request<EquipmentSelectionItem[]>(`/api/projects/${projectId}/equipment`)
}

export async function saveMaterials(
  projectId: number,
  items: MaterialSelectionItem[]
): Promise<void> {
  await request<void>(`/api/projects/${projectId}/materials`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}

export async function saveEquipment(
  projectId: number,
  items: EquipmentSelectionItem[]
): Promise<void> {
  await request<void>(`/api/projects/${projectId}/equipment`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}

export async function fetchPublicBudget(projectId: string): Promise<PublicBudgetResponse> {
  return publicRequest<PublicBudgetResponse>(`/api/public/budgets/${projectId}`)
}

export async function wizardTurn(
  projectId: number,
  message: string | null,
  conversationId?: number | null
): Promise<WizardTurnResponse> {
  return request<WizardTurnResponse>('/api/ai/wizard/turn', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      message,
      conversationId: conversationId ?? null,
    }),
  })
}

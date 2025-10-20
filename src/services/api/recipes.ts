export type Recipe = {
    id: number
    title: string
    description?: string | null
    prepMinutes: number
    cookMinutes: number
    totalMinutes: number
    dietTags: string[]
    baselineTag: string | null
    categories: string[]
    ingredients: { id: number; name: string; amount: number; unit: string }[]
    steps: { id: number; position: number; text: string }[]
}

export type IngredientCreate = { name: string; amount: number; unit: string }
export type StepCreate = { position: number; text: string }

export type RecipeCreatePayload = {
    title: string
    description?: string
    prepMinutes: number
    cookMinutes: number
    dietTags: string[]
    categories: string[]
    ingredients: IngredientCreate[]
    steps: StepCreate[]
}

export type CreatedIdResponse = { id: number }

const API_BASE = import.meta.env.VITE_API_BASE

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
    })
    if (!res.ok) {
        let msg = `${res.status} ${res.statusText}`
        try {
            const j = await res.json()
            msg = j?.message || msg
        } catch {}
        throw new Error(msg)
    }
    if (res.status === 204) return undefined as unknown as T
    return (await res.json()) as T
}

/** --- API-Funktionen --- */
export const listRecipes = () => api<Recipe[]>('/recipes')
export const getRecipe = (id: number) => api<Recipe>(`/recipes/${id}`)
export const createRecipe = (payload: RecipeCreatePayload) =>
    api<CreatedIdResponse>('/recipes', { method: 'POST', body: JSON.stringify(payload) })

// Voll-Update (PUT) – ersetzt Zutaten/Steps vollständig
export const updateRecipe = (id: number, payload: RecipeCreatePayload) =>
    api<void>(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const deleteRecipe = (id: number) =>
    api<void>(`/recipes/${id}`, { method: 'DELETE' })

/** Hilfs-Fabrik für leeres Formular */
export function emptyRecipeCreate(): RecipeCreatePayload {
    return {
        title: '',
        description: '',
        prepMinutes: 0,
        cookMinutes: 0,
        dietTags: [],
        categories: [],
        ingredients: [],
        steps: [],
    }
}

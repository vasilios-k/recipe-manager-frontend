// src/services/api/recipes.ts

const BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

// ----------------------
// Typen
// ----------------------
export type DietTag =
// BASELINE
    | "VEGAN" | "VEGETARIAN" | "PESCETARIAN" | "OMNIVORE"
    // ALLERGEN_FREE
    | "GLUTEN_FREE" | "LACTOSE_FREE" | "SOY_FREE" | "EGG_FREE" | "SHELLFISH_FREE" | "SESAME_FREE" | "PEANUT_FREE" | "LOW_FODMAP"
    // MACRO
    | "LOW_CARB" | "HIGH_PROTEIN" | "LOW_FAT" | "LOW_SUGAR" | "NO_ADDED_SUGAR" | "KETO" | "PALEO" | "HIGH_FIBER" | "LOW_SODIUM"
    // OTHER (inkl. religiös/ethisch)
    | "HALAL" | "KOSHER"
    | "NO_BAKE" | "AIR_FRYER" | "INSTANT_POT" | "ONE_POT" | "MEAL_PREP" | "SPICY" | "ALCOHOL_FREE";

export interface IngredientRead {
    id: number;
    name: string;
    amount: number;    // Backend BigDecimal → Frontend number
    unit: string;
}

export interface StepRead {
    id: number;
    position: number;
    text: string;
}

export interface Recipe {
    id: number;
    title: string;
    description: string;
    prepMinutes: number;
    cookMinutes: number;
    totalMinutes: number;
    dietTags: DietTag[];
    baselineTag: DietTag | null;
    categories: string[];
    ingredients: IngredientRead[];
    steps: StepRead[];
}

export interface IngredientCreate {
    name: string;
    amount: number;
    unit: string;
}

export interface StepCreate {
    position: number;
    text: string;
}

export interface RecipeCreatePayload {
    title: string;
    description: string;
    prepMinutes: number;
    cookMinutes: number;
    dietTags: DietTag[];
    categories: string[];
    ingredients: IngredientCreate[];
    steps: StepCreate[];
}

export interface RecipeUpdateBasePayload {
    title: string;
    description: string;
    prepMinutes: number;
    cookMinutes: number;
    dietTags: DietTag[];
    categories: string[];
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // 0-based
    size: number;
    first: boolean;
    last: boolean;
    // (weitere Felder von Spring werden ignoriert)
}

// ----------------------
// HTTP Helper
// ----------------------
async function http<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        ...init,
    });
    if (!res.ok) {
        let msg = `${res.status} ${res.statusText}`;
        try {
            const body = await res.json();
            if (body?.message) msg = body.message;
        } catch {
            // ignore
        }
        throw new Error(msg);
    }
    if (res.status === 204) {
        // @ts-expect-error: void OK
        return undefined;
    }
    return (await res.json()) as T;
}

// ----------------------
// API-Funktionen
// ----------------------
export function listRecipes(params?: { q?: string; page?: number; size?: number; sort?: string }) {
    const u = new URL(`${BASE}/recipes`);
    if (params?.q) u.searchParams.set("q", params.q);
    if (params?.page != null) u.searchParams.set("page", String(params.page));
    if (params?.size != null) u.searchParams.set("size", String(params.size));
    if (params?.sort) u.searchParams.set("sort", params.sort); // z. B. "title,asc"
    return http<Page<Recipe>>(u.toString());
}

export function getRecipe(id: number) {
    return http<Recipe>(`${BASE}/recipes/${id}`);
}

export function createRecipe(payload: RecipeCreatePayload) {
    return http<{ id: number }>(`${BASE}/recipes`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Basisfelder aktualisieren (PUT /recipes/{id})
 * Ersetzt KEINE Ingredients/Steps.
 */
export function updateRecipeBase(id: number, payload: RecipeUpdateBasePayload) {
    return http<void>(`${BASE}/recipes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

/**
 * Komplettliste der Zutaten ersetzen (PUT /recipes/{id}/ingredients)
 */
export function replaceIngredients(id: number, list: IngredientCreate[]) {
    return http<void>(`${BASE}/recipes/${id}/ingredients`, {
        method: "PUT",
        body: JSON.stringify(list),
    });
}

/**
 * Komplettliste der Schritte ersetzen (PUT /recipes/{id}/steps)
 */
export function replaceSteps(id: number, list: StepCreate[]) {
    // Sortierung sicherheitshalber nach position
    const sorted = [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return http<void>(`${BASE}/recipes/${id}/steps`, {
        method: "PUT",
        body: JSON.stringify(sorted),
    });
}

export function deleteRecipe(id: number) {
    return http<void>(`${BASE}/recipes/${id}`, { method: "DELETE" });
}

/**
 * Abwärtskompatibler Wrapper (falls noch irgendwo benutzt):
 * Führt Base-Update + Ingredients + Steps nacheinander aus.
 * Achtung: Erwartet ein "Voll-Update"-Payload (wie beim Create).
 */
export async function updateRecipe(id: number, payload: RecipeCreatePayload) {
    const base: RecipeUpdateBasePayload = {
        title: payload.title,
        description: payload.description,
        prepMinutes: payload.prepMinutes,
        cookMinutes: payload.cookMinutes,
        dietTags: payload.dietTags,
        categories: payload.categories,
    };
    await updateRecipeBase(id, base);
    await replaceIngredients(id, payload.ingredients ?? []);
    await replaceSteps(id, payload.steps ?? []);
}

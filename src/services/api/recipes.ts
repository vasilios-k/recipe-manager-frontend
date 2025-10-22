import { http } from "@/services/api/client";

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
    // OTHER
    | "HALAL" | "KOSHER"
    | "NO_BAKE" | "AIR_FRYER" | "INSTANT_POT" | "ONE_POT" | "MEAL_PREP" | "SPICY" | "ALCOHOL_FREE";

export interface IngredientRead {
    id: number;
    name: string;
    amount: number;   // Backend BigDecimal -> hier number
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
}

// ----------------------
// API-Funktionen
// ----------------------
export function listRecipes(params?: { q?: string; page?: number; size?: number; sort?: string }) {
    return http.get<Page<Recipe>>("/recipes", {
        q: params?.q,
        page: params?.page,
        size: params?.size,
        sort: params?.sort,
    });
}

export function getRecipe(id: number) {
    return http.get<Recipe>(`/recipes/${id}`);
}

export function createRecipe(payload: RecipeCreatePayload) {
    return http.post<{ id: number }>("/recipes", payload);
}

/** Basisfelder aktualisieren (PUT /recipes/{id}) – Ingredients/Steps separat */
export function updateRecipeBase(id: number, payload: RecipeUpdateBasePayload) {
    return http.put<void>(`/recipes/${id}`, payload);
}

/** Zutatenliste komplett ersetzen */
export function replaceIngredients(id: number, list: IngredientCreate[]) {
    return http.put<void>(`/recipes/${id}/ingredients`, list);
}

/** Schritteliste komplett ersetzen */
export function replaceSteps(id: number, list: StepCreate[]) {
    const sorted = [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return http.put<void>(`/recipes/${id}/steps`, sorted);
}

export function deleteRecipe(id: number) {
    return http.del<void>(`/recipes/${id}`);
}

/** Komfort: „Full Update“ in drei Calls */
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

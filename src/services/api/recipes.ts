// src/services/api/recipes.ts
import { api } from "./client";

/** --- Lesetypen (kommen vom Backend) --- */
export type Ingredient = { id: number; name: string; amount: number; unit: string };
export type Step = { id: number; position: number; text: string };
export type Recipe = {
    id: number;
    title: string;
    description: string;
    prepMinutes: number;
    cookMinutes: number;
    totalMinutes: number;
    dietTags: string[];
    baselineTag: string | null;
    categories: string[];
    ingredients: Ingredient[];
    steps: Step[];
};

/** --- Create/Update Payloads (gehen ans Backend) --- */
export type IngredientCreate = { name: string; amount: number; unit: string };
export type StepCreate = { position: number; text: string };

export type RecipeCreatePayload = {
    title: string;
    description?: string;
    prepMinutes: number;
    cookMinutes: number;
    dietTags: string[];     // z.B. ["VEGAN","GLUTEN_FREE"]
    categories: string[];   // z.B. ["vegan","bowl"]
    ingredients: IngredientCreate[];
    steps: StepCreate[];
};

export type CreatedIdResponse = { id: number };

/** --- API-Funktionen --- */
export const listRecipes = () => api("/recipes") as Promise<Recipe[]>;
export const getRecipe = (id: number) => api(`/recipes/${id}`) as Promise<Recipe>;
export const createRecipe = (payload: RecipeCreatePayload) =>
    api("/recipes", {
        method: "POST",
        body: JSON.stringify(payload),
    }) as Promise<CreatedIdResponse>;

/** --- kleine Helfer für Forms --- */
export function emptyRecipeCreate(): RecipeCreatePayload {
    return {
        title: "",
        description: "",
        prepMinutes: 0,
        cookMinutes: 0,
        dietTags: [],
        categories: [],
        ingredients: [],
        steps: [],
    };
}

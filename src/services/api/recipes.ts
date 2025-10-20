import { api } from "./client";

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

export const listRecipes = () => api("/recipes") as Promise<Recipe[]>;
export const getRecipe = (id: number) => api(`/recipes/${id}`) as Promise<Recipe>;

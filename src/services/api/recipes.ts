import { http } from "./client";
import type { RecipeReadDto } from "@/types/recipe";

export function getRecipes(): Promise<RecipeReadDto[]> {
    return http<RecipeReadDto[]>("/recipes");
}

export function getRecipe(id: number): Promise<RecipeReadDto> {
    return http<RecipeReadDto>(`/recipes/${id}`);
}

// Für später (Create/Update/Delete):
export function createRecipe(body: unknown): Promise<{ id: number }> {
    return http<{ id: number }>("/recipes", { method: "POST", body: JSON.stringify(body) });
}
export function updateRecipe(id: number, body: unknown): Promise<void> {
    return http<void>(`/recipes/${id}`, { method: "PUT", body: JSON.stringify(body) });
}
export function deleteRecipe(id: number): Promise<void> {
    return http<void>(`/recipes/${id}`, { method: "DELETE" });
}

export type DietTag =
    | "VEGAN" | "VEGETARIAN" | "PESCETARIAN" | "OMNIVORE"
    | "HALAL" | "KOSHER"
    | "LOW_CARB" | "HIGH_PROTEIN" | "LOW_FAT"
    | "DAIRY_FREE" | "GLUTEN_FREE" | "NUT_FREE" | "LOW_SUGAR";

export interface IngredientReadDto {
    id: number;
    name: string;
    amount: number;   // Backend sendet Zahl
    unit: string;
}

export interface StepReadDto {
    id: number;
    position: number;
    text: string;
}

export interface RecipeReadDto {
    id: number;
    title: string;
    description: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    totalMinutes: number;
    dietTags: DietTag[];
    baselineTag: DietTag | null;
    categories: string[];
    ingredients: IngredientReadDto[];
    steps: StepReadDto[];
}

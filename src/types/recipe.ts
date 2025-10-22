// Re-exportiert Typen aus der API-Schicht unter „DTO“-Namen,
// damit die Views/Komponenten eine stabile Import-Stelle haben.
export type {
    DietTag,
    IngredientRead as IngredientReadDto,
    StepRead as StepReadDto,
    Recipe as RecipeReadDto,
} from "@/services/api/recipes";

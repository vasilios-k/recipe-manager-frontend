export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
}
export interface Recipe {
    id: number;
    title: string;
    prepMinutes: number;
    ingredients: Ingredient[];
}
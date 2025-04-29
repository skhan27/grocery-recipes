import { Amount } from "./amount";

export interface ShoppingListIngredient {
    name: string;
    amount: Amount;
    checked: boolean;
}

export interface ShoppingList {
    recipes: string[];
    ingredients: ShoppingListIngredient[];
}
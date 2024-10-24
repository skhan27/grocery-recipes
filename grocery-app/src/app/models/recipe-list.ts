import { Amount } from "./amount";
import { Recipe } from "./recipe";

export class RecipeList {
    public recipes: Recipe[];
    constructor(recipes: Recipe[]) {
        this.recipes = recipes;
    }

    public getAmountsForEachItem(): Map<string, Amount> {
        const amountMap: Map<string, Amount> = new Map();
        this.recipes.forEach(recipe => {
            recipe.items.forEach(item => {
                if (amountMap.has(item.name)) {

                }
                else {
                    amountMap.set(item.name, item.amount);
                }
            })
        })
        return amountMap;
    }
}
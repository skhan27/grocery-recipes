import { Amount } from './amount';
import { Recipe } from './recipe';

export interface RecipeList {
  recipes: Recipe[];
  description: string;
  name: string;
}

export class RecipeListClass {
  public recipes: Recipe[];
  public description: string;
  public name: string;
  constructor(obj: Partial<RecipeList>) {
    Object.assign(this, obj);
  }

  public getAmountsForEachItem(): Map<string, Amount> {
    const amountMap = new Map<string, Amount>();
    this.recipes.forEach((recipe) => {
      recipe.items.forEach((item) => {
        if (amountMap.has(item.name)) {
        } else {
          amountMap.set(item.name, item.amount);
        }
      });
    });
    return amountMap;
  }

  public importRecipeList(list: RecipeList): void {
    list.recipes.forEach((recipe) => {
      this.recipes.push(recipe);
    });
  }
}

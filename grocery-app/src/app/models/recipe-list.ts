import { Amount } from './amount';
import { Recipe } from './recipe';

export class RecipeList {
  public recipes: Recipe[];
  public description: string;
  public name: string;
  constructor(obj: Partial<RecipeList>) {
    Object.assign(this, obj);
  }

  public getAmountsForEachItem(): Map<string, Amount> {
    const amountMap: Map<string, Amount> = new Map();
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

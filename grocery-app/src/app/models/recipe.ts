import { RecipeItem } from './recipe-item';

export class Recipe {
  public items: RecipeItem[] = [];
  public name: string;
  public notes: string;
  public instructions: string[];
  constructor(obj: Partial<Recipe>) {
    Object.assign(this, obj);
  }
}

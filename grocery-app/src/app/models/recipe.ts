import { RecipeItem } from './recipe-item';

export class Recipe {
  public id: string;
  public items: RecipeItem[] = [];
  public name: string;
  public notes: string;
  public instructions: string[];
  constructor(obj: Partial<Recipe>) {
    Object.assign(this, obj);
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

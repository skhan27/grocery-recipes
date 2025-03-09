import { RecipeItem } from './recipe-item';

export interface Recipe {
  id: string;
  items: RecipeItem[];
  name: string;
  notes: string;
  instructions: string[];
  servings: number;
  rating: number;
  tags: string[];
  prepTime: number;
  cookTime: number;
}

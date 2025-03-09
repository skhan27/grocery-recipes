import { Amount } from './amount';
import { RecipeItem } from './recipe-item';

export interface Recipe {
  id: string;
  items: RecipeItem[];
  name: string;
  notes: string;
  instructions: string[];
}

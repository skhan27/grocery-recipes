import { RecipeItem } from "./recipe-item";

export class Recipe {
    public items: RecipeItem[] = [];
    public name: string;
    public notes: string;
    public instructions: string[];
    constructor(name: string, items: RecipeItem[], instructions: string[], notes: string) {
        this.items = items;
        this.name = name;
        this.instructions = instructions;
        this.notes = notes;
    }
}

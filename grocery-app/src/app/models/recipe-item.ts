import { Amount } from "./amount";

export class RecipeItem {
    public name: string;
    public amount: Amount;
    constructor(name: string, amount: Amount) {
        this.name = name;
        this.amount = amount;
    }
}

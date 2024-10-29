import { Component, OnInit, signal, Signal } from '@angular/core';
import { RecipeList } from '../../models/recipe-list';
import { createSignal } from '@angular/core/primitives/signals';
import { Recipe } from '../../models/recipe';
import { RecipeItem } from '../../models/recipe-item';
import { Amount } from '../../models/amount';
import { Unit } from '../../models/unit';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent implements OnInit {
  public recipe$: Signal<RecipeList>;

  ngOnInit(): void {
    const recipe = new Recipe({
      name: 'Boiled Egg',
      items: [new RecipeItem('Egg', new Amount(1, Unit.ITEM))],
      instructions: [
        'add egg to water and turn on heat',
        'bring water to a boil',
        'once its boiling turn it to simmer for 4-7min depending on how runny you like your eggs',
      ],
    });
    const list = new RecipeList({
      recipes: [recipe],
      description: 'The basic items everyone starts learning',
      name: 'Beginners Items',
    });
    this.recipe$ = signal(list);
  }
}

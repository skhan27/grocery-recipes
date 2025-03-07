import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { RecipeList } from '../../models/recipe-list';
import { createSignal } from '@angular/core/primitives/signals';
import { Recipe } from '../../models/recipe';
import { RecipeItem } from '../../models/recipe-item';
import { Amount } from '../../models/amount';
import { Unit } from '../../models/unit';
import { RecipeService } from '../../services/recipe.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent implements OnInit {
  public recipe$ = toSignal(inject(RecipeService).getRecipes(), {
    initialValue: [],
  });
  ngOnInit(): void {}
}

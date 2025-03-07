import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Unit } from '../../models/unit';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';
import { RecipeItem } from '../../models/recipe-item';
import { Amount } from '../../models/amount';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor],
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRecipeComponent {
  recipeForm: FormGroup;
  recipeService = inject(RecipeService);
  router = inject(Router);
  units = Object.values(Unit);
  constructor(private fb: FormBuilder) {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
      instructions: ['', Validators.required],
      notes: [''],
    });
  }

  get items(): FormArray {
    return this.recipeForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required],
      unit: ['', Validators.required],
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.recipeForm.valid) {
      const val = this.recipeForm.value;
      const recipe = new Recipe({
        name: val.name,
        items: val.items.map(
          (item: { name: string; amount: number; unit: Unit }) => {
            return new RecipeItem(
              item.name,
              new Amount(item.amount, item.unit)
            );
          }
        ),
        instructions: val.instructions,
        notes: val.notes,
      });
      this.recipeService.createRecipe(recipe).subscribe(() => {
        this.router.navigate(['/list']);
      });
    }
  }
}

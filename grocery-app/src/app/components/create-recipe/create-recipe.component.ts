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
import { Router } from '@angular/router';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';

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
  recipeFirebaseService = inject(RecipeFirebaseService);
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
      const recipe: Recipe = {
        id: Math.random().toString(36).substr(2, 9),
        name: val.name,
        items: val.items.map(
          (item: { name: string; amount: number; unit: Unit }) => {
            return {
              name: item.name,
              amount: { amount: item.amount, unit: item.unit },
            } as RecipeItem;
          }
        ),
        instructions: val.instructions,
        notes: val.notes,
      };
      this.recipeFirebaseService.addRecipe(recipe).subscribe(() => {
        this.router.navigate(['/list']);
      });
    }
  }
}

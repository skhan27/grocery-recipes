import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Unit } from '../../models/unit';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor],
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRecipeComponent {
  recipeForm: FormGroup;
  units = Object.values(Unit);
  constructor(private fb: FormBuilder) {
    this.recipeForm = this.fb.group({
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
      const recipe = this.recipeForm.value;
      console.log('Recipe created:', recipe);
      // Here you can handle the recipe creation logic
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Unit } from '../../models/unit';
import { Recipe } from '../../models/recipe';
import { RecipeItem } from '../../models/recipe-item';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  imports: [FormsModule, ReactiveFormsModule, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RecipeFormComponent implements OnInit {
  @Input() recipe: Recipe | null = null;
  @Input() submitButtonText: string = 'Submit';
  @Output() formSubmit = new EventEmitter<Recipe>();
  recipeForm: FormGroup;
  units = Object.values(Unit);

  constructor(private fb: FormBuilder) {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
      instructions: ['', Validators.required],
      notes: [''],
      servings: [1, Validators.required],
      rating: [0],
      tags: [''],
      prepTime: [0],
      cookTime: [0],
    });
  }

  ngOnInit(): void {
    if (this.recipe) {
      this.recipeForm.patchValue({
        ...this.recipe,
        tags: this.recipe.tags?.join(', ') || '',
        instructions: this.recipe.instructions?.join('\n') || '',
      });
      this.recipeForm.setControl(
        'items',
        this.fb.array(this.recipe.items.map((item) => this.createItem(item)))
      );
    }
  }

  get items(): FormArray {
    return this.recipeForm.get('items') as FormArray;
  }

  createItem(item: RecipeItem | null = null): FormGroup {
    return this.fb.group({
      name: [item?.name || '', Validators.required],
      amount: [item?.amount.amount || '', Validators.required],
      unit: [item?.amount.unit || '', Validators.required],
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
        id: this.recipe?.id || '',
        name: val.name,
        items: val.items.map(
          (item: { name: string; amount: number; unit: Unit }) => {
            return {
              name: item.name,
              amount: { amount: item.amount, unit: item.unit },
            } as RecipeItem;
          }
        ),
        instructions: val.instructions.split('\n'),
        notes: val.notes,
        rating: val.rating,
        servings: val.servings,
        tags: val.tags.split(',').map((tag: string) => tag.trim()),
        prepTime: val.prepTime,
        cookTime: val.cookTime,
      };
      this.formSubmit.emit(recipe);
    }
  }
}

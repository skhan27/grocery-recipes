import { Component } from '@angular/core';
import { MatDialogContainer, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OpenAiService } from '../../services/openai-api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-recipe-import-dialog',
  template: `
    <h2 mat-dialog-title>Import Recipe</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Paste your recipe text</mat-label>
          <textarea matInput formControlName="recipeText" rows="10"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="loading">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!form.valid || loading" (click)="onSubmit()">
        <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
        <span *ngIf="!loading">Import</span>
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgIf
  ]
})
export class RecipeImportDialogComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<RecipeImportDialogComponent>,
    private fb: FormBuilder,
    private openAiService: OpenAiService
  ) {
    this.form = this.fb.group({
      recipeText: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.openAiService.extractRecipe(this.form.value.recipeText).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error importing recipe:', error);
          // TODO: Add proper error handling
          this.loading = false;
        }
      });
    }
  }
}

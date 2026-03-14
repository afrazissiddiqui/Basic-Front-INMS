import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, CreateCategoryPayload } from '../../core/services/category.service';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isViewOnly ? 'visibility' : (data?.category ? 'edit' : 'category') }}</mat-icon> 
      {{ isViewOnly ? 'View' : (data?.category ? 'Edit' : 'Add New') }} Category
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="categoryForm" class="category-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category Name</mat-label>
          <input matInput formControlName="Name" placeholder="Ex: Electronics, Cosmetics">
          <mat-error *ngIf="categoryForm.get('Name')?.hasError('required')">
            Category name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Base64 Image String (Optional)</mat-label>
          <textarea matInput formControlName="Base64" placeholder="Enter image string" rows="3"></textarea>
        </mat-form-field>

        <div class="checkbox-row">
          <mat-checkbox formControlName="IsActive" color="primary">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">{{ isViewOnly ? 'Close' : 'Cancel' }}</button>
      <button *ngIf="!isViewOnly" mat-flat-button color="primary" [disabled]="categoryForm.invalid || isSubmitting" (click)="onSubmit()">
        <mat-icon *ngIf="!isSubmitting">save</mat-icon>
        <span *ngIf="!isSubmitting">{{ data?.category ? 'Update' : 'Save' }} Category</span>
        <span *ngIf="isSubmitting">{{ data?.category ? 'Updating...' : 'Saving...' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      color: var(--primary-deep);
      margin-bottom: 20px;
      mat-icon { color: var(--accent-electric); }
    }
    .category-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding-top: 10px;
    }
    .full-width { width: 100%; }
    .checkbox-row {
      display: flex;
      gap: 16px;
    }
    .dialog-actions {
      padding: 20px 24px;
      button { border-radius: 10px; font-weight: 600; padding: 0 20px; }
    }
  `]
})
export class CategoryDialogComponent {
  categoryForm: FormGroup;
  isSubmitting = false;
  isViewOnly = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isViewOnly = data?.mode === 'view';
    
    this.categoryForm = this.fb.group({
      Name: [{ value: data?.category?.Name || '', disabled: this.isViewOnly }, [Validators.required]],
      Base64: [{ value: data?.category?.Base64 || 'string', disabled: this.isViewOnly }],
      IsActive: [{ value: data?.category?.IsActive ?? true, disabled: this.isViewOnly }],
      IsDeleted: [data?.category?.IsDeleted ?? false],
      CreatedBy: [data?.category?.CreatedBy ?? 1],
      UpdatedBy: [data?.category?.UpdatedBy ?? 1]
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.categoryForm.getRawValue();
      const now = new Date().toISOString();
      
      if (this.data?.category) {
        // Update existing category
        const payload = {
          ...this.data.category,
          ...formValue,
          UpdatedAt: now
        };

        this.categoryService.updateCategory(this.data.category.Id, payload).subscribe({
          next: () => {
            this.snackBar.open('Category updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to update category:', err);
            this.snackBar.open('Error updating category. Please check backend API.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        // Create new category
        const payload: CreateCategoryPayload = {
          ...formValue,
          CreatedAt: now,
          UpdatedAt: now
        };

        this.categoryService.addCategory(payload).subscribe({
          next: () => {
            this.snackBar.open('Category added successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to add category:', err);
            this.snackBar.open('Error adding category. Please check backend API.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

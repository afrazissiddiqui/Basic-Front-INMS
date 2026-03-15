import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, Category } from '../../core/services/category.service';
import { ItemService } from '../../core/services/item.service';
import { UomService, UnitOfMeasure } from '../../core/services/uom.service';

@Component({
  selector: 'app-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isViewOnly ? 'visibility' : (isEditMode ? 'edit' : 'add_circle') }}</mat-icon> 
      {{ isViewOnly ? 'View' : (isEditMode ? 'Edit' : 'Add') }} Item
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="itemForm" class="item-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Item Name</mat-label>
          <input matInput formControlName="ItemName" placeholder="Enter item name" [readonly]="isViewOnly">
          <mat-error *ngIf="itemForm.get('ItemName')?.hasError('required')">
            Item name is required
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="CategoryId">
              <mat-option *ngFor="let cat of categories" [value]="cat.Id">
                {{ cat.Name }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="itemForm.get('CategoryId')?.hasError('required')">
              Category is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Unit of Measure</mat-label>
            <mat-select formControlName="UnitAbbreviation">
              <mat-option *ngFor="let uom of uoms" [value]="uom.Abbreviation">
                {{ uom.Name }} ({{ uom.Abbreviation }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="itemForm.get('UnitAbbreviation')?.hasError('required')">
              Unit is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Stock Quantity</mat-label>
            <input matInput type="number" formControlName="StockQuantity" placeholder="0" [readonly]="isViewOnly">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Buy Price</mat-label>
            <input matInput type="number" formControlName="BuyPrice" placeholder="0.00" [readonly]="isViewOnly">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sale Price</mat-label>
            <input matInput type="number" formControlName="SalePrice" placeholder="0.00" [readonly]="isViewOnly">
          </mat-form-field>
        </div>

        <div class="form-row">
          <div class="checkbox-container">
            <mat-checkbox formControlName="AllowNegativeInventory" color="primary">
              Allow Negative Inventory
            </mat-checkbox>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">{{ isViewOnly ? 'Close' : 'Cancel' }}</button>
      <button mat-flat-button color="primary" [disabled]="itemForm.invalid || isSubmitting" (click)="onSubmit()" *ngIf="!isViewOnly">
        <mat-icon *ngIf="!isSubmitting">{{ isEditMode ? 'update' : 'save' }}</mat-icon>
        <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update Item' : 'Save Item' }}</span>
        <span *ngIf="isSubmitting">{{ isEditMode ? 'Updating...' : 'Saving...' }}</span>
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
    .dialog-content {
      padding-top: 10px;
    }
    .item-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 450px;
    }
    .full-width { width: 100%; }
    .form-row {
      display: flex;
      gap: 16px;
      mat-form-field { flex: 1; }
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .dialog-actions {
      padding: 20px 24px;
      button { border-radius: 10px; font-weight: 600; padding: 0 20px; }
    }
  `]
})
export class ItemDialogComponent implements OnInit {
  itemForm: FormGroup;
  categories: Category[] = [];
  uoms: UnitOfMeasure[] = [];
  isSubmitting = false;
  isEditMode = false;
  isViewOnly = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ItemDialogComponent>,
    private categoryService: CategoryService,
    private itemService: ItemService,
    private uomService: UomService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { item?: any, mode?: 'add' | 'edit' | 'view' }
  ) {
    this.isEditMode = this.data?.mode === 'edit';
    this.isViewOnly = this.data?.mode === 'view';

    this.itemForm = this.fb.group({
      ItemName: [{ value: this.data?.item?.ItemName || '', disabled: this.isViewOnly }, [Validators.required]],
      CategoryId: [{ value: this.data?.item?.CategoryId || '', disabled: this.isViewOnly }, [Validators.required]],
      UnitAbbreviation: [{ value: this.data?.item?.UnitAbbreviation || '', disabled: this.isViewOnly }, [Validators.required]],
      StockQuantity: [{ value: this.data?.item?.StockQuantity || 0, disabled: this.isViewOnly }, [Validators.required, Validators.min(0)]],
      BuyPrice: [{ value: this.data?.item?.BuyPrice || 0, disabled: this.isViewOnly }, [Validators.required, Validators.min(0)]],
      SalePrice: [{ value: this.data?.item?.SalePrice || 0, disabled: this.isViewOnly }, [Validators.required, Validators.min(0)]],
      AllowNegativeInventory: [{ value: this.data?.item?.AllowNegativeInventory ?? true, disabled: this.isViewOnly }]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadUoms();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        // Correctly handle the potential PascalCase response: { Data: [...], TotalCount: ... }
        if (response && response.Data && Array.isArray(response.Data)) {
          this.categories = response.Data;
        } else if (Array.isArray(response)) {
          this.categories = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.categories = response.data;
        } else {
          console.warn('Unexpected category API response format:', response);
          this.categories = [];
        }
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.snackBar.open('Error loading categories. Please check backend connection.', 'Close', { 
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadUoms() {
    this.uomService.getUoms().subscribe({
      next: (response) => {
        if (response && response.Data && Array.isArray(response.Data)) {
          this.uoms = response.Data;
        } else if (Array.isArray(response)) {
          this.uoms = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.uoms = response.data;
        } else {
          console.warn('Unexpected UOM API response format:', response);
          this.uoms = [];
        }
      },
      error: (err) => {
        console.error('Failed to load UOMs:', err);
        this.snackBar.open('Error loading units of measure.', 'Close', { 
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.itemForm.valid && !this.isViewOnly) {
      this.isSubmitting = true;
      const formValue = this.itemForm.getRawValue();
      const payload = {
        ItemName: formValue.ItemName,
        CategoryId: Number(formValue.CategoryId),
        UnitAbbreviation: formValue.UnitAbbreviation,
        StockQuantity: Number(formValue.StockQuantity),
        BuyPrice: Number(formValue.BuyPrice),
        SalePrice: Number(formValue.SalePrice),
        AllowNegativeInventory: formValue.AllowNegativeInventory
      };

      if (this.isEditMode && this.data.item) {
        this.itemService.updateItem(this.data.item.Id, payload).subscribe({
          next: () => {
            this.snackBar.open('Item updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to update item:', err);
            const errorMsg = err.error?.message || 'Error updating item.';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      } else {
        this.itemService.addItem(payload).subscribe({
          next: () => {
            this.snackBar.open('Item added successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to add item:', err);
            const errorMsg = err.error?.message || 'Error adding item.';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UomService, UnitOfMeasure } from '../../core/services/uom.service';

@Component({
  selector: 'app-uom-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isViewOnly ? 'visibility' : (isEditMode ? 'edit' : 'straighten') }}</mat-icon> 
      {{ isViewOnly ? 'View' : (isEditMode ? 'Edit' : 'Add') }} Unit of Measure
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="uomForm" class="uom-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>UOM Name</mat-label>
          <input matInput formControlName="Name" placeholder="Ex: Box, Kilogram, Piece" [readonly]="isViewOnly">
          <mat-error *ngIf="uomForm.get('Name')?.hasError('required')">
            UOM name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Abbreviation</mat-label>
          <input matInput formControlName="Abbreviation" placeholder="Ex: Bx, Kg, Pcs" [readonly]="isViewOnly">
          <mat-error *ngIf="uomForm.get('Abbreviation')?.hasError('required')">
            Abbreviation is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">{{ isViewOnly ? 'Close' : 'Cancel' }}</button>
      <button mat-flat-button color="primary" [disabled]="uomForm.invalid || isSubmitting" (click)="onSubmit()" *ngIf="!isViewOnly">
        <mat-icon *ngIf="!isSubmitting">{{ isEditMode ? 'update' : 'save' }}</mat-icon>
        <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update UOM' : 'Save UOM' }}</span>
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
    .uom-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
    .full-width { width: 100%; }
    .dialog-actions {
      padding: 20px 24px;
      button { border-radius: 10px; font-weight: 600; padding: 0 20px; }
    }
  `]
})
export class UomDialogComponent implements OnInit {
  uomForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  isViewOnly = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UomDialogComponent>,
    private uomService: UomService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { uom?: UnitOfMeasure, mode?: 'add' | 'edit' | 'view' }
  ) {
    this.isEditMode = this.data?.mode === 'edit';
    this.isViewOnly = this.data?.mode === 'view';

    this.uomForm = this.fb.group({
      Name: [{ value: this.data?.uom?.Name || '', disabled: this.isViewOnly }, [Validators.required]],
      Abbreviation: [{ value: this.data?.uom?.Abbreviation || '', disabled: this.isViewOnly }, [Validators.required]]
    });
  }

  ngOnInit() {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.uomForm.valid && !this.isViewOnly) {
      this.isSubmitting = true;
      const payload = this.uomForm.getRawValue();

      if (this.isEditMode && this.data.uom) {
        this.uomService.updateUom(this.data.uom.Id, payload).subscribe({
          next: () => {
            this.snackBar.open('Unit of Measure updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to update UOM:', err);
            const errorMsg = err.error?.message || 'Error updating UOM.';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      } else {
        this.uomService.addUom(payload).subscribe({
          next: () => {
            this.snackBar.open('Unit of Measure added successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to add UOM:', err);
            const errorMsg = err.error?.message || 'Error adding UOM.';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

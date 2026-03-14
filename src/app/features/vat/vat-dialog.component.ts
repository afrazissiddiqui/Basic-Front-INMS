import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { VatService, VAT, CreateVATPayload } from '../../core/services/vat.service';

@Component({
  selector: 'app-vat-dialog',
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
      <mat-icon>{{ isViewOnly ? 'visibility' : (data.vat ? 'edit' : 'percent') }}</mat-icon> 
      {{ isViewOnly ? 'View' : (data.vat ? 'Edit' : 'Add New') }} VAT Configuration
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="vatForm" class="vat-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>VAT Code</mat-label>
          <input matInput formControlName="Code" placeholder="Ex: STANDARD, ZERO, EXEMPT">
          <mat-error *ngIf="vatForm.get('Code')?.hasError('required')">
            VAT Code is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="Description" placeholder="Ex: Standard Tax Rate">
          <mat-error *ngIf="vatForm.get('Description')?.hasError('required')">
            Description is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tax Rate (%)</mat-label>
          <input matInput type="number" formControlName="Rate" placeholder="Ex: 10">
          <mat-error *ngIf="vatForm.get('Rate')?.hasError('required')">
            Tax Rate is required
          </mat-error>
          <mat-error *ngIf="vatForm.get('Rate')?.hasError('min')">
            Rate cannot be negative
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">{{ isViewOnly ? 'Close' : 'Cancel' }}</button>
      <button *ngIf="!isViewOnly" mat-flat-button color="primary" [disabled]="vatForm.invalid || isSubmitting" (click)="onSubmit()">
        <mat-icon *ngIf="!isSubmitting">save</mat-icon>
        <span *ngIf="!isSubmitting">{{ data.vat ? 'Update' : 'Save' }} VAT</span>
        <span *ngIf="isSubmitting">{{ data.vat ? 'Updating...' : 'Saving...' }}</span>
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
    .vat-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding-top: 10px;
    }
    .full-width { width: 100%; }
    .dialog-actions {
      padding: 20px 24px;
      button { border-radius: 10px; font-weight: 600; padding: 0 20px; }
    }
  `]
})
export class VatDialogComponent implements OnInit {
  vatForm: FormGroup;
  isSubmitting = false;
  isViewOnly = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VatDialogComponent>,
    private vatService: VatService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { vat?: VAT, mode?: 'add' | 'edit' | 'view' }
  ) {
    this.isViewOnly = this.data?.mode === 'view';
    
    this.vatForm = this.fb.group({
      Code: [{ value: this.data?.vat?.Code || '', disabled: this.isViewOnly }, [Validators.required]],
      Description: [{ value: this.data?.vat?.Description || '', disabled: this.isViewOnly }, [Validators.required]],
      Rate: [{ value: this.data?.vat?.Rate || 0, disabled: this.isViewOnly }, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.vatForm.valid) {
      this.isSubmitting = true;
      const formValue = this.vatForm.getRawValue();

      if (this.data?.vat) {
        // Update
        this.vatService.updateVAT(this.data.vat.Id, { ...this.data.vat, ...formValue }).subscribe({
          next: () => {
            this.snackBar.open('VAT updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to update VAT:', err);
            this.snackBar.open('Error updating VAT.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        // Create
        const payload: CreateVATPayload = formValue;
        this.vatService.addVAT(payload).subscribe({
          next: () => {
            this.snackBar.open('VAT added successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to add VAT:', err);
            this.snackBar.open('Error adding VAT.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

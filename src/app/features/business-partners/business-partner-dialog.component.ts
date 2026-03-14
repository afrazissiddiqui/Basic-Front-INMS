import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BusinessPartnerService, BusinessPartner, CreateBusinessPartnerPayload } from '../../core/services/business-partner.service';

@Component({
  selector: 'app-business-partner-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-content">
          <div class="icon-box">
            <mat-icon>{{ isViewOnly ? 'visibility' : (data.partner ? 'edit' : 'handshake') }}</mat-icon>
          </div>
          <div class="title-text">
            <h2 mat-dialog-title>{{ isViewOnly ? 'View' : (data.partner ? 'Edit' : 'Add New') }} Business Partner</h2>
            <p class="subtitle">{{ isViewOnly ? 'Details of the selected partner' : 'Enter professional details for your business associate' }}</p>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="premium-content">
        <form [formGroup]="bpForm" class="bp-form">
          <div class="form-section">
            <div class="section-title">
              <mat-icon>person</mat-icon>
              <span>Personal Information</span>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="FirstName" placeholder="Ex: John">
                <mat-icon matSuffix>badge</mat-icon>
                <mat-error *ngIf="bpForm.get('FirstName')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="LastName" placeholder="Ex: Doe">
                <mat-icon matSuffix>badge</mat-icon>
                <mat-error *ngIf="bpForm.get('LastName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">
              <mat-icon>business</mat-icon>
              <span>Business Details</span>
            </div>
            <div class="form-grid full">
              <mat-form-field appearance="outline">
                <mat-label>Business Name</mat-label>
                <input matInput formControlName="BusinessName" placeholder="Ex: Acme Corp">
                <mat-icon matSuffix>corporate_fare</mat-icon>
                <mat-error *ngIf="bpForm.get('BusinessName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-grid full">
              <mat-form-field appearance="outline">
                <mat-label>Business Address</mat-label>
                <textarea matInput formControlName="BusinessAddress" placeholder="Ex: 123 Main St, NY" rows="2"></textarea>
                <mat-icon matSuffix>location_on</mat-icon>
                <mat-error *ngIf="bpForm.get('BusinessAddress')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Partner Type</mat-label>
                <mat-select formControlName="Type">
                  <mat-option value="Vendor">
                    <div class="option-content">
                      <mat-icon>local_shipping</mat-icon>
                      <span>Vendor</span>
                    </div>
                  </mat-option>
                  <mat-option value="Customer">
                    <div class="option-content">
                      <mat-icon>shopping_bag</mat-icon>
                      <span>Customer</span>
                    </div>
                  </mat-option>
                  <mat-option value="Both">
                    <div class="option-content">
                      <mat-icon>swap_horiz</mat-icon>
                      <span>Both</span>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="bpForm.get('Type')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="Email" placeholder="user@example.com">
                <mat-icon matSuffix>alternate_email</mat-icon>
                <mat-error *ngIf="bpForm.get('Email')?.hasError('email')">Invalid email</mat-error>
                <mat-error *ngIf="bpForm.get('Email')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">
              <mat-icon>description</mat-icon>
              <span>Legal & Tax Info</span>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="PhoneNumber" placeholder="Ex: 03001234567">
                <mat-icon matSuffix>call</mat-icon>
                <mat-error *ngIf="bpForm.get('PhoneNumber')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CNIC</mat-label>
                <input matInput formControlName="CNIC" placeholder="Ex: 12345-1234567-1">
                <mat-icon matSuffix>assignment_ind</mat-icon>
                <mat-error *ngIf="bpForm.get('CNIC')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>

            <div class="tax-row">
              <mat-form-field appearance="outline" class="ntn-field">
                <mat-label>NTN</mat-label>
                <input matInput formControlName="NTN" placeholder="Ex: 1234567-1">
                <mat-icon matSuffix>account_balance_wallet</mat-icon>
                <mat-error *ngIf="bpForm.get('NTN')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <div class="filer-toggle" [class.active]="bpForm.get('IsFiler')?.value">
                <mat-icon>{{ bpForm.get('IsFiler')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
                <div class="toggle-content">
                  <span class="toggle-label">Tax Filer Status</span>
                  <mat-checkbox formControlName="IsFiler" color="primary">Registered Filer</mat-checkbox>
                </div>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="premium-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          {{ isViewOnly ? 'Close' : 'Cancel' }}
        </button>
        <button *ngIf="!isViewOnly" mat-flat-button color="primary" class="save-btn" 
                [disabled]="bpForm.invalid || isSubmitting" (click)="onSubmit()">
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
          <span>{{ data.partner ? 'Update Partner' : 'Save Partner' }}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      background: white;
      border-radius: 24px;
      overflow: hidden;
    }

    .dialog-header {
      padding: 24px 32px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-content {
        display: flex;
        gap: 20px;
        align-items: center;

        .icon-box {
          width: 56px;
          height: 56px;
          background: var(--accent-electric);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
          mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
        }

        .title-text {
          h2 { margin: 0; font-size: 24px; font-weight: 800; color: var(--primary-deep); letter-spacing: -0.02em; }
          .subtitle { margin: 4px 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
        }
      }

      .close-btn { color: #94a3b8; }
    }

    .premium-content {
      padding: 32px !important;
      margin: 0 !important;
      overflow-y: auto;
      
      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    }

    .bp-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;
        
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--accent-electric); }
        span { font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      &.full { grid-template-columns: 1fr; }
    }

    .tax-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
      align-items: start;
    }

    .filer-toggle {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      transition: all 0.3s ease;
      height: 56px;

      mat-icon { color: #94a3b8; transition: color 0.3s ease; }
      
      .toggle-content {
        display: flex;
        flex-direction: column;
        .toggle-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
        ::ng-deep .mat-mdc-checkbox-label { font-weight: 600; color: #475569; }
      }

      &.active {
        border-color: #10b981;
        background: #f0fdf4;
        mat-icon { color: #10b981; }
      }
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
      mat-icon { font-size: 20px; color: #64748b; }
    }

    .premium-actions {
      padding: 24px 32px !important;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      gap: 16px;

      .cancel-btn {
        height: 48px; padding: 0 24px; border-radius: 12px; font-weight: 700; color: #64748b;
      }

      .save-btn {
        height: 48px;
        padding: 0 32px;
        border-radius: 12px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--accent-electric) 0%, #4f46e5 100%);
        box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        transition: all 0.3s ease;

        &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 20px rgba(99, 102, 241, 0.4); }
        mat-icon { margin-right: 8px; }
        mat-spinner { margin-right: 8px; }
      }
    }

    ::ng-deep {
      .mat-mdc-form-field-subscript-wrapper { display: none; }
      .mat-mdc-text-field-wrapper { background-color: white !important; }
      .mat-mdc-form-field-focus-overlay { background-color: transparent !important; }
    }
  `]
})
export class BusinessPartnerDialogComponent implements OnInit {
  bpForm: FormGroup;
  isSubmitting = false;
  isViewOnly = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BusinessPartnerDialogComponent>,
    private bpService: BusinessPartnerService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { partner?: BusinessPartner, mode?: 'add' | 'edit' | 'view' }
  ) {
    this.isViewOnly = this.data?.mode === 'view';
    
    const partner = this.data?.partner;
    this.bpForm = this.fb.group({
      FirstName: [{ value: partner?.FirstName || '', disabled: this.isViewOnly }, [Validators.required]],
      LastName: [{ value: partner?.LastName || '', disabled: this.isViewOnly }, [Validators.required]],
      BusinessName: [{ value: partner?.BusinessName || '', disabled: this.isViewOnly }, [Validators.required]],
      BusinessAddress: [{ value: partner?.BusinessAddress || '', disabled: this.isViewOnly }, [Validators.required]],
      Type: [{ value: partner?.Type || 'Vendor', disabled: this.isViewOnly }, [Validators.required]],
      Email: [{ value: partner?.Email || '', disabled: this.isViewOnly }, [Validators.required, Validators.email]],
      PhoneNumber: [{ value: partner?.PhoneNumber || '', disabled: this.isViewOnly }, [Validators.required]],
      CNIC: [{ value: partner?.CNIC || '', disabled: this.isViewOnly }, [Validators.required]],
      NTN: [{ value: partner?.NTN || '', disabled: this.isViewOnly || !(partner?.IsFiler ?? true) }, [Validators.required]],
      IsFiler: [{ value: partner?.IsFiler ?? true, disabled: this.isViewOnly }],
      IsActive: [partner?.IsActive ?? true],
      base64: [partner?.base64 || 'string'],
      CreatedBy: [partner?.CreatedBy || 0],
      UpdatedBy: [partner?.UpdatedBy || 0],
      IsDeleted: [partner?.IsDeleted ?? false]
    });

    // Toggle NTN based on IsFiler
    this.bpForm.get('IsFiler')?.valueChanges.subscribe(isFiler => {
      const ntnControl = this.bpForm.get('NTN');
      if (isFiler) {
        ntnControl?.enable();
        ntnControl?.setValidators([Validators.required]);
      } else {
        ntnControl?.disable();
        ntnControl?.clearValidators();
        ntnControl?.setValue(''); // Clear NTN if not a filer
      }
      ntnControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Initial check for NTN state
    if (!this.bpForm.get('IsFiler')?.value) {
      this.bpForm.get('NTN')?.disable();
      this.bpForm.get('NTN')?.clearValidators();
      this.bpForm.get('NTN')?.updateValueAndValidity();
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.bpForm.valid) {
      this.isSubmitting = true;
      const formValue = this.bpForm.getRawValue();
      const now = new Date().toISOString();

      if (this.data?.partner) {
        // Update
        const payload = {
          ...this.data.partner,
          ...formValue,
          UpdatedAt: now
        };
        this.bpService.updateBusinessPartner(this.data.partner.Id, payload).subscribe({
          next: () => {
            this.snackBar.open('Partner updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to update partner:', err);
            this.snackBar.open('Error updating partner.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        // Create
        const payload: CreateBusinessPartnerPayload = {
          ...formValue,
          CreatedAt: now,
          UpdatedAt: now,
          IsDeleted: false
        };
        this.bpService.addBusinessPartner(payload).subscribe({
          next: () => {
            this.snackBar.open('Partner added successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to add partner:', err);
            this.snackBar.open('Error adding partner.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

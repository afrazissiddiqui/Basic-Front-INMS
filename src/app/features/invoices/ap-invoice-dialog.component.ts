import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApInvoiceService, APInvoice } from '../../core/services/ap-invoice.service';
import { BusinessPartnerService, BusinessPartner } from '../../core/services/business-partner.service';
import { ItemService, Item } from '../../core/services/item.service';
import { VatService, VAT } from '../../core/services/vat.service';

@Component({
  selector: 'app-ap-invoice-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isViewOnly ? 'visibility' : (data.invoice ? 'edit' : 'add_shopping_cart') }}</mat-icon> 
      {{ isViewOnly ? 'View' : (data.invoice ? 'Edit' : 'Create') }} AP Invoice
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="invoiceForm" class="invoice-form">
        <div class="header-row">
          <mat-form-field appearance="outline">
            <mat-label>Invoice Number</mat-label>
            <input matInput formControlName="InvoiceNumber" placeholder="Ex: INV-2024-001">
            <mat-error *ngIf="invoiceForm.get('InvoiceNumber')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Invoice Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="InvoiceDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="invoiceForm.get('InvoiceDate')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Vendor (Business Partner)</mat-label>
            <mat-select formControlName="BusinessPartnerId">
              <mat-option *ngFor="let bp of vendors" [value]="bp.Id">
                {{ bp.BusinessName }} ({{ bp.FirstName }} {{ bp.LastName }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="invoiceForm.get('BusinessPartnerId')?.hasError('required')">Required</mat-error>
          </mat-form-field>
        </div>

        <div class="lines-section">
          <div class="section-header">
            <h3>Invoice Lines</h3>
            <button type="button" mat-stroked-button color="primary" (click)="addLine()" *ngIf="!isViewOnly">
              <mat-icon>add</mat-icon> Add Line
            </button>
          </div>

          <div formArrayName="Lines" class="lines-array">
            <div *ngFor="let line of lines.controls; let i=index" [formGroupName]="i" class="line-row">
              <span class="line-number">{{ i + 1 }}</span>
              
              <mat-form-field appearance="outline" class="flex-2">
                <mat-label>Item</mat-label>
                <mat-select formControlName="ItemId">
                  <mat-option *ngFor="let item of items" [value]="item.Id">
                    {{ item.ItemName }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Qty</mat-label>
                <input matInput type="number" formControlName="Quantity">
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Unit Price</mat-label>
                <input matInput type="number" formControlName="UnitPrice">
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>VAT</mat-label>
                <mat-select formControlName="VatId">
                  <mat-option *ngFor="let v of vats" [value]="v.Id">
                    {{ v.Code }} ({{ v.Rate }}%)
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <button type="button" mat-icon-button color="warn" (click)="removeLine(i)" *ngIf="!isViewOnly && lines.length > 1">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">{{ isViewOnly ? 'Close' : 'Cancel' }}</button>
      <button *ngIf="!isViewOnly" mat-flat-button color="primary" [disabled]="invoiceForm.invalid || isSubmitting" (click)="onSubmit()">
        <mat-icon *ngIf="!isSubmitting">save</mat-icon>
        <span *ngIf="!isSubmitting">{{ data.invoice ? 'Update' : 'Post' }} Invoice</span>
        <span *ngIf="isSubmitting">{{ data.invoice ? 'Updating...' : 'Posting...' }}</span>
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
    .invoice-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 900px;
      padding-top: 10px;
    }
    .header-row {
      display: flex;
      gap: 16px;
      mat-form-field { flex: 1; }
    }
    .lines-section {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background: #f8fafc;
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        h3 { margin: 0; font-weight: 700; color: #1e293b; font-size: 16px; }
      }
    }
    .line-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
      
      .line-number {
        width: 24px;
        height: 24px;
        background: #6366f1;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
      }
      
      mat-form-field { margin-bottom: -1.25em; }
      .flex-2 { flex: 2; }
      .flex-1 { flex: 1; }
    }
    .dialog-actions {
      padding: 20px 24px;
      button { border-radius: 10px; font-weight: 600; padding: 0 20px; }
    }
  `]
})
export class ApInvoiceDialogComponent implements OnInit {
  invoiceForm: FormGroup;
  isSubmitting = false;
  isViewOnly = false;
  vendors: BusinessPartner[] = [];
  items: Item[] = [];
  vats: VAT[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApInvoiceDialogComponent>,
    private invoiceService: ApInvoiceService,
    private bpService: BusinessPartnerService,
    private itemService: ItemService,
    private vatService: VatService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { invoice?: any, mode?: 'add' | 'edit' | 'view' }
  ) {
    this.isViewOnly = this.data?.mode === 'view';
    
    this.invoiceForm = this.fb.group({
      InvoiceNumber: [{ value: this.data?.invoice?.InvoiceNumber || '', disabled: this.isViewOnly }, [Validators.required]],
      InvoiceDate: [{ value: this.data?.invoice?.InvoiceDate || new Date(), disabled: this.isViewOnly }, [Validators.required]],
      BusinessPartnerId: [{ value: this.data?.invoice?.BusinessPartnerId || '', disabled: this.isViewOnly }, [Validators.required]],
      Lines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadDropdownData();
    if (this.data?.invoice?.Lines) {
      this.data.invoice.Lines.forEach((line: any) => this.addLine(line));
    } else {
      this.addLine();
    }
  }

  get lines() {
    return this.invoiceForm.get('Lines') as FormArray;
  }

  loadDropdownData() {
    this.bpService.getBusinessPartners().subscribe(res => {
      const data = res.Data || res;
      this.vendors = data.filter((bp: BusinessPartner) => bp.Type === 'Vendor' || bp.Type === 'Both');
    });
    this.itemService.getItems().subscribe(res => this.items = res.Data || res);
    this.vatService.getVATs().subscribe(res => this.vats = res.Data || res);
  }

  addLine(line?: any) {
    const lineGroup = this.fb.group({
      ItemId: [{ value: line?.ItemId || '', disabled: this.isViewOnly }, [Validators.required]],
      Quantity: [{ value: line?.Quantity || 1, disabled: this.isViewOnly }, [Validators.required, Validators.min(1)]],
      UnitPrice: [{ value: line?.UnitPrice || 0, disabled: this.isViewOnly }, [Validators.required, Validators.min(0)]],
      VatId: [{ value: line?.VatId || '', disabled: this.isViewOnly }, [Validators.required]]
    });
    this.lines.push(lineGroup);
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      this.isSubmitting = true;
      const formValue = this.invoiceForm.getRawValue();
      const payload: APInvoice = {
        ...formValue,
        InvoiceDate: new Date(formValue.InvoiceDate).toISOString()
      };

      if (this.data?.invoice) {
        this.invoiceService.updateInvoice(this.data.invoice.Id, payload).subscribe({
          next: () => {
            this.snackBar.open('Invoice updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error updating invoice.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        this.invoiceService.addInvoice(payload).subscribe({
          next: () => {
            this.snackBar.open('Invoice posted successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error posting invoice.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

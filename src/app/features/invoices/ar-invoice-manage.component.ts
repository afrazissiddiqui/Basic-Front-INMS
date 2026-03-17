import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ArInvoiceService, ARInvoice } from '../../core/services/ar-invoice.service';
import { BusinessPartnerService } from '../../core/services/business-partner.service';
import { ItemService } from '../../core/services/item.service';
import { VatService } from '../../core/services/vat.service';

@Component({
  selector: 'app-ar-invoice-manage',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.animate-up', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger('100ms', [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, scale: 0.95, transform: 'translateY(10px)' }),
          stagger('40ms', [
            animate('300ms ease-out', style({ opacity: 1, scale: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-in', style({ opacity: 0, scale: 0.95, transform: 'translateY(10px)' }))
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="creative-page" [@pageAnimations]>
      <!-- Premium Header Background -->
      <div class="creative-header">
        <div class="header-overlay"></div>
        <div class="container">
          <div class="header-content animate-up">
            <button mat-icon-button (click)="goBack()" class="back-btn">
              <mat-icon>arrow_back_ios_new</mat-icon>
            </button>
            <div class="title-wrap">
              <span class="badge">ACCOUNTS RECEIVABLE</span>
              <h1>{{ isViewOnly ? 'View Sale Invoice' : (mode === 'edit' ? 'Edit Sale Invoice' : 'New Sale Invoice') }}</h1>
              <p>{{ invoiceForm.get('InvoiceNumber')?.value || 'Draft Invoice' }} • {{ invoiceForm.get('InvoiceDate')?.value | date:'longDate' }}</p>
            </div>
          </div>

          <!-- Header Stats -->
          <div class="header-stats animate-up">
            <div class="stat-box">
              <span class="label">Total Amount</span>
              <span class="value highlight">PKR {{ grandTotal | number:'1.2-2' }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="label">Total Items</span>
              <span class="value">{{ lines.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="container page-content">
        <form [formGroup]="invoiceForm" (ngSubmit)="saveInvoice()" class="content-grid">
          
          <!-- Section 1: General Information -->
          <div class="section-card animate-up">
            <div class="card-header">
              <div class="title-group">
                <mat-icon>business</mat-icon>
                <h3>Customer Information</h3>
              </div>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Customer</mat-label>
                <mat-select formControlName="BusinessPartnerId">
                  <mat-option *ngFor="let partner of partners" [value]="partner.Id">
                    {{ partner.BusinessName }} ({{ partner.FirstName }} {{ partner.LastName }})
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>person_search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Invoice Number</mat-label>
                <input matInput formControlName="InvoiceNumber" placeholder="INV-0000" readonly>
                <mat-icon matSuffix>tag</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Invoice Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="InvoiceDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>
          </div>

          <!-- Section 2: Invoice Line Items -->
          <div class="section-card animate-up">
            <div class="card-header">
              <div class="title-group">
                <mat-icon>list_alt</mat-icon>
                <h3>Sale Line Items</h3>
              </div>
              <button type="button" mat-flat-button color="primary" class="add-line-btn" 
                      (click)="addLine()" *ngIf="!isViewOnly">
                <mat-icon>add</mat-icon>
                <span>Add New Line</span>
              </button>
            </div>

            <div class="lines-container" formArrayName="Lines" [@listAnimation]="lines.length">
              <div *ngFor="let line of lines.controls; let i=index" [formGroupName]="i" class="line-row">
                <div class="line-index">{{ i + 1 }}</div>
                
                <div class="line-fields">
                  <mat-form-field appearance="outline" class="flex-2">
                    <mat-label>Item / Service</mat-label>
                    <input type="text"
                           placeholder="Search item..."
                           matInput
                           formControlName="ItemNameSearch"
                           [matAutocomplete]="auto">
                    <mat-autocomplete #auto="matAutocomplete" 
                                    (optionSelected)="onSelectedItem($event.option.value, i)"
                                    [displayWith]="displayItemName">
                      <mat-option *ngFor="let item of filteredItems[i] | async" [value]="item">
                        {{ item.ItemName }}
                      </mat-option>
                    </mat-autocomplete>
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Quantity</mat-label>
                    <input matInput type="number" formControlName="Quantity">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Unit Price</mat-label>
                    <input matInput type="number" formControlName="UnitPrice">
                    <span matPrefix>Rs.&nbsp;</span>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>VAT</mat-label>
                    <mat-select formControlName="VatId">
                      <mat-option *ngFor="let v of vats" [value]="v.Id">
                        {{ v.Code }} ({{ v.Rate }}%)
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="line-total">
                  <span class="label">Line Total</span>
                  <span class="value">PKR {{ calculateLineTotal(i) | number:'1.2-2' }}</span>
                </div>

                <button type="button" mat-icon-button color="warn" class="delete-btn"
                        (click)="removeLine(i)" *ngIf="!isViewOnly && lines.length > 1">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Actions Bar -->
      <div class="actions-bar animate-up" *ngIf="!isViewOnly">
        <div class="container bar-content">
          <div class="info-group">
            <mat-icon class="pulse">verified</mat-icon>
            <span>Finalize your invoice entries before posting</span>
          </div>
          <div class="btn-group">
            <button mat-button (click)="goBack()" class="cancel-btn">Cancel</button>
            <button mat-flat-button color="primary" class="post-btn" 
                    [disabled]="invoiceForm.invalid || isSubmitting" (click)="saveInvoice()">
              <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
              <mat-icon *ngIf="!isSubmitting">rocket_launch</mat-icon>
              <span>{{ mode === 'edit' ? 'Update Invoice' : 'Post Invoice' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --primary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%); }

    .creative-page {
      min-height: 100vh;
      background: #f8fafc;
      padding-bottom: 120px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
    }

    /* Header Styling */
    .creative-header {
      position: relative;
      height: 380px;
      background: var(--primary-gradient);
      color: white;
      padding-top: 60px;
      margin-bottom: -140px;
      overflow: hidden;

      .header-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: url('https://www.transparenttextures.com/patterns/cubes.png');
        opacity: 0.1;
      }

      .header-content {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        position: relative;
        z-index: 2;

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          width: 54px;
          height: 54px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          &:hover { background: rgba(255, 255, 255, 0.3); }
        }

        .title-wrap {
          .badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.1em;
            margin-bottom: 12px;
            display: inline-block;
          }
          h1 { font-size: 42px; font-weight: 900; margin: 0; letter-spacing: -0.03em; line-height: 1.1; }
          p { opacity: 0.8; font-size: 18px; margin-top: 8px; font-weight: 500; }
        }
      }

      .header-stats {
        margin-top: 40px;
        padding: 32px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        position: relative;
        z-index: 2;
        
        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
          .label { font-size: 11px; font-weight: 800; text-transform: uppercase; opacity: 0.7; letter-spacing: 0.1em; }
          .value { font-size: 28px; font-weight: 800; margin-top: 4px; 
            &.highlight { text-shadow: 0 0 15px rgba(255,255,255,0.4); }
          }
        }
        .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.15); align-self: center; }
      }
    }

    /* Section Styling */
    .page-content { position: relative; z-index: 3; margin-top: 40px; }
    
    .content-grid {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section-card {
      background: white;
      border-radius: 32px;
      padding: 24px 16px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      position: relative;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        padding-left: 20px;
        border-bottom: 1px solid #f1f5f9;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 0; bottom: 16px;
          width: 4px;
          background: #10b981;
          border-radius: 0 4px 4px 0;
        }

        .title-group { display: flex; align-items: center; gap: 12px; }
        h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; letter-spacing: -0.02em; }
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: #10b981; }
      }
    }

    .form-row { 
      display: flex; 
      gap: 16px;
      & > * { flex: 1; }
    }
    .flex-1 { flex: 1; }

    /* Lines Styling */
    .add-line-btn {
      background: #ecfdf5;
      color: #10b981;
      border-radius: 12px;
      font-weight: 700;
      padding: 0 16px;
      height: 40px;
      transition: all 0.3s ease;
      &:hover { background: #d1fae5; transform: scale(1.02); }
    }

    .lines-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .line-row {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px 16px;
      border-radius: 20px;
      border: 1px solid rgba(16, 185, 129, 0.1);
      position: relative;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: #fcfdff;
      width: 100%;
      box-sizing: border-box;

      &:hover { 
        transform: translateY(-2px); 
        border-color: rgba(16, 185, 129, 0.3); 
        background: white; 
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.08); 
      }

      .line-index {
        width: 32px; height: 32px;
        background: var(--primary-gradient);
        color: white;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-weight: 900; font-size: 12px; flex-shrink: 0;
      }

      .line-fields {
        display: flex;
        gap: 8px;
        flex: 1;
        align-items: center;
        & > * { min-width: 60px; }
        .flex-2 { flex: 2; min-width: 150px; }
        .flex-1 { flex: 1; }
      }

      .line-total {
        width: 110px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        text-align: right;
        .label { font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .value { 
          font-size: 16px; 
          font-weight: 900; 
          color: #047857; 
          margin-top: 2px; 
          white-space: nowrap;
        }
      }

      .delete-btn {
        width: 36px; height: 36px;
        background: #fff1f2;
        color: #ef4444;
        border-radius: 8px;
        &:hover { background: #fee2e2; transform: rotate(15deg) scale(1.1); }
      }
    }

    /* Actions Bar Styling */
    .actions-bar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      padding: 24px 0;
      z-index: 1000;

      .bar-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .info-group {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #64748b;
        font-weight: 600;
        mat-icon { color: #10b981; }
      }

      .btn-group {
        display: flex;
        gap: 16px;
        
        .cancel-btn { font-weight: 700; color: #64748b; padding: 0 32px; height: 56px; border-radius: 16px; }
        .post-btn { 
          background: var(--primary-gradient);
          color: white;
          padding: 0 40px;
          height: 56px;
          border-radius: 18px;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 12px 24px -6px rgba(16, 185, 129, 0.4);
          display: flex; align-items: center; gap: 10px;
          &:hover { box-shadow: 0 15px 30px -8px rgba(16, 185, 129, 0.5); transform: translateY(-2px); }
        }
      }
    }

    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    ::ng-deep {
      .mat-mdc-form-field-subscript-wrapper { display: none !important; }
      .mat-mdc-text-field-wrapper {
        background-color: transparent !important;
        border-radius: 14px !important;
        transition: all 0.3s ease !important;
      }
      .mat-mdc-form-field-focus-fill .mat-mdc-text-field-wrapper {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08) !important;
      }
    }
  `]
})
export class ArInvoiceManageComponent implements OnInit {
  invoiceForm: FormGroup;
  partners: any[] = [];
  items: any[] = [];
  vats: any[] = [];
  mode: 'add' | 'edit' | 'view' = 'add';
  isViewOnly = false;
  isSubmitting = false;
  invoiceId?: number;
  filteredItems: Observable<any[]>[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: ArInvoiceService,
    private partnerService: BusinessPartnerService,
    private itemService: ItemService,
    private vatService: VatService,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.fb.group({
      InvoiceNumber: ['', Validators.required],
      InvoiceDate: [new Date(), Validators.required],
      BusinessPartnerId: [null, Validators.required],
      Lines: this.fb.array([])
    });
  }

  ngOnInit() {
    this.checkMode();
    this.loadDropdowns();

    if (this.mode === 'add') {
      this.generateInvoiceNumber();
      // Listen for date changes to update the invoice number
      this.invoiceForm.get('InvoiceDate')?.valueChanges.subscribe(() => {
        this.generateInvoiceNumber();
      });
    }
  }

  generateInvoiceNumber() {
    const date = this.invoiceForm.get('InvoiceDate')?.value || new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}${minutes}`;
    
    this.invoiceService.getInvoices().subscribe({
      next: (res) => {
        const invoices = res.Data || res || [];
        const prefix = `INV-${formattedDate}-${timeStr}-`;
        
        let maxSeq = 0;
        invoices.forEach((inv: any) => {
          if (inv.InvoiceNumber && inv.InvoiceNumber.startsWith(prefix)) {
            const seqStr = inv.InvoiceNumber.split('-').pop();
            const seq = parseInt(seqStr || '0', 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        });
        
        const nextSeq = (maxSeq + 1).toString().padStart(2, '0');
        this.invoiceForm.patchValue({ InvoiceNumber: `${prefix}${nextSeq}` });
      },
      error: () => {
        this.invoiceForm.patchValue({ InvoiceNumber: `INV-${formattedDate}-${hours}${minutes}-01` });
      }
    });
  }

  get lines() { return this.invoiceForm.get('Lines') as FormArray; }

  displayItemName(item: any): string {
    return item ? item.ItemName : '';
  }

  onSelectedItem(item: any, index: number) {
    const lineGroup = this.lines.at(index);
    lineGroup.get('ItemId')?.setValue(item.Id);
    
    // Auto-fill price from SalePrice
    if (item.SalePrice) {
      lineGroup.get('UnitPrice')?.setValue(item.SalePrice);
    }
  }

  setupItemFilter(index: number) {
    const lineGroup = this.lines.at(index);
    const control = lineGroup.get('ItemNameSearch');
    
    if (control) {
      this.filteredItems[index] = control.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : value?.ItemName;
          return name ? this._filterItems(name) : this.items.slice();
        })
      );
    }
  }

  private _filterItems(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.items.filter(item => item.ItemName.toLowerCase().includes(filterValue));
  }

  checkMode() {
    const segments = this.route.snapshot.url.map(s => s.path);
    if (segments.includes('view')) {
      this.mode = 'view';
      this.isViewOnly = true;
      this.invoiceForm.disable();
    } else if (segments.includes('edit')) {
      this.mode = 'edit';
    }

    this.invoiceId = this.route.snapshot.params['id'];
    if (this.invoiceId) {
      this.loadInvoice(this.invoiceId);
    } else {
      this.addLine();
    }
  }

  loadDropdowns() {
    this.partnerService.getBusinessPartners().subscribe(res => {
      const data = res.Data || res;
      this.partners = data.filter((bp: any) => bp.Type === 'Customer' || bp.Type === 'Both');
    });
    this.itemService.getItems().subscribe(res => this.items = res.Data || res);
    this.vatService.getVATs().subscribe(res => this.vats = res.Data || res);
  }

  loadInvoice(id: number) {
    this.invoiceService.getInvoiceById(id).subscribe(res => {
      const inv = res.Data || res;
      this.invoiceForm.patchValue({
        InvoiceNumber: inv.InvoiceNumber,
        InvoiceDate: new Date(inv.InvoiceDate),
        BusinessPartnerId: inv.BusinessPartnerId
      });
      
      this.lines.clear();
      inv.Lines.forEach((l: any) => {
        const item = this.items.find(i => i.Id === l.ItemId);
        this.addLine(l, item);
      });
    });
  }

  addLine(line?: any, selectedItem?: any) {
    const lineGroup = this.fb.group({
      ItemNameSearch: [selectedItem || '', Validators.required],
      ItemId: [line?.ItemId || null, Validators.required],
      Quantity: [line?.Quantity || 1, [Validators.required, Validators.min(1)]],
      UnitPrice: [line?.UnitPrice || 0, [Validators.required, Validators.min(0)]],
      VatId: [line?.VatId || null, Validators.required]
    });
    
    const index = this.lines.length;
    this.lines.push(lineGroup);
    this.setupItemFilter(index);
  }

  removeLine(index: number) {
    if (this.lines.length > 1) {
      this.lines.removeAt(index);
      this.filteredItems.splice(index, 1);
    }
  }

  calculateLineTotal(index: number): number {
    const line = this.lines.at(index).value;
    const subtotal = (line.Quantity || 0) * (line.UnitPrice || 0);
    const vat = this.vats.find(v => v.Id === line.VatId);
    const vatAmount = vat ? (subtotal * vat.Rate / 100) : 0;
    return subtotal + vatAmount;
  }

  get grandTotal(): number {
    return this.lines.controls.reduce((acc, _, i) => acc + this.calculateLineTotal(i), 0);
  }

  saveInvoice() {
    if (this.invoiceForm.invalid) return;

    this.isSubmitting = true;
    const formRawValue = this.invoiceForm.getRawValue();
    
    // Clean lines of ItemNameSearch before sending to backend
    const cleanLines = formRawValue.Lines.map((l: any) => {
      const { ItemNameSearch, ...lineData } = l;
      return lineData;
    });

    const payload: ARInvoice = {
      ...formRawValue,
      Lines: cleanLines,
      InvoiceDate: this.invoiceForm.value.InvoiceDate.toISOString()
    };

    const request = this.mode === 'edit' 
      ? this.invoiceService.updateInvoice(this.invoiceId!, payload)
      : this.invoiceService.addInvoice(payload);

    request.subscribe({
      next: () => {
        this.snackBar.open(`Invoice ${this.mode === 'edit' ? 'updated' : 'posted'} successfully!`, 'Success', { duration: 3000 });
        this.router.navigate(['/invoices/ar']);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Error saving invoice. Check backend.', 'Error', { duration: 5000 });
      }
    });
  }

  goBack() { this.router.navigate(['/invoices/ar']); }
}

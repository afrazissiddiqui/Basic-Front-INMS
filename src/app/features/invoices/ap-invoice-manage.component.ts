import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ApInvoiceService, APInvoice } from '../../core/services/ap-invoice.service';
import { BusinessPartnerService, BusinessPartner } from '../../core/services/business-partner.service';
import { ItemService, Item } from '../../core/services/item.service';
import { VatService, VAT } from '../../core/services/vat.service';

@Component({
  selector: 'app-ap-invoice-manage',
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
    MatProgressSpinnerModule
  ],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.animate-up', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(50, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="manage-page" [@pageAnimations]>
      <!-- Creative Header -->
      <header class="creative-header animate-up">
        <div class="header-overlay"></div>
        <div class="container">
          <div class="header-content">
            <button mat-icon-button class="back-btn" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="title-wrap">
              <span class="badge">{{ mode.toUpperCase() }} MODE</span>
              <h1>{{ mode === 'add' ? 'Create New' : (mode === 'edit' ? 'Update' : 'View') }} AP Invoice</h1>
              <p>Streamline your accounts payable with precision and style</p>
            </div>
          </div>
          
          <!-- Summary Quick View (Glassmorphism) -->
          <div class="header-stats glass-panel">
            <div class="stat-box">
              <span class="label">Invoice No</span>
              <span class="value">{{ invoiceForm.get('InvoiceNumber')?.value || '---' }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="label">Total Amount</span>
              <span class="value highlight">PKR {{ calculateTotal() | number:'1.2-2' }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="label">Line Items</span>
              <span class="value">{{ lines.length }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="container page-content">
        <form [formGroup]="invoiceForm" class="content-grid">
          <!-- Primary Details Section -->
          <section class="details-section animate-up">
            <div class="section-card shadow-premium">
              <div class="card-header">
                <mat-icon>info_outline</mat-icon>
                <h3>General Information</h3>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Invoice Number</mat-label>
                  <input matInput formControlName="InvoiceNumber" placeholder="INV-2024-001">
                  <mat-icon matSuffix>receipt</mat-icon>
                  <mat-error *ngIf="invoiceForm.get('InvoiceNumber')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Invoice Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="InvoiceDate">
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="invoiceForm.get('InvoiceDate')?.hasError('required')">Required</mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Vendor (Business Partner)</mat-label>
                <mat-select formControlName="BusinessPartnerId">
                  <mat-option *ngFor="let bp of vendors" [value]="bp.Id">
                    <div class="vendor-option">
                      <span class="v-name">{{ bp.BusinessName }}</span>
                      <span class="v-details">{{ bp.FirstName }} {{ bp.LastName }}</span>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>business</mat-icon>
                <mat-error *ngIf="invoiceForm.get('BusinessPartnerId')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
          </section>

          <!-- Line Items Section -->
          <section class="lines-section animate-up">
            <div class="section-card shadow-premium">
              <div class="card-header">
                <div class="title-group">
                  <mat-icon>list_alt</mat-icon>
                  <h3>Invoice Line Items</h3>
                </div>
                <button type="button" mat-flat-button class="add-line-btn" 
                        (click)="addLine()" *ngIf="!isViewOnly">
                  <mat-icon>add</mat-icon> Add New Line
                </button>
              </div>

              <div formArrayName="Lines" class="lines-container" [@listAnimation]="lines.length">
                <div *ngFor="let line of lines.controls; let i=index" 
                     [formGroupName]="i" class="line-row glass-panel-light">
                  <div class="line-index">{{ i + 1 }}</div>
                  
                  <div class="line-fields">
                    <mat-form-field appearance="outline" class="flex-2">
                      <mat-label>Item / Service</mat-label>
                      <mat-select formControlName="ItemId">
                        <mat-option *ngFor="let item of items" [value]="item.Id">
                          {{ item.ItemName }}
                        </mat-option>
                      </mat-select>
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
                    <span class="label">Total</span>
                    <span class="value">PKR {{ calculateLineTotal(i) | number:'1.2-2' }}</span>
                  </div>

                  <button type="button" mat-icon-button color="warn" class="delete-btn"
                          (click)="removeLine(i)" *ngIf="!isViewOnly && lines.length > 1">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>

              <div class="empty-lines" *ngIf="lines.length === 0">
                <mat-icon>shopping_cart_checkout</mat-icon>
                <p>No lines added yet. Click "Add New Line" to begin.</p>
              </div>
            </div>
          </section>
        </form>

        <!-- Dynamic Actions Bar -->
        <div class="actions-bar animate-up shadow-premium glass-panel">
          <div class="info">
            <mat-icon>offline_pin</mat-icon>
            <span>Finalize your invoice entries before posting</span>
          </div>
          <div class="buttons">
            <button mat-button class="cancel-btn" (click)="goBack()">Cancel</button>
            <button mat-flat-button class="submit-btn" 
                    [disabled]="invoiceForm.invalid || isSubmitting" 
                    (click)="onSubmit()" *ngIf="!isViewOnly">
              <mat-icon *ngIf="!isSubmitting">rocket_launch</mat-icon>
              <mat-spinner diameter="24" *ngIf="isSubmitting"></mat-spinner>
              <span>{{ mode === 'edit' ? 'Update Changes' : 'Post Invoice' }}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); }
    
    .manage-page {
      min-height: 100vh;
      background: #f8fafc;
      padding-bottom: 120px;
    }

    .container {
      max-width: 1400px; // Increased from 1200px
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
      padding: 24px 16px; // Aggressive reduction
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
          left: -16px; // Match card padding
          top: 0; bottom: 16px;
          width: 4px;
          background: #6366f1;
          border-radius: 0 4px 4px 0;
        }

        .title-group { display: flex; align-items: center; gap: 12px; }
        h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; letter-spacing: -0.02em; }
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: #6366f1; }
      }
    }

    .form-row { 
      display: flex; 
      gap: 16px;
      & > * { flex: 1; }
    }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; margin-top: 8px; }

    /* Lines Styling */
    .add-line-btn {
      background: #f5f3ff;
      color: #6366f1;
      border-radius: 12px;
      font-weight: 700;
      padding: 0 16px;
      height: 40px;
      transition: all 0.3s ease;
      &:hover { background: #ede9fe; transform: scale(1.02); }
    }

    .lines-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      overflow-x: auto; // Safety net for very small screens
      padding-bottom: 8px;
    }

    .line-row {
      display: flex;
      gap: 12px; // Tightened
      align-items: center;
      padding: 12px 16px; // Minimal padding
      border-radius: 20px;
      border: 1px solid rgba(99, 102, 241, 0.1);
      position: relative;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: #fcfdff;
      width: 100%;
      box-sizing: border-box;

      &:hover { 
        transform: translateY(-2px); 
        border-color: rgba(99, 102, 241, 0.3); 
        background: white; 
        box-shadow: 0 10px 20px rgba(99, 102, 241, 0.08); 
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
        gap: 8px; // Ultra tight
        flex: 1;
        align-items: center;
        
        & > * { min-width: 60px; } // Reduced
        .flex-2 { flex: 2; min-width: 150px; }
        .flex-1 { flex: 1; }
      }

      .line-total {
        width: 110px; // Compact fixed width
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
          color: #4338ca; 
          margin-top: 2px; 
          white-space: nowrap;
        }
      }

      .delete-btn {
        width: 36px; height: 36px;
        background: #fff1f2;
        color: #ef4444;
        border-radius: 8px;
        transition: all 0.3s ease;
        flex-shrink: 0;
        &:hover { background: #fee2e2; color: #dc2626; transform: rotate(15deg) scale(1.1); }
      }
    }

    .empty-lines {
      padding: 60px 0;
      text-align: center;
      color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.3; }
      p { font-size: 16px; font-weight: 500; }
    }

    /* Actions Bar */
    .actions-bar {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      width: min(90%, 1152px);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 24px;
      z-index: 100;
      background: rgba(255,255,255,0.8);
      
      .info {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #64748b;
        font-weight: 600;
        mat-icon { color: #10b981; }
      }

      .buttons {
        display: flex;
        gap: 16px;
        .cancel-btn { font-weight: 700; color: #64748b; height: 52px; padding: 0 32px; border-radius: 14px; }
        .submit-btn {
          height: 52px;
          padding: 0 40px;
          border-radius: 14px;
          font-weight: 800;
          background: var(--primary-gradient);
          color: white;
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
          &:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5); }
          mat-icon { margin-right: 10px; }
        }
      }
    }

    /* Global Utils */
    .glass-panel {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
    }
    .glass-panel-light {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }
    .shadow-premium {
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
    }

    ::ng-deep {
      .mat-mdc-form-field-subscript-wrapper { display: none; }
      .mat-mdc-text-field-wrapper { 
        background-color: white !important; 
        transition: all 0.3s ease !important;
        border-radius: 12px !important;
      }
      .mat-mdc-form-field-focus-overlay { background-color: transparent !important; }
      
      .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
      }
    }

    @media (max-width: 960px) {
      .form-row { flex-direction: column; gap: 0; }
      .line-row .line-fields { flex-direction: column; width: 100%; align-items: stretch; }
      .actions-bar { flex-direction: column; gap: 20px; padding: 24px; text-align: center; }
    }
  `]
})
export class ApInvoiceManageComponent implements OnInit {
  invoiceForm: FormGroup;
  isSubmitting = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  isViewOnly = false;
  invoiceId?: number;
  
  vendors: BusinessPartner[] = [];
  items: Item[] = [];
  vats: VAT[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: ApInvoiceService,
    private bpService: BusinessPartnerService,
    private itemService: ItemService,
    private vatService: VatService,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.fb.group({
      InvoiceNumber: ['', [Validators.required]],
      InvoiceDate: [new Date(), [Validators.required]],
      BusinessPartnerId: ['', [Validators.required]],
      Lines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.checkMode();
    this.loadDropdownData();
  }

  private checkMode() {
    const segments = this.route.snapshot.url.map(s => s.path);
    if (segments.includes('view')) this.mode = 'view';
    else if (segments.includes('edit')) this.mode = 'edit';
    else this.mode = 'add';

    this.isViewOnly = this.mode === 'view';
    this.invoiceId = this.route.snapshot.params['id'];

    if ((this.mode === 'edit' || this.mode === 'view') && this.invoiceId) {
      this.loadInvoice(this.invoiceId);
    } else {
      this.addLine();
    }

    if (this.mode === 'view') {
      this.invoiceForm.disable();
    }
  }

  loadInvoice(id: number) {
    this.invoiceService.getInvoices().subscribe({
      next: (res) => {
        const data = res.Data || res;
        const invoice = data.find((i: any) => i.Id == id);
        if (invoice) {
          this.invoiceForm.patchValue({
            InvoiceNumber: invoice.InvoiceNumber,
            InvoiceDate: new Date(invoice.InvoiceDate),
            BusinessPartnerId: invoice.BusinessPartnerId
          });
          if (invoice.Lines) {
            invoice.Lines.forEach((l: any) => this.addLine(l));
          }
        }
      }
    });
  }

  loadDropdownData() {
    this.bpService.getBusinessPartners().subscribe(res => {
      const data = res.Data || res;
      this.vendors = data.filter((bp: BusinessPartner) => bp.Type === 'Vendor' || bp.Type === 'Both');
    });
    this.itemService.getItems().subscribe(res => this.items = res.Data || res);
    this.vatService.getVATs().subscribe(res => this.vats = res.Data || res);
  }

  get lines() { return this.invoiceForm.get('Lines') as FormArray; }

  addLine(line?: any) {
    const lineGroup = this.fb.group({
      ItemId: [line?.ItemId || '', [Validators.required]],
      Quantity: [line?.Quantity || 1, [Validators.required, Validators.min(1)]],
      UnitPrice: [line?.UnitPrice || 0, [Validators.required, Validators.min(0)]],
      VatId: [line?.VatId || '', [Validators.required]]
    });
    this.lines.push(lineGroup);
  }

  removeLine(index: number) { this.lines.removeAt(index); }

  calculateLineTotal(index: number): number {
    const line = this.lines.at(index).value;
    const qty = line.Quantity || 0;
    const price = line.UnitPrice || 0;
    const vat = this.vats.find(v => v.Id === line.VatId);
    const rate = vat ? (vat.Rate / 100) : 0;
    return (qty * price) * (1 + rate);
  }

  calculateTotal(): number {
    let total = 0;
    for (let i = 0; i < this.lines.length; i++) {
      total += this.calculateLineTotal(i);
    }
    return total;
  }

  goBack() { this.router.navigate(['/invoices/ap']); }

  onSubmit() {
    if (this.invoiceForm.valid) {
      this.isSubmitting = true;
      const formValue = this.invoiceForm.getRawValue();
      const payload: APInvoice = {
        ...formValue,
        InvoiceDate: new Date(formValue.InvoiceDate).toISOString()
      };

      if (this.mode === 'edit' && this.invoiceId) {
        this.invoiceService.updateInvoice(this.invoiceId, payload).subscribe({
          next: () => {
            this.snackBar.open('Invoice updated successfully!', 'Close', { duration: 3000 });
            this.goBack();
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
            this.goBack();
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

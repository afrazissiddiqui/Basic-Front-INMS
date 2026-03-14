import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArInvoiceService } from '../../core/services/ar-invoice.service';

@Component({
  selector: 'app-ar-invoice',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('50ms', [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="header-container animate-fade-in">
      <div class="title-section">
        <h2>Accounts Receivable</h2>
        <p class="subtitle">Manage and track your customer invoices and sales</p>
      </div>
      <button mat-flat-button color="primary" class="add-btn" (click)="openAddInvoiceDialog()">
        <mat-icon>point_of_sale</mat-icon>
        <span>Create AR Invoice</span>
      </button>
    </div>

    <mat-card class="table-card shadow-premium animate-fade-in">
      <div class="table-toolbar">
        <div class="search-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Search by invoice # or customer..." (keyup)="applyFilter($event)" class="creative-search">
        </div>
        
        <div class="stats-mini">
          <div class="stat-item">
            <span class="stat-label">Total Invoices</span>
            <span class="stat-value">{{ dataSource.length }}</span>
          </div>
        </div>
      </div>

      <div class="loading-shade" *ngIf="isLoading">
        <mat-spinner diameter="45"></mat-spinner>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <mat-icon>error_outline</mat-icon>
        <span>{{ errorMessage }}</span>
        <button mat-stroked-button color="primary" (click)="loadInvoices()">Try Again</button>
      </div>

      <div class="table-container" *ngIf="!isLoading && !errorMessage" [@listAnimation]="dataSource.length">
        <table mat-table [dataSource]="filteredDataSource" class="mat-elevation-z0">
          <ng-container matColumnDef="InvoiceNumber">
            <th mat-header-cell *matHeaderCellDef> Invoice # </th>
            <td mat-cell *matCellDef="let element" class="id-cell"> {{element.InvoiceNumber}} </td>
          </ng-container>

          <ng-container matColumnDef="InvoiceDate">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.InvoiceDate | date:'MMM d, y'}} </td>
          </ng-container>

          <ng-container matColumnDef="Customer">
            <th mat-header-cell *matHeaderCellDef> Customer </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="vendor-info">
                <span class="vendor-name">{{element.BusinessPartnerName || 'Unknown Customer'}}</span>
                <span class="vendor-id">ID: {{element.BusinessPartnerId}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="LinesCount">
            <th mat-header-cell *matHeaderCellDef> Items </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="line-badge">{{element.Lines?.length || 0}} Items</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
              <div class="action-group">
                <button mat-icon-button class="action-btn view" matTooltip="View Invoice" (click)="viewInvoice(element)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button class="action-btn edit" matTooltip="Edit Invoice" (click)="editInvoice(element)">
                  <mat-icon>edit_note</mat-icon>
                </button>
                <button mat-icon-button class="action-btn delete" matTooltip="Delete Invoice" (click)="deleteInvoice(element)">
                  <mat-icon>delete_sweep</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover-row"></tr>
        </table>
      </div>

      <div class="no-data" *ngIf="!isLoading && !errorMessage && dataSource.length === 0">
        <div class="empty-state">
          <div class="empty-icon-wrapper">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <h3>No AR invoices found</h3>
          <p>Create your first sales invoice to start tracking receivables.</p>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
      
      .title-section {
        h2 {
          margin: 0;
          font-weight: 800;
          font-size: 36px;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.04em;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 16px;
          margin: 8px 0 0;
          font-weight: 500;
        }
      }

      .add-btn {
        height: 52px;
        padding: 0 28px;
        border-radius: 16px;
        font-weight: 700;
        font-size: 15px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
        border: none;
        color: white;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        mat-icon { margin-right: 10px; font-size: 22px; width: 22px; height: 22px; }
        
        &:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.5);
        }
      }
    }
    
    .table-card {
      padding: 0;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid rgba(226, 232, 240, 0.6);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
    }

    .table-toolbar {
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(250, 251, 252, 0.5);
      border-bottom: 1px solid #f1f5f9;

      .search-wrapper {
        position: relative;
        flex: 1;
        max-width: 420px;

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 22px;
        }

        .creative-search {
          width: 100%;
          height: 48px;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 0 20px 0 52px;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          outline: none;

          &:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
        }
      }

      .stats-mini {
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background: white;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          
          .stat-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
          .stat-value { font-size: 22px; font-weight: 800; color: #065f46; line-height: 1; margin-top: 4px; }
        }
      }
    }

    .table-container {
      padding: 12px 24px;
    }
    
    table {
      width: 100%;
      background: transparent;
    }
    
    th.mat-header-cell {
      font-weight: 800;
      color: #64748b;
      border-bottom: 2px solid #f1f5f9;
      padding: 24px 16px;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.12em;
    }
    
    td.mat-cell {
      padding: 24px 16px;
      border-bottom: 1px solid #f8fafc;
    }

    .id-cell {
      font-weight: 700;
      color: #059669;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }

    .vendor-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .vendor-name { font-weight: 700; color: #1e293b; font-size: 15px; }
      .vendor-id { font-size: 11px; color: #94a3b8; font-weight: 600; }
    }

    .line-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #d1fae5;
    }

    .action-group {
      display: flex;
      gap: 12px;

      .action-btn {
        width: 42px;
        height: 42px;
        line-height: 42px;
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        mat-icon { font-size: 22px; }
        
        &.view { 
          color: #10b981; 
          background: #ecfdf5; 
          &:hover { 
            background: #10b981; 
            color: white; 
            transform: translateY(-4px);
          }
        }
        
        &.edit { 
          color: #3b82f6; 
          background: #eff6ff; 
          &:hover { 
            background: #3b82f6; 
            color: white; 
            transform: translateY(-4px) rotate(-8deg);
          }
        }
        
        &.delete { 
          color: #ef4444; 
          background: #fef2f2; 
          &:hover { 
            background: #ef4444; 
            color: white; 
            transform: translateY(-4px) scale(1.1);
          }
        }
      }
    }

    .hover-row {
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover {
        background-color: rgba(248, 250, 252, 0.8) !important;
        transform: translateX(8px);
        .id-cell { color: #10b981; }
      }
    }

    .loading-shade {
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-message {
      padding: 40px;
      text-align: center;
      color: #ef4444;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      mat-icon { font-size: 48px; width: 48px; height: 48px; }
    }

    .empty-state {
      padding: 100px 0;
      text-align: center;
      color: #94a3b8;
      
      .empty-icon-wrapper {
        width: 100px; height: 100px;
        background: #f8fafc;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }
      }

      h3 { color: #064e3b; font-weight: 800; font-size: 24px; margin-bottom: 12px; }
      p { font-size: 16px; max-width: 300px; margin: 0 auto; line-height: 1.6; }
    }
  `]
})
export class ArInvoiceComponent implements OnInit {
  displayedColumns: string[] = ['InvoiceNumber', 'InvoiceDate', 'Customer', 'LinesCount', 'actions'];
  dataSource: any[] = [];
  filteredDataSource: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private invoiceService: ArInvoiceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.invoiceService.getInvoices().subscribe({
      next: (response) => {
        const data = response.Data || response;
        this.dataSource = Array.isArray(data) ? data : [];
        this.filteredDataSource = [...this.dataSource];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load AR invoices. Ensure backend is running.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (!filterValue) {
      this.filteredDataSource = [...this.dataSource];
      return;
    }
    this.filteredDataSource = this.dataSource.filter(inv => 
      inv.InvoiceNumber?.toLowerCase().includes(filterValue) || 
      (inv.BusinessPartnerName && inv.BusinessPartnerName.toLowerCase().includes(filterValue))
    );
  }

  openAddInvoiceDialog() {
    this.router.navigate(['/invoices/ar/new']);
  }

  viewInvoice(invoice: any) {
    this.router.navigate(['/invoices/ar/view', invoice.Id]);
  }

  editInvoice(invoice: any) {
    this.router.navigate(['/invoices/ar/edit', invoice.Id]);
  }

  deleteInvoice(invoice: any) {
    // @ts-ignore
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete AR invoice ${invoice.InvoiceNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'premium-swal-popup',
        title: 'premium-swal-title',
        confirmButton: 'premium-swal-confirm'
      }
    }).then((result: any) => { 
      if (result.isConfirmed) {
        this.invoiceService.deleteInvoice(invoice.Id).subscribe({
          next: () => {
            // @ts-ignore
            Swal.fire('Deleted!', 'Invoice has been removed.', 'success');
            this.loadInvoices();
          },
          error: (err) => {
            console.error(err);
            // @ts-ignore
            Swal.fire('Error!', 'Failed to delete invoice.', 'error');
          }
        });
      }
    });
  }
}

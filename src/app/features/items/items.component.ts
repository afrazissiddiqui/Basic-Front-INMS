import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
// Removed import Swal from 'sweetalert2' as it's now loaded via CDN
import { ItemService, Item } from '../../core/services/item.service';
import { ItemDialogComponent } from './item-dialog.component';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
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
        <h2>Inventory Management</h2>
        <p class="subtitle">Track and manage your products with ease</p>
      </div>
      <button mat-flat-button color="primary" class="add-btn hover-lift" (click)="openAddItemDialog()">
        <mat-icon>add_box</mat-icon>
        <span>Add New Item</span>
      </button>
    </div>

    <mat-card class="table-card shadow-premium animate-fade-in">
      <div class="table-toolbar">
        <div class="search-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Search by name or category..." (keyup)="applyFilter($event)" class="creative-search">
        </div>
        
        <div class="stats-mini">
          <div class="stat-item">
            <span class="stat-label">Total Items</span>
            <span class="stat-value">{{ totalRecords }}</span>
          </div>
        </div>
      </div>

      <div class="loading-shade" *ngIf="isLoading">
        <mat-spinner diameter="45"></mat-spinner>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <mat-icon>error_outline</mat-icon>
        <span>{{ errorMessage }}</span>
        <button mat-stroked-button color="primary" (click)="loadItems()">Try Again</button>
      </div>

      <div class="table-container" *ngIf="!isLoading && !errorMessage" [@listAnimation]="dataSource.length">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z0">
          <!-- ID Column -->
          <ng-container matColumnDef="Id">
            <th mat-header-cell *matHeaderCellDef> # </th>
            <td mat-cell *matCellDef="let element" class="id-cell"> {{element.Id}} </td>
          </ng-container>

          <!-- Item Name Column -->
          <ng-container matColumnDef="ItemName">
            <th mat-header-cell *matHeaderCellDef> Product Details </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="product-info">
                <span class="product-name">{{element.ItemName}}</span>
                <span class="product-unit">{{element.UnitAbbreviation}}</span>
              </div>
            </td>
          </ng-container>

          <!-- Category Column -->
          <ng-container matColumnDef="CategoryName">
            <th mat-header-cell *matHeaderCellDef> Category </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="category-badge">
                <mat-icon>label</mat-icon>
                {{element.CategoryName}}
              </span>
            </td>
          </ng-container>

          <!-- Stock Column -->
          <ng-container matColumnDef="StockQuantity">
            <th mat-header-cell *matHeaderCellDef> Stock Status </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="stock-cell">
                <div class="stock-badge" [ngClass]="getStockStatusClass(element.StockQuantity)">
                  <span class="dot"></span>
                  {{element.StockQuantity}} In Stock
                </div>
                <div class="stock-bar-container">
                  <div class="stock-bar" [style.width.%]="getStockPercentage(element.StockQuantity)" [ngClass]="getStockStatusClass(element.StockQuantity)"></div>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
              <div class="action-group">
                <button mat-icon-button class="action-btn view" matTooltip="View Item" (click)="viewItem(element)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button class="action-btn edit" matTooltip="Edit Item" (click)="editItem(element)">
                  <mat-icon>edit_note</mat-icon>
                </button>
                <button mat-icon-button class="action-btn delete" matTooltip="Delete Item" (click)="deleteItem(element)">
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
            <mat-icon>inventory_2</mat-icon>
          </div>
          <h3>Your inventory is empty</h3>
          <p>Click "Add New Item" to start tracking your stock.</p>
        </div>
      </div>

      <mat-paginator
        *ngIf="!isLoading && !errorMessage"
        [length]="totalRecords"
        [pageSize]="pageSize"
        [pageIndex]="pageNumber - 1"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        class="custom-paginator">
      </mat-paginator>
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
          background: linear-gradient(135deg, var(--primary-deep) 0%, var(--accent-electric) 100%);
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
        background: linear-gradient(135deg, var(--accent-electric) 0%, #4f46e5 100%);
        box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        border: none;
        color: white;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        mat-icon { margin-right: 10px; font-size: 22px; width: 22px; height: 22px; }
        
        &:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 25px -5px rgba(99, 102, 241, 0.5);
        }
        
        &:active { transform: translateY(0) scale(0.98); }
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
            border-color: var(--accent-electric);
            box-shadow: 0 0 0 4px var(--accent-glow);
            width: 110%;
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
          
          .stat-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
          .stat-value { font-size: 22px; font-weight: 800; color: var(--primary-deep); line-height: 1; margin-top: 4px; }
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
      color: #cbd5e1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .product-name { 
        font-weight: 700; 
        color: var(--primary-deep); 
        font-size: 16px;
        transition: color 0.2s ease;
      }
      .product-unit { 
        font-size: 12px; 
        color: #94a3b8; 
        font-weight: 600;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 6px;
        width: fit-content;
      }
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: #f8fafc;
      color: #475569;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      border: 1px solid #f1f5f9;
      transition: all 0.2s ease;
      
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #cbd5e1; }
      
      &:hover {
        background: white;
        border-color: var(--accent-electric);
        color: var(--accent-electric);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
      }
    }

    .stock-cell {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 180px;

      .stock-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 800;
        
        .dot { 
          width: 10px; 
          height: 10px; 
          border-radius: 50%; 
          position: relative;
          &::after {
            content: '';
            position: absolute;
            top: -2px; left: -2px; right: -2px; bottom: -2px;
            border-radius: 50%;
            opacity: 0.4;
            animation: pulse 2s infinite;
          }
        }
        
        &.stock-high { 
          color: #059669; 
          .dot { background: #10b981; &::after { background: #10b981; } } 
        }
        &.stock-low { 
          color: #d97706; 
          .dot { background: #f59e0b; &::after { background: #f59e0b; } } 
        }
        &.stock-out { 
          color: #dc2626; 
          .dot { background: #ef4444; &::after { background: #ef4444; } } 
        }
      }

      .stock-bar-container {
        height: 8px;
        background: #f1f5f9;
        border-radius: 12px;
        overflow: hidden;
        
        .stock-bar {
          height: 100%;
          border-radius: 12px;
          transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          
          &.stock-high { background: linear-gradient(90deg, #10b981, #34d399); }
          &.stock-low { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
          &.stock-out { background: linear-gradient(90deg, #ef4444, #f87171); }
        }
      }
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.8); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
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
          color: #64748b;
          background: #f1f5f9;
          &:hover {
            background: #64748b;
            color: white;
            transform: translateY(-4px);
          }
        }
        
        &.edit { 
          color: var(--accent-electric); 
          background: #eff6ff; 
          &:hover { 
            background: var(--accent-electric); 
            color: white; 
            transform: translateY(-4px) rotate(-8deg);
            box-shadow: 0 8px 15px rgba(99, 102, 241, 0.2);
          }
        }
        
        &.delete { 
          color: #ef4444; 
          background: #fef2f2; 
          &:hover { 
            background: #ef4444; 
            color: white; 
            transform: translateY(-4px) scale(1.1);
            box-shadow: 0 8px 15px rgba(239, 68, 68, 0.2);
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
        
        .product-name { color: var(--accent-electric); }
        .id-cell { color: var(--primary-deep); }
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

    .empty-state {
      padding: 100px 0;
      text-align: center;
      color: #94a3b8;
      
      .empty-icon-wrapper {
        width: 100px;
        height: 100px;
        background: #f8fafc;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        
        mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }
      }

      h3 { color: var(--primary-deep); font-weight: 800; font-size: 24px; margin-bottom: 12px; }
      p { font-size: 16px; max-width: 300px; margin: 0 auto; line-height: 1.6; }
    }

    .custom-paginator {
      background: rgba(250, 251, 252, 0.5);
      border-top: 1px solid #f1f5f9;
      padding: 12px 24px;
      
      ::ng-deep .mat-mdc-paginator-container {
        justify-content: space-between;
      }
    }
  `]
})
export class ItemsComponent implements OnInit {
  displayedColumns: string[] = ['Id', 'ItemName', 'CategoryName', 'StockQuantity', 'actions'];
  dataSource: Item[] = [];
  isLoading = true;
  errorMessage = '';

  // Pagination
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 25;

  constructor(
    private itemService: ItemService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  openAddItemDialog() {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '500px',
      data: { mode: 'add' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems(); // Refresh list if an item was added
      }
    });
  }

  viewItem(item: Item) {
    this.dialog.open(ItemDialogComponent, {
      width: '500px',
      data: { item, mode: 'view' }
    });
  }

  editItem(item: Item) {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '500px',
      data: { item, mode: 'edit' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }

  deleteItem(item: Item) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete the item "${item.ItemName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      background: '#ffffff',
      borderRadius: '16px',
      customClass: {
        popup: 'premium-swal-popup',
        title: 'premium-swal-title',
        confirmButton: 'premium-swal-confirm'
      }
    }).then((result: any) => { 
      if (result.isConfirmed) {
        this.itemService.deleteItem(item.Id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The item has been successfully removed.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              borderRadius: '16px'
            });
            this.loadItems();
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete the item. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#3b82f6',
              borderRadius: '16px'
            });
          }
        });
      }
    });
  }

  loadItems() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.itemService.getItems(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        console.log('API Response:', response); // Log the response for easier debugging

        if (Array.isArray(response)) {
          this.dataSource = response;
          this.totalRecords = response.length;
        } else if (response && typeof response === 'object') {
          // Handle capitalized response keys from the API
          this.dataSource = response.Data || response.data || response.items || [];
          this.totalRecords = response.TotalCount || response.totalRecords || this.dataSource.length;
          
          if (this.dataSource.length > 0) {
            console.log('Sample item structure:', Object.keys(this.dataSource[0]));
          }
        } else {
          this.dataSource = [];
          this.totalRecords = 0;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching items:', error);
        this.errorMessage = 'Failed to load items. Please ensure the backend server (https://localhost:7176) is running and your certificate is trusted.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadItems();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    // This is a simple client-side filter for now
    // Real-world apps would often do server-side filtering
    if (!filterValue) {
      this.loadItems();
      return;
    }
    this.dataSource = this.dataSource.filter(item => 
      item.ItemName.toLowerCase().includes(filterValue) || 
      item.CategoryName.toLowerCase().includes(filterValue)
    );
  }

  getStockStatusClass(quantity: number): string {
    if (quantity <= 0) return 'stock-out';
    if (quantity <= 10) return 'stock-low';
    return 'stock-high';
  }

  getStockPercentage(quantity: number): number {
    // Mock percentage logic for visualization
    const max = 100;
    return Math.min((quantity / max) * 100, 100);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VatService, VAT } from '../../core/services/vat.service';
import { VatDialogComponent } from './vat-dialog.component';

@Component({
  selector: 'app-vat',
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
        <h2>VAT Configuration</h2>
        <p class="subtitle">Manage tax rates and standard percentages</p>
      </div>
      <button mat-flat-button color="primary" class="add-btn" (click)="openAddVatDialog()">
        <mat-icon>percent</mat-icon>
        <span>Add New VAT</span>
      </button>
    </div>

    <mat-card class="table-card shadow-premium animate-fade-in">
      <div class="table-toolbar">
        <div class="search-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Search VAT codes..." (keyup)="applyFilter($event)" class="creative-search">
        </div>
        
        <div class="stats-mini">
          <div class="stat-item">
            <span class="stat-label">Total Rules</span>
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
        <button mat-stroked-button color="primary" (click)="loadVats()">Try Again</button>
      </div>

      <div class="table-container" *ngIf="!isLoading && !errorMessage" [@listAnimation]="dataSource.length">
        <table mat-table [dataSource]="filteredDataSource" class="mat-elevation-z0">
          <ng-container matColumnDef="Id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element" class="id-cell"> #{{element.Id}} </td>
          </ng-container>

          <ng-container matColumnDef="Code">
            <th mat-header-cell *matHeaderCellDef> VAT Code </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="vat-info">
                <span class="vat-name">{{element.Code}}</span>
                <span class="vat-sub">{{element.Description}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="Rate">
            <th mat-header-cell *matHeaderCellDef> Rate </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="rate-badge">
                {{element.Rate}}%
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
              <div class="action-group">
                <button mat-icon-button class="action-btn view" matTooltip="View VAT" (click)="viewVat(element)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button class="action-btn edit" matTooltip="Edit VAT" (click)="editVat(element)">
                  <mat-icon>edit_note</mat-icon>
                </button>
                <button mat-icon-button class="action-btn delete" matTooltip="Delete VAT" (click)="deleteVat(element)">
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
            <mat-icon>percent</mat-icon>
          </div>
          <h3>No VAT rules found</h3>
          <p>Create your first VAT configuration to start managing tax rates.</p>
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

    .vat-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .vat-name { font-weight: 700; color: var(--primary-deep); font-size: 16px; }
      .vat-sub { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    }

    .rate-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 800;
      background: #eff6ff;
      color: var(--accent-electric);
      font-family: 'JetBrains Mono', monospace;
      border: 1px solid #dbeafe;
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
          color: #6366f1; 
          background: #eef2ff; 
          &:hover { 
            background: #6366f1; 
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
        .vat-name { color: var(--accent-electric); }
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
        width: 100px; height: 100px;
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
  `]
})
export class VatComponent implements OnInit {
  displayedColumns: string[] = ['Id', 'Code', 'Rate', 'actions'];
  dataSource: VAT[] = [];
  filteredDataSource: VAT[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private vatService: VatService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadVats();
  }

  loadVats() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.vatService.getVATs().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.dataSource = response;
        } else if (response && typeof response === 'object') {
          this.dataSource = response.Data || response.data || response.items || response.value || [];
        } else {
          this.dataSource = [];
        }
        this.filteredDataSource = [...this.dataSource];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load VAT:', err);
        this.errorMessage = 'Failed to load VAT. Please ensure the backend is running.';
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
    this.filteredDataSource = this.dataSource.filter(v => 
      v.Code.toLowerCase().includes(filterValue) || 
      v.Description.toLowerCase().includes(filterValue)
    );
  }

  openAddVatDialog() {
    const dialogRef = this.dialog.open(VatDialogComponent, {
      width: '450px',
      disableClose: true,
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVats();
      }
    });
  }

  viewVat(vat: VAT) {
    this.dialog.open(VatDialogComponent, {
      width: '450px',
      data: { vat, mode: 'view' }
    });
  }

  editVat(vat: VAT) {
    const dialogRef = this.dialog.open(VatDialogComponent, {
      width: '450px',
      disableClose: true,
      data: { vat, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVats();
      }
    });
  }

  deleteVat(vat: VAT) {
    // @ts-ignore
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete the VAT rule "${vat.Code}"?`,
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
        this.vatService.deleteVAT(vat.Id).subscribe({
          next: () => {
            // @ts-ignore
            Swal.fire({
              title: 'Deleted!',
              text: 'The VAT rule has been successfully removed.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              borderRadius: '16px'
            });
            this.loadVats();
          },
          error: (err) => {
            console.error('Failed to delete VAT:', err);
            // @ts-ignore
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete. This VAT rule might be in use.',
              icon: 'error',
              confirmButtonColor: '#3b82f6',
              borderRadius: '16px'
            });
          }
        });
      }
    });
  }
}

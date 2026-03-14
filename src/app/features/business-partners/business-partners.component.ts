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
import { MatChipsModule } from '@angular/material/chips';
import { BusinessPartnerService, BusinessPartner } from '../../core/services/business-partner.service';
import { BusinessPartnerDialogComponent } from './business-partner-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-business-partners',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
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
        <h2>Business Partners</h2>
        <p class="subtitle">Manage your vendors, customers, and business associates</p>
      </div>
      <button mat-flat-button color="primary" class="add-btn" (click)="openAddPartnerDialog()">
        <mat-icon>handshake</mat-icon>
        <span>Add New Partner</span>
      </button>
    </div>

    <mat-card class="table-card shadow-premium animate-fade-in">
      <div class="table-toolbar">
        <div class="search-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Search by name, business or email..." (keyup)="applyFilter($event)" class="creative-search">
        </div>
        
        <div class="stats-mini">
          <div class="stat-item">
            <span class="stat-label">Total Partners</span>
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
        <button mat-stroked-button color="primary" (click)="loadPartners()">Try Again</button>
      </div>

      <div class="table-container" *ngIf="!isLoading && !errorMessage" [@listAnimation]="dataSource.length">
        <table mat-table [dataSource]="filteredDataSource" class="mat-elevation-z0">
          <ng-container matColumnDef="Id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element" class="id-cell"> #{{element.Id}} </td>
          </ng-container>

          <ng-container matColumnDef="Partner">
            <th mat-header-cell *matHeaderCellDef> Partner Details </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="partner-info">
                <span class="partner-name">{{element.FirstName}} {{element.LastName}}</span>
                <span class="partner-email">{{element.Email}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="Business">
            <th mat-header-cell *matHeaderCellDef> Business </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="business-info">
                <span class="business-name">{{element.BusinessName}}</span>
                <span class="business-address">{{element.BusinessAddress | slice:0:30}}...</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="Type">
            <th mat-header-cell *matHeaderCellDef> Type </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="type-badge" [class]="element.Type.toLowerCase()">
                {{element.Type}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="Tax">
            <th mat-header-cell *matHeaderCellDef> Tax Info </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="tax-info">
                <span class="filer-status" [class.filer]="element.IsFiler">
                  {{element.IsFiler ? 'Filer' : 'Non-Filer'}}
                </span>
                <span class="ntn-text">NTN: {{element.NTN}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
              <div class="action-group">
                <button mat-icon-button class="action-btn view" matTooltip="View Details" (click)="viewPartner(element)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button class="action-btn edit" matTooltip="Edit Partner" (click)="editPartner(element)">
                  <mat-icon>edit_note</mat-icon>
                </button>
                <button mat-icon-button class="action-btn delete" matTooltip="Delete Partner" (click)="deletePartner(element)">
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
            <mat-icon>handshake</mat-icon>
          </div>
          <h3>No partners found</h3>
          <p>Add your first vendor or customer to start building your business network.</p>
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

    .partner-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .partner-name { font-weight: 700; color: var(--primary-deep); font-size: 16px; }
      .partner-email { font-size: 12px; color: #6366f1; font-weight: 600; }
    }

    .business-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .business-name { font-weight: 700; color: #1e293b; font-size: 14px; }
      .business-address { font-size: 11px; color: #94a3b8; font-weight: 500; }
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      
      &.vendor { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
      &.customer { background: #f0f9ff; color: #0284c7; border: 1px solid #e0f2fe; }
      &.both { background: #f5f3ff; color: #7c3aed; border: 1px solid #ede9fe; }
    }

    .tax-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .filer-status {
        font-size: 10px; font-weight: 800; text-transform: uppercase;
        color: #ef4444; background: #fef2f2; padding: 2px 8px; border-radius: 4px; width: fit-content;
        &.filer { color: #10b981; background: #ecfdf5; }
      }
      .ntn-text { font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; }
    }

    .action-group {
      display: flex;
      gap: 8px;

      .action-btn {
        width: 38px; height: 38px; line-height: 38px; border-radius: 10px; transition: all 0.3s ease;
        mat-icon { font-size: 20px; }
        
        &.view { color: #6366f1; background: #eef2ff; &:hover { background: #6366f1; color: white; } }
        &.edit { color: var(--accent-electric); background: #eff6ff; &:hover { background: var(--accent-electric); color: white; } }
        &.delete { color: #ef4444; background: #fef2f2; &:hover { background: #ef4444; color: white; } }
      }
    }

    .hover-row {
      cursor: pointer;
      transition: all 0.4s ease;
      &:hover { background-color: rgba(248, 250, 252, 0.8) !important; transform: translateX(4px); }
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
      padding: 80px 0; text-align: center; color: #94a3b8;
      .empty-icon-wrapper {
        width: 80px; height: 80px; background: #f8fafc; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
        mat-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; }
      }
      h3 { color: var(--primary-deep); font-weight: 800; font-size: 22px; margin-bottom: 8px; }
      p { font-size: 15px; max-width: 300px; margin: 0 auto; }
    }
  `]
})
export class BusinessPartnersComponent implements OnInit {
  displayedColumns: string[] = ['Id', 'Partner', 'Business', 'Type', 'Tax', 'actions'];
  dataSource: BusinessPartner[] = [];
  filteredDataSource: BusinessPartner[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private bpService: BusinessPartnerService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadPartners();
  }

  loadPartners() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.bpService.getBusinessPartners().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.dataSource = response;
        } else if (response && typeof response === 'object') {
          this.dataSource = response.Data || response.data || response.items || response.value || [];
        } else {
          this.dataSource = [];
        }
        this.filteredDataSource = [...this.dataSource];
        
        // Auto-filter based on query params
        const typeParam = this.route.snapshot.queryParamMap.get('type');
        if (typeParam) {
          this.filteredDataSource = this.dataSource.filter(p => 
            p.Type.toLowerCase() === typeParam.toLowerCase()
          );
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load partners:', err);
        this.errorMessage = 'Failed to load partners. Please ensure the backend is running.';
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
    this.filteredDataSource = this.dataSource.filter(p => 
      p.FirstName.toLowerCase().includes(filterValue) || 
      p.LastName.toLowerCase().includes(filterValue) || 
      p.BusinessName.toLowerCase().includes(filterValue) || 
      p.Email.toLowerCase().includes(filterValue)
    );
  }

  openAddPartnerDialog() {
    const dialogRef = this.dialog.open(BusinessPartnerDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      disableClose: true,
      data: { mode: 'add' },
      panelClass: 'premium-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartners();
      }
    });
  }

  viewPartner(partner: BusinessPartner) {
    this.dialog.open(BusinessPartnerDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      data: { partner, mode: 'view' },
      panelClass: 'premium-dialog-panel'
    });
  }

  editPartner(partner: BusinessPartner) {
    const dialogRef = this.dialog.open(BusinessPartnerDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      disableClose: true,
      data: { partner, mode: 'edit' },
      panelClass: 'premium-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartners();
      }
    });
  }

  deletePartner(partner: BusinessPartner) {
    // @ts-ignore
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete partner "${partner.FirstName} ${partner.LastName}"?`,
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
        this.bpService.deleteBusinessPartner(partner.Id).subscribe({
          next: () => {
            // @ts-ignore
            Swal.fire({
              title: 'Deleted!',
              text: 'Partner has been removed.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadPartners();
          },
          error: (err) => {
            console.error('Failed to delete partner:', err);
            // @ts-ignore
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete. This partner may have linked transactions.',
              icon: 'error'
            });
          }
        });
      }
    });
  }
}

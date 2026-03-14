import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { PermissionService, AssignPermission } from '../../core/services/permission.service';
import { RoleService, Role } from '../../core/services/role.service';
import { PermissionDefinitionService, PermissionDefinition } from '../../core/services/permission-definition.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
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
        <h2>Permission Management</h2>
        <p class="subtitle">Configure access matrix for system roles</p>
      </div>
      
      <div class="header-actions">
        <mat-form-field appearance="outline" class="role-selector">
          <mat-label>Select Role</mat-label>
          <mat-select [(ngModel)]="selectedRoleId" (selectionChange)="onRoleChange($event.value)">
            <mat-option *ngFor="let role of roles" [value]="role.Id">
              {{ role.Name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-flat-button color="primary" class="save-btn" 
                [disabled]="!selectedRoleId || !hasChanges || isSaving"
                (click)="savePermissions()">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <mat-icon *ngIf="!isSaving">save</mat-icon>
          <span>Save Permissions</span>
        </button>
      </div>
    </div>

    <mat-card class="table-card shadow-premium animate-fade-in">
      <div class="table-toolbar" *ngIf="selectedRoleId">
        <div class="search-wrapper">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Filter permissions..." (keyup)="applyFilter($event)" class="creative-search">
        </div>
        
        <div class="stats-mini">
          <div class="stat-item" *ngIf="hasChanges">
            <span class="stat-label">Pending Changes</span>
            <span class="stat-value text-accent">YES</span>
          </div>
        </div>
      </div>

      <div class="loading-shade" *ngIf="isLoading">
        <mat-spinner diameter="45"></mat-spinner>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <mat-icon>error_outline</mat-icon>
        <span>{{ errorMessage }}</span>
        <button mat-stroked-button color="primary" (click)="loadInitialData()">Try Again</button>
      </div>

      <div class="table-container" *ngIf="!isLoading && !errorMessage && selectedRoleId" [@listAnimation]="filteredGridData.length">
        <table mat-table [dataSource]="filteredGridData" class="mat-elevation-z0">
          <ng-container matColumnDef="permission">
            <th mat-header-cell *matHeaderCellDef> Permission </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="name-info">
                <span class="main-name">{{ element.Name }}</span>
                <span class="sub-id">DEFINITION</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="read">
            <th mat-header-cell *matHeaderCellDef class="centered-header"> Read </th>
            <td mat-cell *matCellDef="let element" class="centered-cell">
              <mat-checkbox [(ngModel)]="element.CanRead" color="primary"></mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="create">
            <th mat-header-cell *matHeaderCellDef class="centered-header"> Create </th>
            <td mat-cell *matCellDef="let element" class="centered-cell">
              <mat-checkbox [(ngModel)]="element.CanCreate" color="primary"></mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="update">
            <th mat-header-cell *matHeaderCellDef class="centered-header"> Update </th>
            <td mat-cell *matCellDef="let element" class="centered-cell">
              <mat-checkbox [(ngModel)]="element.CanUpdate" color="primary"></mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="delete">
            <th mat-header-cell *matHeaderCellDef class="centered-header"> Delete </th>
            <td mat-cell *matCellDef="let element" class="centered-cell">
              <mat-checkbox [(ngModel)]="element.CanDelete" color="primary"></mat-checkbox>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover-row"></tr>
        </table>
      </div>

      <div class="no-data" *ngIf="!isLoading && !errorMessage && !selectedRoleId">
        <div class="empty-state">
          <div class="empty-icon-wrapper">
            <mat-icon>touch_app</mat-icon>
          </div>
          <h3>Select a Role</h3>
          <p>Please select a system role to view and manage its permissions.</p>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      
      .title-section {
        h2 {
          margin: 0;
          font-weight: 800;
          font-size: 32px;
          background: linear-gradient(135deg, var(--primary-deep) 0%, var(--accent-electric) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.04em;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin: 4px 0 0;
          font-weight: 500;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;

        .role-selector {
          width: 250px;
          ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
        }

        .save-btn {
          height: 48px;
          padding: 0 24px;
          border-radius: 12px;
          font-weight: 700;
          background: var(--accent-electric);
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;

          &:disabled { opacity: 0.6; background: #cbd5e1; }
          &:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3); }
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
          .stat-value { font-size: 18px; font-weight: 800; color: var(--primary-deep); margin-top: 2px; }
          .stat-value.text-accent { color: var(--accent-electric); }
        }
      }
    }

    .table-container {
      padding: 12px 32px 40px; /* Increased right and bottom padding */
      overflow-x: auto;
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
      padding: 12px 16px;
      border-bottom: 1px solid #f8fafc;
    }

    .centered-header { 
      text-align: center; 
      padding: 24px 20px !important;
    }
    .centered-cell { 
      text-align: center; 
      padding: 12px 20px !important;
    }

    /* Target the last column specifically to ensure it doesn't touch the border */
    .mat-column-delete {
      padding-right: 24px !important;
    }

    .name-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .main-name { font-weight: 700; color: var(--primary-deep); font-size: 14px; }
      .sub-id { font-size: 9px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
    }

    .hover-row {
      transition: background-color 0.2s ease;
      &:hover { background-color: #f8fafc !important; }
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
export class PermissionListComponent implements OnInit {
  displayedColumns: string[] = ['permission', 'read', 'create', 'update', 'delete'];
  roles: Role[] = [];
  permissionDefinitions: PermissionDefinition[] = [];

  gridData: any[] = [];
  filteredGridData: any[] = [];
  originalState: string = '';

  selectedRoleId: number | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(
    private permissionService: PermissionService,
    private roleService: RoleService,
    private permDefService: PermissionDefinitionService
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.gridData) !== this.originalState;
  }

  loadInitialData() {
    this.isLoading = true;
    forkJoin({
      roles: this.roleService.getRoles(),
      definitions: this.permDefService.getPermissions()
    }).subscribe({
      next: (res) => {
        const extract = (d: any) => Array.isArray(d) ? d : (d?.Data || d?.data || d?.items || d?.value || []);
        this.roles = extract(res.roles);
        this.permissionDefinitions = extract(res.definitions);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load configuration data.';
        this.isLoading = false;
      }
    });
  }

  onRoleChange(roleId: number) {
    this.isLoading = true;
    this.permissionService.getPermissionsByRole(roleId).subscribe({
      next: (res) => {
        const assignments: AssignPermission[] = Array.isArray(res) ? res : (res?.Data || []);
        this.buildGrid(assignments);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Role permissions load failed:', err);
        this.buildGrid([]); // Fallback to empty grid
        this.isLoading = false;
      }
    });
  }

  buildGrid(assignments: AssignPermission[]) {
    this.gridData = this.permissionDefinitions.map(def => {
      const assignment = assignments.find(a => a.PermissionId === def.Id);
      return {
        PermissionId: def.Id,
        Name: def.Name,
        AssignmentId: assignment?.Id,
        CanRead: assignment?.CanRead || false,
        CanCreate: assignment?.CanCreate || false,
        CanUpdate: assignment?.CanUpdate || false,
        CanDelete: assignment?.CanDelete || false,
        IsActive: assignment?.IsActive ?? true
      };
    });
    this.originalState = JSON.stringify(this.gridData);
    this.filteredGridData = [...this.gridData];
  }

  applyFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredGridData = this.gridData.filter(d => d.Name.toLowerCase().includes(val));
  }

  savePermissions() {
    if (!this.selectedRoleId) return;

    this.isSaving = true;
    const currentAssignments = this.gridData;
    const originalAssignments = JSON.parse(this.originalState);

    const requests = [];

    for (let i = 0; i < currentAssignments.length; i++) {
      const curr = currentAssignments[i];
      const orig = originalAssignments[i];

      const isModified = JSON.stringify(curr) !== JSON.stringify(orig);
      const hasAnyPermission = curr.CanRead || curr.CanCreate || curr.CanUpdate || curr.CanDelete;
      const hadAnyPermission = orig.CanRead || orig.CanCreate || orig.CanUpdate || orig.CanDelete;

      if (!isModified) continue;

      if (hasAnyPermission) {
        const payload: AssignPermission = {
          Id: curr.AssignmentId,
          RoleId: this.selectedRoleId,
          PermissionId: curr.PermissionId,
          CanRead: curr.CanRead,
          CanCreate: curr.CanCreate,
          CanUpdate: curr.CanUpdate,
          CanDelete: curr.CanDelete,
          IsActive: true
        };

        if (curr.AssignmentId) {
          requests.push(this.permissionService.updatePermission(curr.AssignmentId, payload));
        } else {
          requests.push(this.permissionService.assignPermission(payload));
        }
      } else if (hadAnyPermission && curr.AssignmentId) {
        requests.push(this.permissionService.deletePermission(curr.AssignmentId));
      }
    }

    if (requests.length === 0) {
      this.isSaving = false;
      return;
    }

    forkJoin(requests).pipe(
      catchError(err => {
        console.error('Batch save failed:', err);
        // @ts-ignore
        Swal.fire({ title: 'Error', text: 'Some changes could not be saved.', icon: 'error' });
        return of(null);
      })
    ).subscribe(() => {
      this.isSaving = false;
      // @ts-ignore
      Swal.fire({ title: 'Saved!', text: 'Permissions updated successfully.', icon: 'success', timer: 2000, showConfirmButton: false });
      this.onRoleChange(this.selectedRoleId!); // Reload to get new IDs
    });
  }
}

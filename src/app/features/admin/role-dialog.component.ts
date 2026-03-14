import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RoleService, Role } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isViewOnly ? 'visibility' : (data.role ? 'edit' : 'person_add') }}</mat-icon> 
      {{ isViewOnly ? 'View' : (data.role ? 'Edit' : 'Add New') }} Role
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="roleForm" class="role-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role Name</mat-label>
          <input matInput formControlName="Name" placeholder="Ex: Admin, Manager, User">
          <mat-error *ngIf="roleForm.get('Name')?.hasError('required')">
            Role Name is required
          </mat-error>
        </mat-form-field>

        <div class="toggle-section" *ngIf="!isViewOnly || data.role">
          <mat-slide-toggle formControlName="IsActive" color="primary">
            Active Status
          </mat-slide-toggle>
        </div>

        <!-- Permissions Section -->
        <div class="permissions-section" *ngIf="data.role">
          <mat-divider class="section-divider"></mat-divider>
          <div class="section-header">
            <h3>Assigned Permissions</h3>
            <span class="badge">{{ assignedPermissions.length }} Assigned</span>
          </div>

          <div class="loading-permissions" *ngIf="isLoadingPermissions">
            <mat-spinner diameter="30"></mat-spinner>
            <span>Fetching role permissions...</span>
          </div>

          <div class="permissions-container" *ngIf="!isLoadingPermissions && assignedPermissions.length > 0">
            <table mat-table [dataSource]="assignedPermissions" class="permissions-table">
              <ng-container matColumnDef="PermissionName">
                <th mat-header-cell *matHeaderCellDef> Permission </th>
                <td mat-cell *matCellDef="let element"> {{element.PermissionName || 'Standard Access'}} </td>
              </ng-container>

              <ng-container matColumnDef="Rights">
                <th mat-header-cell *matHeaderCellDef> Rights </th>
                <td mat-cell *matCellDef="let element">
                  <div class="rights-badges">
                    <span class="right-badge" [class.active]="element.CanRead">R</span>
                    <span class="right-badge" [class.active]="element.CanCreate">C</span>
                    <span class="right-badge" [class.active]="element.CanUpdate">U</span>
                    <span class="right-badge" [class.active]="element.CanDelete">D</span>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['PermissionName', 'Rights']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['PermissionName', 'Rights'];"></tr>
            </table>
          </div>

          <div class="no-permissions" *ngIf="!isLoadingPermissions && assignedPermissions.length === 0">
            <mat-icon>security_update_warning</mat-icon>
            <p>No special permissions assigned to this role yet.</p>
          </div>
        </div>

        <div class="metadata-section" *ngIf="isViewOnly && data.role">
          <div class="meta-item">
            <span class="meta-label">Created At:</span>
            <span class="meta-value">{{ data.role.CreatedAt | date:'medium' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Updated At:</span>
            <span class="meta-value">{{ data.role.UpdatedAt | date:'medium' }}</span>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">{{ isViewOnly ? 'Close' : 'Cancel' }}</button>
      <button *ngIf="!isViewOnly" mat-flat-button color="primary" [disabled]="roleForm.invalid || isSubmitting" (click)="onSubmit()">
        <mat-icon *ngIf="!isSubmitting">save</mat-icon>
        <span *ngIf="!isSubmitting">{{ data.role ? 'Update' : 'Save' }} Role</span>
        <span *ngIf="isSubmitting">{{ data.role ? 'Updating...' : 'Saving...' }}</span>
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
    .role-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 440px;
      padding-top: 10px;
    }
    .full-width { width: 100%; }
    .toggle-section {
      padding: 8px 0;
    }
    
    .permissions-section {
      margin-top: 10px;
      
      .section-divider { margin: 16px 0 24px; }
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--primary-deep); }
        .badge {
          background: #f1f5f9;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
      }
    }

    .loading-permissions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      color: #94a3b8;
      font-size: 14px;
    }

    .permissions-container {
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      max-height: 250px;
      overflow-y: auto;
    }

    .permissions-table {
      width: 100%;
      background: transparent;
      th { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; background: #f1f5f9; }
      td { font-size: 13px; font-weight: 600; color: #475569; }
    }

    .rights-badges {
      display: flex;
      gap: 4px;
      .right-badge {
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 4px;
        background: #e2e8f0;
        color: #94a3b8;
        font-size: 10px;
        font-weight: 800;
        &.active { background: var(--accent-electric); color: white; }
      }
    }

    .no-permissions {
      text-align: center;
      padding: 30px 20px;
      color: #94a3b8;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
      mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; color: #cbd5e1; }
      p { margin: 0; font-size: 14px; font-weight: 500; }
    }

    .metadata-section {
      margin-top: 16px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      .meta-item {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        .meta-label { color: #94a3b8; font-weight: 600; }
        .meta-value { color: #475569; font-weight: 500; }
      }
    }
    .dialog-actions {
      padding: 20px 24px;
      button { border-radius: 10px; font-weight: 600; padding: 0 20px; }
    }
  `]
})
export class RoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  isSubmitting = false;
  isViewOnly = false;
  isLoadingPermissions = false;
  assignedPermissions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { role?: Role, mode?: 'add' | 'edit' | 'view' }
  ) {
    this.isViewOnly = this.data?.mode === 'view';
    
    this.roleForm = this.fb.group({
      Name: [{ value: this.data?.role?.Name || '', disabled: this.isViewOnly }, [Validators.required]],
      IsActive: [{ value: this.data?.role?.IsActive !== false, disabled: this.isViewOnly }],
      IsDeleted: [this.data?.role?.IsDeleted || false],
      CreatedAt: [this.data?.role?.CreatedAt || new Date().toISOString()],
      UpdatedAt: [new Date().toISOString()],
      CreatedBy: [this.data?.role?.CreatedBy || 0],
      UpdatedBy: [0],
      Id: [this.data?.role?.Id || 0]
    });
  }

  ngOnInit(): void {
    if (this.data.role?.Id) {
      this.loadAssignedPermissions();
    }
  }

  loadAssignedPermissions() {
    this.isLoadingPermissions = true;
    this.permissionService.getPermissionsByRole(this.data.role!.Id).subscribe({
      next: (response: any) => {
        if (response && (response.Data || response.data || response.items || response.value)) {
          this.assignedPermissions = response.Data || response.data || response.items || response.value;
        } else if (Array.isArray(response)) {
          this.assignedPermissions = response;
        } else {
          this.assignedPermissions = [];
        }
        this.isLoadingPermissions = false;
      },
      error: (err) => {
        console.error('Failed to load permissions for role:', err);
        this.isLoadingPermissions = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.roleForm.valid) {
      this.isSubmitting = true;
      const formValue = this.roleForm.getRawValue();

      if (this.data?.role) {
        // Update
        this.roleService.updateRole(this.data.role.Id, formValue).subscribe({
          next: () => {
            this.snackBar.open('Role updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to update role:', err);
            this.snackBar.open('Error updating role.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        // Create
        this.roleService.addRole(formValue).subscribe({
          next: () => {
            this.snackBar.open('Role added successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Failed to add role:', err);
            this.snackBar.open('Error adding role.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}

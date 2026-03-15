import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    data: { animation: 'LoginPage' }
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { animation: 'DashboardPage' }
      },
      { 
        path: 'items', 
        loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent),
        data: { animation: 'ItemsPage' }
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent),
        data: { animation: 'CategoriesPage' }
      },
      { 
        path: 'vat', 
        loadComponent: () => import('./features/vat/vat.component').then(m => m.VatComponent),
        data: { animation: 'VatPage' }
      },
      { 
        path: 'business-partners', 
        loadComponent: () => import('./features/business-partners/business-partners.component').then(m => m.BusinessPartnersComponent),
        data: { animation: 'BusinessPartnersPage' }
      },
      { 
        path: 'uom', 
        loadComponent: () => import('./features/uom/uom.component').then(m => m.UomComponent),
        data: { animation: 'UomPage' }
      },
      {
        path: 'invoices',
        children: [
          {
            path: 'ap',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/invoices/ap-invoice.component').then(m => m.ApInvoiceComponent),
                data: { animation: 'ApInvoicePage' }
              },
              {
                path: 'new',
                loadComponent: () => import('./features/invoices/ap-invoice-manage.component').then(m => m.ApInvoiceManageComponent),
                data: { animation: 'ManageInvoicePage' }
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./features/invoices/ap-invoice-manage.component').then(m => m.ApInvoiceManageComponent),
                data: { animation: 'ManageInvoicePage' }
              },
              {
                path: 'view/:id',
                loadComponent: () => import('./features/invoices/ap-invoice-manage.component').then(m => m.ApInvoiceManageComponent),
                data: { animation: 'ManageInvoicePage' }
              }
            ]
          },
          {
            path: 'ar',
            children: [
              { 
                path: '', 
                loadComponent: () => import('./features/invoices/ar-invoice.component').then(m => m.ArInvoiceComponent),
                data: { animation: 'ArInvoicePage' }
              },
              { 
                path: 'new', 
                loadComponent: () => import('./features/invoices/ar-invoice-manage.component').then(m => m.ArInvoiceManageComponent),
                data: { animation: 'ManageInvoicePage' }
              },
              { 
                path: 'edit/:id', 
                loadComponent: () => import('./features/invoices/ar-invoice-manage.component').then(m => m.ArInvoiceManageComponent),
                data: { animation: 'ManageInvoicePage' }
              },
              { 
                path: 'view/:id', 
                loadComponent: () => import('./features/invoices/ar-invoice-manage.component').then(m => m.ArInvoiceManageComponent),
                data: { animation: 'ManageInvoicePage' }
              }
            ]
          }
        ]
      },
      {
        path: 'admin',
        children: [
          {
            path: 'roles',
            loadComponent: () => import('./features/admin/role-list.component').then(m => m.RoleListComponent),
            data: { animation: 'RolesPage' }
          },
          {
            path: 'permissions',
            loadComponent: () => import('./features/admin/permission-list.component').then(m => m.PermissionListComponent),
            data: { animation: 'PermissionsPage' }
          }
        ]
      }
    ]
  }
];

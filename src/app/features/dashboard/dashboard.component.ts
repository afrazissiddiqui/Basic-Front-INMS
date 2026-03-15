import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { DashboardService } from '../../core/services/dashboard.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatRippleModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  animations: [
    trigger('staggerFade', [
      transition(':enter', [
        query('.animate-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="dashboard-container" [@staggerFade]>
      <div class="welcome-section animate-item">
        <div class="welcome-text">
          <h1>Inventory Overview</h1>
          <p class="subtitle">Monitor your stock levels and performance metrics in real-time.</p>
        </div>
        <button mat-flat-button color="primary" class="report-btn">
          <mat-icon>analytics</mat-icon>
          <span>Generate Report</span>
        </button>
      </div>

      <div class="loading-shade" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Updating metrics...</p>
      </div>

      <div class="error-shade" *ngIf="errorMessage">
        <mat-icon>cloud_off</mat-icon>
        <p>{{ errorMessage }}</p>
        <button mat-stroked-button color="primary" (click)="loadDashboardData()">Retry</button>
      </div>
      
      <div class="stats-grid" *ngIf="!isLoading && !errorMessage">
        <mat-card class="stat-card animate-item" matRipple (click)="navigateTo('/invoices/ap')">
          <div class="stat-content">
            <div class="icon-box primary">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="stat-details">
              <span class="label">AP Invoices</span>
              <h2 class="value">{{ stats?.TotalAPInvoices || 0 | number }}</h2>
              <span class="trend up"><mat-icon>trending_up</mat-icon> Active</span>
            </div>
          </div>
          <div class="card-glow"></div>
        </mat-card>

        <mat-card class="stat-card animate-item" matRipple (click)="navigateTo('/invoices/ar')">
          <div class="stat-content">
            <div class="icon-box tertiary">
              <mat-icon>description</mat-icon>
            </div>
            <div class="stat-details">
              <span class="label">AR Invoices</span>
              <h2 class="value">{{ stats?.TotalARInvoices || 0 | number }}</h2>
              <span class="trend up"><mat-icon>trending_up</mat-icon> Tracked</span>
            </div>
          </div>
          <div class="card-glow"></div>
        </mat-card>

        <mat-card class="stat-card animate-item" matRipple (click)="navigateTo('/business-partners', 'Vendor')">
          <div class="stat-content">
            <div class="icon-box warning">
              <mat-icon>storefront</mat-icon>
            </div>
            <div class="stat-details">
              <span class="label">Total Vendors</span>
              <h2 class="value">{{ stats?.TotalVendors || 0 | number }}</h2>
              <span class="trend neutral">Suppliers</span>
            </div>
          </div>
          <div class="card-glow"></div>
        </mat-card>

        <mat-card class="stat-card animate-item" matRipple (click)="navigateTo('/business-partners', 'Customer')">
          <div class="stat-content">
            <div class="icon-box success">
              <mat-icon>groups</mat-icon>
            </div>
            <div class="stat-details">
              <span class="label">Total Customers</span>
              <h2 class="value">{{ stats?.TotalCustomers || 0 | number }}</h2>
              <span class="trend up"><mat-icon>auto_graph</mat-icon> Growth</span>
            </div>
          </div>
          <div class="card-glow"></div>
        </mat-card>

        <mat-card class="stat-card animate-item" matRipple (click)="navigateTo('/items')">
          <div class="stat-content">
            <div class="icon-box info">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="stat-details">
              <span class="label">Total Items</span>
              <h2 class="value">{{ stats?.TotalItems || 0 | number }}</h2>
              <span class="trend neutral">In Stock</span>
            </div>
          </div>
          <div class="card-glow"></div>
        </mat-card>
      </div>

      <div class="charts-row" *ngIf="!isLoading && !errorMessage">
        <mat-card class="chart-card animate-item">
          <div class="chart-header">
            <div class="title-env">
              <mat-icon>show_chart</mat-icon>
              <span>Sales Trend</span>
            </div>
            <div class="chart-value">{{ totalSalesToday | currency:'PKR':'symbol':'1.0-0' }} today</div>
          </div>
          <div class="chart-container">
            <canvas baseChart [data]="salesChartData" [options]="chartOptions" type="line"></canvas>
          </div>
        </mat-card>

        <mat-card class="chart-card animate-item">
          <div class="chart-header">
            <div class="title-env">
              <mat-icon>bar_chart</mat-icon>
              <span>Revenue vs Expense</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas baseChart [data]="comparisonChartData" [options]="chartOptions" type="bar"></canvas>
          </div>
        </mat-card>

        <mat-card class="chart-card animate-item">
          <div class="chart-header">
            <div class="title-env">
              <mat-icon>trending_up</mat-icon>
              <span>Profit Progression</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas baseChart [data]="profitChartData" [options]="chartOptions" type="line"></canvas>
          </div>
        </mat-card>
      </div>

      <div class="bottom-row" *ngIf="!isLoading && !errorMessage">
        <mat-card class="info-card summary-card animate-item">
          <div class="card-header-creative">
            <mat-icon>auto_awesome</mat-icon>
            <h3>Today's Summary</h3>
          </div>
          <div class="summary-content">
            <div class="main-stat">
              <span class="label">Total Sold of the Day</span>
              <h1 class="total-value">{{ totalSalesToday | currency:'PKR' }}</h1>
            </div>
            
            <div class="items-list">
              <span class="list-label">Items Sold Today</span>
              <div class="item-chip" *ngFor="let item of itemsSoldToday">
                <span class="name">{{ item.name }}</span>
                <span class="qty">x{{ item.qty }}</span>
              </div>
              <div class="no-items" *ngIf="itemsSoldToday.length === 0">No items sold today yet.</div>
            </div>
          </div>
        </mat-card>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;

      .welcome-text {
        h1 {
          font-size: 36px;
          font-weight: 800;
          margin: 0;
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

      .report-btn {
        height: 52px;
        padding: 0 28px;
        border-radius: 16px;
        font-weight: 700;
        font-size: 15px;
        background: linear-gradient(135deg, var(--accent-electric) 0%, #4f46e5 100%);
        box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        color: white;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        mat-icon { margin-right: 10px; font-size: 22px; width: 22px; height: 22px; }
        
        &:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 25px -5px rgba(99, 102, 241, 0.5);
        }
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 28px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      border: none;
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      cursor: pointer;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(226, 232, 240, 0.6);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
        border-color: var(--accent-electric);
        .card-glow { opacity: 1; }
      }

      .card-glow {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      .stat-content {
        padding: 32px;
        display: flex;
        align-items: center;
        position: relative;
        z-index: 1;
      }

      .icon-box {
        width: 68px;
        height: 68px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24px;
        
        mat-icon { font-size: 32px; width: 32px; height: 32px; }
        
        &.primary { background: #eff6ff; color: var(--accent-electric); }
        &.tertiary { background: #f5f3ff; color: #8b5cf6; }
        &.warning { background: #fff7ed; color: #f59e0b; }
        &.success { background: #f0fdf4; color: #10b981; }
        &.info { background: #ecfeff; color: #0891b2; }
      }

      .stat-details {
        .label { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { 
          font-size: 32px; font-weight: 800; color: var(--primary-deep); margin: 4px 0; letter-spacing: -0.02em; 
          &.error { color: #ef4444; }
        }
        .trend {
          font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px;
          &.up { color: #10b981; }
          &.down { color: #ef4444; }
          &.neutral { color: #94a3b8; }
          mat-icon { font-size: 16px; width: 16px; height: 16px; }
        }
      }
    }

    .secondary-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 28px;
    }

    .info-card {
      border-radius: 28px;
      padding: 32px;
      border: 1px solid rgba(226, 232, 240, 0.6);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

      .card-header-creative {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        
        mat-icon { color: var(--accent-electric); font-size: 24px; }
        h3 { margin: 0; font-weight: 800; color: var(--primary-deep); font-size: 20px; }
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .activity-item {
      display: flex;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f5f9;
      &:last-child { border: none; padding: 0; }

      .activity-dot {
        width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0;
        &.primary { background: var(--accent-electric); box-shadow: 0 0 8px var(--accent-electric); }
        &.success { background: #10b981; box-shadow: 0 0 8px #10b981; }
        &.warning { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
      }

      .activity-info {
        display: flex;
        flex-direction: column;
        .text { color: #475569; font-size: 15px; line-height: 1.5; }
        .time { color: #94a3b8; font-size: 12px; font-weight: 600; margin-top: 4px; }
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .action-btn {
        height: 52px;
        border-radius: 14px;
        font-weight: 700;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 20px;
        transition: all 0.3s ease;
        
        mat-icon { margin-right: 12px; font-size: 20px; }
        
        &.primary { background: #eff6ff; color: var(--accent-electric); &:hover { background: var(--accent-electric); color: white; } }
        &.accent { background: #f5f3ff; color: #8b5cf6; &:hover { background: #8b5cf6; color: white; } }
        &.outline { background: white; color: #64748b; border: 1.5px solid #e2e8f0; &:hover { border-color: #64748b; background: #f8fafc; } }
        
        &:hover { transform: translateX(8px); }
      }
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 28px;
        margin-bottom: 40px;
    }

    .chart-card {
      border-radius: 28px;
        padding: 24px;
        border: 1px solid rgba(226, 232, 240, 0.6);
        background: rgba(255, 255, 255, 0.9);
        height: 280px;

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .title-env {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--primary-deep);
                font-weight: 700;
                mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--accent-electric); }
            }
            .chart-value { font-size: 13px; font-weight: 800; color: var(--accent-electric); }
        }

        .chart-container { height: 180px; position: relative; }
    }

    .bottom-row { margin-bottom: 40px; }

    .summary-card {
        .main-stat {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 24px;
            border-radius: 20px;
            margin-bottom: 24px;
            .label { font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .total-value { font-size: 42px; font-weight: 800; color: var(--primary-deep); margin: 8px 0 0; }
        }

        .items-list {
            .list-label { font-size: 14px; font-weight: 700; color: var(--primary-deep); margin-bottom: 16px; display: block; }
            .item-chip {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 8px 16px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                margin-right: 12px;
                margin-bottom: 12px;
                .name { font-weight: 700; color: #475569; }
                .qty { background: var(--accent-electric); color: white; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 800; }
            }
            .no-items { color: #94a3b8; font-style: italic; }
        }
    }

    .loading-shade, .error-shade {
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: #94a3b8;
      font-weight: 600;
      
      p { margin: 0; }
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; }
    }

    .trend.success { color: #10b981; }

    @media (max-width: 992px) {
      .secondary-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  navigateTo(path: string, type?: string) {
    if (type) {
      this.router.navigate([path], { queryParams: { type } });
    } else {
      this.router.navigate([path]);
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    forkJoin({
      stats: this.dashboardService.getDashboardStats(),
      sales: this.dashboardService.getARInvoices(),
      purchases: this.dashboardService.getAPInvoices()
    }).pipe(
      catchError(err => {
        console.error('API Error:', err);
        this.errorMessage = 'Failed to load dashboard data. Check server connectivity.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.stats = res.stats.Data || res.stats;
        this.processAnalyticsData(res.sales.Data || res.sales, res.purchases.Data || res.purchases);
        this.isLoading = false;
      }
    });
  }

  processAnalyticsData(sales: any[], purchases: any[]) {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Today's Summary
    const salesToday = sales.filter(s => s.InvoiceDate.startsWith(today));
    this.totalSalesToday = salesToday.reduce((sum, s) => sum + s.TotalAmount, 0);
    
    const itemsMap = new Map();
    salesToday.forEach(s => {
      s.Lines?.forEach((l: any) => {
        const count = itemsMap.get(l.ItemName) || 0;
        itemsMap.set(l.ItemName, count + l.Quantity);
      });
    });
    this.itemsSoldToday = Array.from(itemsMap.entries()).map(([name, qty]) => ({ name, qty }));

    // 2. Weekly Trend Data (Last 7 days)
    const labels = [];
    const salesData = [];
    const purchaseData = [];
    const profitData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(label);

      const dSales = sales.filter(s => s.InvoiceDate.startsWith(dateStr)).reduce((sum, s) => sum + s.TotalAmount, 0);
      const dPurchases = purchases.filter(p => p.InvoiceDate.startsWith(dateStr)).reduce((sum, p) => sum + p.TotalAmount, 0);
      
      salesData.push(dSales);
      purchaseData.push(dPurchases);
      profitData.push(dSales - dPurchases);
    }

    this.salesChartData = {
      labels,
      datasets: [
        { 
          data: salesData, 
          label: 'Daily Sales', 
          borderColor: '#6366f1', 
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    this.comparisonChartData = {
      labels,
      datasets: [
        { data: salesData, label: 'Revenue', backgroundColor: '#8b5cf6', borderRadius: 8 },
        { data: purchaseData, label: 'Expenses', backgroundColor: '#f59e0b', borderRadius: 8 }
      ]
    };

    this.profitChartData = {
      labels,
      datasets: [
        { 
          data: profitData, 
          label: 'Net Profit', 
          borderColor: '#10b981', 
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4 
        }
      ]
    };
  }

  // Chart properties
  public salesChartData: any;
  public comparisonChartData: any;
  public profitChartData: any;
  public chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { display: false }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  totalSalesToday = 0;
  itemsSoldToday: any[] = [];
}

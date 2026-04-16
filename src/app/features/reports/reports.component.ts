import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ReportService } from '../../core/services/report.service';
import { MonthlySummary, ReportRecord } from '../../core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  loading = false;
  summary: MonthlySummary | null = null;
  reports: ReportRecord[] = [];
  trendData: { label: string; income: number; expense: number }[] = [];
  userId!: number;
  currency!: string;

  selectedMonth: number;
  selectedYear: number;
  generating = false;
  genSuccess = '';

  years: number[] = [];
  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  constructor(
    private auth: AuthService,
    private reportService: ReportService,
  ) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) this.years.push(y);
  }

  ngOnInit(): void {
    this.userId = this.auth.currentUser!.userId;
    this.currency = this.auth.currentUser!.currency;
    this.loadSummary();
    this.loadTrend();
    this.loadReports();
  }

  loadSummary(): void {
    this.loading = true;
    this.reportService
      .getMonthlySummary(this.userId, this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (s) => {
          this.summary = s;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  loadTrend(): void {
    this.reportService.getTrendAnalysis(this.userId, 6).subscribe({
      next: (data) => {
        this.trendData = Object.entries(data).map(([label, value]) => ({
          label,
          income: 0,
          expense: value as number,
        }));
      },
      error: () => {},
    });
  }

  loadReports(): void {
    this.reportService.getUserReports(this.userId).subscribe({
      next: (r) => {
        this.reports = r;
      },
      error: () => {},
    });
  }

  generatePdf(): void {
    this.generating = true;
    this.genSuccess = '';
    this.reportService
      .generatePdf({
        userId: this.userId,
        reportType: 'MONTHLY',
        month: this.selectedMonth,
        year: this.selectedYear,
      })
      .subscribe({
        next: (res) => {
          this.genSuccess = 'Report generated! ';
          this.generating = false;
          this.loadReports();
          if (res.downloadUrl) window.open(res.downloadUrl, '_blank');
        },
        error: () => {
          this.generating = false;
        },
      });
  }

  getBarHeight(value: number): number {
    const max = Math.max(...this.trendData.map((t) => t.expense), 1);
    return (value / max) * 100;
  }
}

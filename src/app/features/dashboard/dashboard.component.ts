import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { BudgetService } from '../../core/services/budget.service';
import { ReportService } from '../../core/services/report.service';
import { ExpenseEntry } from '../../core/models/expense.model';
import { BudgetPlan } from '../../core/models/budget.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  userId!: number;
  currency = 'INR';

  totalIncome = 0;
  totalExpenses = 0;
  netSavings = 0;
  savingsRate = 0;

  recentExpenses: ExpenseEntry[] = [];
  budgets: BudgetPlan[] = [];
  overBudget: BudgetPlan[] = [];

  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private budgetService: BudgetService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser!;
    this.userId = user.userId;
    this.currency = user.currency;
    this.loadData();
  }

  loadData(): void {
    const now = new Date();
    forkJoin({
      expenses: this.expenseService.getByUser(this.userId),
      income: this.incomeService.getTotal(this.userId),
      budgets: this.budgetService.getByUser(this.userId),
      overBudget: this.budgetService.getAlerts(this.userId),
      monthly: this.reportService.getMonthlySummary(this.userId, now.getMonth() + 1, now.getFullYear()),
    }).subscribe({
      next: data => {
        this.recentExpenses = data.expenses.slice(0, 5);
        this.totalIncome = data.income;
        this.budgets = data.budgets.slice(0, 4);
        this.overBudget = data.overBudget;
        this.totalExpenses = data.monthly.totalExpenses;
        this.netSavings = data.monthly.netSavings;
        this.savingsRate = data.monthly.savingsRate;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getUtilColor(pct: number): string {
    if (pct >= 100) return 'danger';
    if (pct >= 80) return 'warning';
    return 'safe';
  }
}
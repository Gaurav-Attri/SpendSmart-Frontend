import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';
import { BudgetPlan } from '../../core/models/budget.model';
import { CategoryItem } from '../../core/models/category.model';
import { ExpenseEntry } from '../../core/models/expense.model';

@Component({
  selector: 'app-budgets',
  standalone: false,
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss'],
})
export class BudgetsComponent implements OnInit {
  budgets: BudgetPlan[] = [];
  categories: CategoryItem[] = [];
  loading = true;
  showModal = false;
  editId: number | null = null;
  submitting = false;
  error = '';
  userId!: number;
  currency!: string;
  form!: FormGroup;

  periods = ['MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUser!.userId;
    this.currency = this.auth.currentUser!.currency;
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: [null],
      limitAmount: [null, [Validators.required, Validators.min(0.01)]],
      currency: [this.currency],
      period: ['MONTHLY', Validators.required],
      startDate: [start, Validators.required],
      endDate: [end, Validators.required],
    });
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      categories: this.categoryService.getAllForUser(this.userId),
      budgets: this.budgetService.getByUser(this.userId),
      expenses: this.expenseService.getByUser(this.userId),
    }).subscribe({
      next: ({ categories, budgets, expenses }) => {
        this.categories = categories.filter((category) => category.isActive);
        this.budgets = budgets.map((budget) => this.hydrateBudget(budget, expenses));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAdd(): void {
    this.editId = null;
    this.initForm();
    this.error = '';
    this.showModal = true;
  }

  openEdit(b: BudgetPlan): void {
    this.editId = b.budgetPlanId;
    this.form.patchValue({
      name: b.name,
      categoryId: b.categoryId,
      limitAmount: b.limitAmount,
      currency: b.currency,
      period: b.period,
      startDate: b.startDate.split('T')[0],
      endDate: b.endDate.split('T')[0],
    });
    this.error = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.submitting = false;
    this.cdr.detectChanges();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.error = '';
    const val = {
      ...this.form.value,
      userId: this.userId,
      startDate: new Date(this.form.value.startDate).toISOString(),
      endDate: new Date(this.form.value.endDate).toISOString(),
    };
    const request$ = this.editId
      ? this.budgetService.update(this.editId, val)
      : this.budgetService.create(val);

    request$
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          this.error = this.getErrorMessage(err);
        },
      });
  }

  delete(id: number): void {
    if (!confirm('Delete this budget?')) return;
    this.budgetService.delete(id).subscribe({
      next: () => {
        this.budgets = this.budgets.filter((budget) => budget.budgetPlanId !== id);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = this.getErrorMessage(err);
        this.cdr.detectChanges();
      },
    });
  }

  getUtilColor(pct: number): string {
    if (pct >= 100) return 'danger';
    if (pct >= 80) return 'warning';
    return 'safe';
  }

  private hydrateBudget(budget: BudgetPlan, expenses: ExpenseEntry[]): BudgetPlan {
    const start = new Date(budget.startDate).getTime();
    const end = new Date(budget.endDate).getTime();
    const spentAmount = expenses
      .filter((expense) => {
        const expenseTime = new Date(expense.date).getTime();
        const matchesCategory = budget.categoryId ? expense.categoryId === budget.categoryId : true;
        return matchesCategory && expenseTime >= start && expenseTime <= end;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const remainingAmount = budget.limitAmount - spentAmount;
    const utilizationPercentage = budget.limitAmount > 0
      ? (spentAmount / budget.limitAmount) * 100
      : 0;

    return {
      ...budget,
      spentAmount,
      remainingAmount,
      utilizationPercentage,
    };
  }

  private getErrorMessage(err: any): string {
    const apiError = err?.error;
    if (typeof apiError === 'string' && apiError.trim()) {
      return apiError;
    }
    return apiError?.error || apiError?.detail || apiError?.title || 'An error occurred';
  }

  get f() {
    return this.form.controls;
  }
}

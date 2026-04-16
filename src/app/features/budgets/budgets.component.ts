import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { BudgetPlan } from '../../core/models/budget.model';
import { CategoryItem } from '../../core/models/category.model';

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
    this.categoryService.getAllForUser(this.userId).subscribe((c) => {
      this.categories = c.filter((x) => x.isActive);
    });
    this.budgetService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.budgets = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = {
      ...this.form.value,
      userId: this.userId,
      startDate: new Date(this.form.value.startDate).toISOString(),
      endDate: new Date(this.form.value.endDate).toISOString(),
    };
    const obs = this.editId
      ? this.budgetService.update(this.editId, val)
      : this.budgetService.create(val);
    if (this.editId) {
      this.budgetService.update(this.editId, val).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          this.submitting = false;
        },
        error: (err: any) => {
          this.error = err.error?.error || 'An error occurred';
          this.submitting = false;
        },
      });
    } else {
      this.budgetService.create(val).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          this.submitting = false;
        },
        error: (err: any) => {
          this.error = err.error?.error || 'An error occurred';
          this.submitting = false;
        },
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Delete this budget?')) return;
    this.budgetService.delete(id).subscribe(() => this.loadData());
  }

  getUtilColor(pct: number): string {
    if (pct >= 100) return 'danger';
    if (pct >= 80) return 'warning';
    return 'safe';
  }

  get f() {
    return this.form.controls;
  }
}

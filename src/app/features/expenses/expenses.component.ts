import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseEntry } from '../../core/models/expense.model';
import { CategoryItem } from '../../core/models/category.model';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent implements OnInit {
  expenses: ExpenseEntry[] = [];
  filtered: ExpenseEntry[] = [];
  categories: CategoryItem[] = [];
  loading = true;
  showModal = false;
  editId: number | null = null;
  submitting = false;
  error = '';
  searchQ = '';
  userId!: number;
  currency!: string;

  form!: FormGroup;

  paymentModes = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUser!.userId;
    this.currency = this.auth.currentUser!.currency;
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: [this.currency],
      description: ['', Validators.maxLength(500)],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      paymentMode: ['CASH', Validators.required],
      tags: [''],
      isRecurring: [false],
    });
  }

  loadData(): void {
    this.categoryService.getAllForUser(this.userId).subscribe((cats) => {
      this.categories = cats.filter((c) => c.isActive && c.type === 'EXPENSE');
    });
    this.expenseService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.expenses = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        this.filtered = [...this.expenses];
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

  openEdit(e: ExpenseEntry): void {
    this.editId = e.expenseEntryId;
    this.form.patchValue({
      categoryId: e.categoryId,
      amount: e.amount,
      currency: e.currency,
      description: e.description,
      date: e.date.split('T')[0],
      paymentMode: e.paymentMode,
      tags: e.tags,
      isRecurring: e.isRecurring,
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
    this.error = '';
    const val = {
      ...this.form.value,
      userId: this.userId,
      date: new Date(this.form.value.date).toISOString(),
    };
    if (this.editId) {
      this.expenseService.update(this.editId, val).subscribe({
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
      this.expenseService.create(val).subscribe({
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
    if (!confirm('Delete this expense?')) return;
    this.expenseService.delete(id).subscribe(() => this.loadData());
  }

  search(): void {
    const q = this.searchQ.toLowerCase().trim();
    this.filtered = q
      ? this.expenses.filter(
          (e) => e.description?.toLowerCase().includes(q) || e.tags?.toLowerCase().includes(q),
        )
      : [...this.expenses];
  }

  getCategoryName(id: number): string {
    return this.categories.find((c) => c.categoryItemId === id)?.name || '—';
  }

  getCategoryIcon(id: number): string {
    return this.categories.find((c) => c.categoryItemId === id)?.icon || '📁';
  }

  get f() {
    return this.form.controls;
  }
}

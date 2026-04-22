import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
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
    private cdr: ChangeDetectorRef,
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
      this.cdr.detectChanges();
    });
    this.expenseService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.expenses = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        this.filtered = [...this.expenses];
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
      date: new Date(this.form.value.date).toISOString(),
    };
    const request$ = this.editId
      ? this.expenseService.update(this.editId, val)
      : this.expenseService.create(val);

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
    if (!confirm('Delete this expense?')) return;
    this.expenseService.delete(id).subscribe({
      next: () => {
        this.expenses = this.expenses.filter((expense) => expense.expenseEntryId !== id);
        this.search();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = this.getErrorMessage(err);
        this.cdr.detectChanges();
      },
    });
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

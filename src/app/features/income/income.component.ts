import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { IncomeService } from '../../core/services/income.service';
import { IncomeRecord } from '../../core/models/income.model';

@Component({
  selector: 'app-income',
  standalone: false,
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
})
export class IncomeComponent implements OnInit {
  records: IncomeRecord[] = [];
  loading = true;
  showModal = false;
  editId: number | null = null;
  submitting = false;
  error = '';
  totalIncome = 0;
  userId!: number;
  currency!: string;
  form!: FormGroup;

  sources = ['SALARY', 'FREELANCE', 'INVESTMENT', 'RENTAL', 'OTHER'];
  recurrenceTypes = ['MONTHLY', 'WEEKLY', 'YEARLY'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private incomeService: IncomeService,
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
      source: ['OTHER', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: [this.currency],
      description: [''],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      isRecurring: [false],
      recurrenceType: [null],
    });
  }

  loadData(): void {
    this.incomeService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.records = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.totalIncome = data.reduce((s, r) => s + r.amount, 0);
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

  openEdit(r: IncomeRecord): void {
    this.editId = r.incomeRecordId;
    this.form.patchValue({ ...r, date: r.date.split('T')[0] });
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
      ? this.incomeService.update(this.editId, val)
      : this.incomeService.create(val);

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
    if (!confirm('Delete this income record?')) return;
    this.incomeService.delete(id).subscribe({
      next: () => {
        this.records = this.records.filter((record) => record.incomeRecordId !== id);
        this.totalIncome = this.records.reduce((sum, record) => sum + record.amount, 0);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = this.getErrorMessage(err);
        this.cdr.detectChanges();
      },
    });
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

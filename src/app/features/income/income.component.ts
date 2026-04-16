import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  openEdit(r: IncomeRecord): void {
    this.editId = r.incomeRecordId;
    this.form.patchValue({ ...r, date: r.date.split('T')[0] });
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
      date: new Date(this.form.value.date).toISOString(),
    };
    if (this.editId) {
      this.incomeService.update(this.editId, val).subscribe({
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
      this.incomeService.create(val).subscribe({
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
    if (!confirm('Delete this income record?')) return;
    this.incomeService.delete(id).subscribe(() => this.loadData());
  }

  get f() {
    return this.form.controls;
  }
}

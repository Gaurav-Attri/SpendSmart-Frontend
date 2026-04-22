import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { CategoryItem } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: CategoryItem[] = [];
  loading = true;
  showModal = false;
  submitting = false;
  error = '';
  userId!: number;
  form!: FormGroup;

  icons = ['🏠','🚗','🍔','🎮','💊','📚','✈️','🛍️','💼','🎵','⚽','💇','🐾','🎁','💻','📱','🔧','🌿'];
  colors = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#6366f1','#10b981'];
  types = ['EXPENSE', 'INCOME'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUser!.userId;
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: ['📁'],
      color: ['#6366f1', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      type: ['EXPENSE'],
      isDefault: [false]
    });
  }

  loadData(): void {
    this.loading = true;
    this.categoryService.getAllForUser(this.userId).subscribe({
      next: data => {
        this.categories = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error = '';
    const duplicateInactive = this.findInactiveDuplicate();
    if (duplicateInactive) {
      this.error = 'This category already exists in inactive state. Restore it instead of creating it again.';
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.categoryService.create({ ...this.form.value, userId: this.userId })
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showModal = false;
          this.loadData();
        },
        error: err => {
          this.error = this.getErrorMessage(err);
        }
      });
  }

  deactivate(id: number): void {
    if (!confirm('Deactivate this category?')) return;
    this.categoryService.deactivate(id).subscribe({
      next: () => this.loadData(),
      error: err => {
        this.error = this.getErrorMessage(err);
        this.cdr.detectChanges();
      }
    });
  }

  restore(category: CategoryItem): void {
    this.error = '';
    this.categoryService.deactivate(category.categoryItemId).subscribe({
      next: () => {
        this.categoryService.getAllForUser(this.userId).subscribe({
          next: (categories) => {
            this.categories = categories;
            const updated = categories.find(item => item.categoryItemId === category.categoryItemId);
            if (!updated?.isActive) {
              this.error = 'This category is inactive on the server and could not be restored automatically.';
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'The category restore request completed, but the refreshed list could not be loaded.';
            this.cdr.detectChanges();
          }
        });
      },
      error: err => {
        this.error = this.getErrorMessage(err);
        this.cdr.detectChanges();
      }
    });
  }

  get expenseCategories() { return this.categories.filter(c => c.type === 'EXPENSE'); }
  get incomeCategories() { return this.categories.filter(c => c.type === 'INCOME'); }
  private findInactiveDuplicate(): CategoryItem | undefined {
    const name = this.form.value.name?.trim().toLowerCase();
    const type = this.form.value.type;
    if (!name || !type) return undefined;
    return this.categories.find(category =>
      !category.isActive &&
      category.type === type &&
      category.name.trim().toLowerCase() === name,
    );
  }

  private getErrorMessage(err: any): string {
    const apiError = err?.error;
    if (typeof apiError === 'string' && apiError.trim()) return apiError;
    return apiError?.error || apiError?.detail || apiError?.title || 'An error occurred';
  }

  get f() { return this.form.controls; }
}

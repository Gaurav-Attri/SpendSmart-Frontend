import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private auth: AuthService, private categoryService: CategoryService) {}

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
    this.categoryService.getAllForUser(this.userId).subscribe({
      next: data => { this.categories = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.categoryService.create({ ...this.form.value, userId: this.userId }).subscribe({
      next: () => { this.showModal = false; this.loadData(); this.submitting = false; },
      error: err => { this.error = err.error?.error || 'An error occurred'; this.submitting = false; }
    });
  }

  deactivate(id: number): void {
    if (!confirm('Deactivate this category?')) return;
    this.categoryService.deactivate(id).subscribe(() => this.loadData());
  }

  get expenseCategories() { return this.categories.filter(c => c.type === 'EXPENSE'); }
  get incomeCategories() { return this.categories.filter(c => c.type === 'INCOME'); }
  get f() { return this.form.controls; }
}
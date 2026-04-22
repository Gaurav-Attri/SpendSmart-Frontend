import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BudgetPlan, CreateBudgetDto } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly base = `${environment.apis.budget}/api/budgets`;
  constructor(private http: HttpClient) {}

  create(dto: CreateBudgetDto): Observable<void> {
    return this.http.post(this.base, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  getById(id: number): Observable<BudgetPlan> {
    return this.http.get<BudgetPlan>(`${this.base}/${id}`);
  }

  getByUser(userId: number): Observable<BudgetPlan[]> {
    return this.http.get<BudgetPlan[]>(`${this.base}/user/${userId}`);
  }

  getUtilization(budgetId: number): Observable<{ budgetId: number; utilizationPercentage: number }> {
    return this.http.get<any>(`${this.base}/utilization/${budgetId}`);
  }

  getAlerts(userId: number): Observable<BudgetPlan[]> {
    return this.http.get<BudgetPlan[]>(`${this.base}/alerts/${userId}`);
  }

  update(id: number, dto: CreateBudgetDto): Observable<void> {
    return this.http.put(`${this.base}/${id}`, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' }).pipe(map(() => void 0));
  }
}

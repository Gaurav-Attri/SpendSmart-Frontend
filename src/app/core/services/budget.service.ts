import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BudgetPlan, CreateBudgetDto } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly base = `${environment.apis.budget}/api/budgets`;
  constructor(private http: HttpClient) {}

  create(dto: CreateBudgetDto): Observable<BudgetPlan> {
    return this.http.post<BudgetPlan>(this.base, dto);
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
    return this.http.put<void>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
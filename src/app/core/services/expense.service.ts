import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExpenseEntry, CreateExpenseDto, UpdateExpenseDto } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly base = `${environment.apis.expense}/api/expenses`;
  constructor(private http: HttpClient) {}

  create(dto: CreateExpenseDto): Observable<void> {
    return this.http.post(this.base, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  getById(id: number): Observable<ExpenseEntry> {
    return this.http.get<ExpenseEntry>(`${this.base}/${id}`);
  }

  getByUser(userId: number): Observable<ExpenseEntry[]> {
    return this.http.get<ExpenseEntry[]>(`${this.base}/user/${userId}`);
  }

  filter(userId: number, start: string, end: string): Observable<ExpenseEntry[]> {
    const params = new HttpParams().set('userId', userId).set('start', start).set('end', end);
    return this.http.get<ExpenseEntry[]>(`${this.base}/filter`, { params });
  }

  getByCategory(userId: number, categoryId: number): Observable<ExpenseEntry[]> {
    return this.http.get<ExpenseEntry[]>(`${this.base}/category/${userId}/${categoryId}`);
  }

  search(userId: number, q: string): Observable<ExpenseEntry[]> {
    const params = new HttpParams().set('userId', userId).set('q', q);
    return this.http.get<ExpenseEntry[]>(`${this.base}/search`, { params });
  }

  getRecurring(userId: number): Observable<ExpenseEntry[]> {
    return this.http.get<ExpenseEntry[]>(`${this.base}/recurring/${userId}`);
  }

  getTotal(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/total/${userId}`);
  }

  getTotalByDateRange(userId: number, start: string, end: string): Observable<number> {
    const params = new HttpParams().set('userId', userId).set('start', start).set('end', end);
    return this.http.get<number>(`${this.base}/total-by-date`, { params });
  }

  update(id: number, dto: UpdateExpenseDto): Observable<void> {
    return this.http.put(`${this.base}/${id}`, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' }).pipe(map(() => void 0));
  }
}

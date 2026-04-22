import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IncomeRecord, CreateIncomeDto, UpdateIncomeDto } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly base = `${environment.apis.income}/api/incomes`;
  constructor(private http: HttpClient) {}

  create(dto: CreateIncomeDto): Observable<void> {
    return this.http.post(this.base, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  getById(id: number): Observable<IncomeRecord> {
    return this.http.get<IncomeRecord>(`${this.base}/${id}`);
  }

  getByUser(userId: number): Observable<IncomeRecord[]> {
    return this.http.get<IncomeRecord[]>(`${this.base}/user/${userId}`);
  }

  filter(userId: number, start: string, end: string): Observable<IncomeRecord[]> {
    const params = new HttpParams().set('userId', userId).set('start', start).set('end', end);
    return this.http.get<IncomeRecord[]>(`${this.base}/filter`, { params });
  }

  getNetBalance(userId: number): Observable<{ userId: number; netBalance: number }> {
    return this.http.get<any>(`${this.base}/net-balance/${userId}`);
  }

  getTotal(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/total/${userId}`);
  }

  getRecurring(userId: number): Observable<IncomeRecord[]> {
    return this.http.get<IncomeRecord[]>(`${this.base}/recurring/${userId}`);
  }

  update(id: number, dto: UpdateIncomeDto): Observable<void> {
    return this.http.put(`${this.base}/${id}`, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' }).pipe(map(() => void 0));
  }
}

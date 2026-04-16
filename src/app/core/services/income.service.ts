import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IncomeRecord, CreateIncomeDto, UpdateIncomeDto } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly base = `${environment.apis.income}/api/incomes`;
  constructor(private http: HttpClient) {}

  create(dto: CreateIncomeDto): Observable<IncomeRecord> {
    return this.http.post<IncomeRecord>(this.base, dto);
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
    return this.http.put<void>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
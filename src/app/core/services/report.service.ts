import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonthlySummary, ReportRecord, GenerateReportDto } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly base = `${environment.apis.report}/api/reports`;
  constructor(private http: HttpClient) {}

  getMonthlySummary(userId: number, month: number, year: number): Observable<MonthlySummary> {
    return this.http.get<MonthlySummary>(`${this.base}/monthly/${userId}/${month}/${year}`);
  }

  getCategoryBreakdown(userId: number, start: string, end: string): Observable<any[]> {
    const params = new HttpParams().set('userId', userId).set('start', start).set('end', end);
    return this.http.get<any[]>(`${this.base}/category-breakdown`, { params });
  }

  getTrendAnalysis(userId: number, months: number): Observable<{ [key: string]: number }> {
    return this.http.get<any>(`${this.base}/trend/${userId}/${months}`);
  }

  getSavingsRate(userId: number, month: number, year: number): Observable<any> {
    return this.http.get<any>(`${this.base}/savings-rate/${userId}/${month}/${year}`);
  }

  generatePdf(dto: GenerateReportDto): Observable<{ downloadUrl: string; message: string }> {
    return this.http.post<any>(`${this.base}/pdf`, dto);
  }

  getUserReports(userId: number): Observable<ReportRecord[]> {
    return this.http.get<ReportRecord[]>(`${this.base}/user/${userId}`);
  }
}
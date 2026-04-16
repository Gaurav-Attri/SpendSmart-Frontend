import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apis.auth}/api/admin`;
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  deactivateUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/deactivate/${userId}`);
  }
}
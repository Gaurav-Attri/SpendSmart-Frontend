import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationRecord, CreateNotificationDto } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = `${environment.apis.notification}/api/notifications`;
  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number, page = 1, pageSize = 20): Observable<NotificationRecord[]> {
    return this.http.get<NotificationRecord[]>(`${this.base}/user/${userId}?page=${page}&pageSize=${pageSize}`);
  }

  getUnreadCount(userId: number): Observable<{ userId: number; unreadCount: number }> {
    return this.http.get<any>(`${this.base}/unread-count/${userId}`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/read`, {});
  }

  markAllRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.base}/mark-all-read/${userId}`, {});
  }

  broadcast(title: string, message: string): Observable<any> {
    return this.http.post(`${this.base}/broadcast`, { title, message });
  }
}
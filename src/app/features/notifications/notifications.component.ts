import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationRecord } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationRecord[] = [];
  loading = true;
  userId!: number;

  constructor(private auth: AuthService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUser!.userId;
    this.load();
  }

  load(): void {
    this.notificationService.getUserNotifications(this.userId).subscribe({
      next: data => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  markRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => this.load());
  }

  markAllRead(): void {
    this.notificationService.markAllRead(this.userId).subscribe(() => this.load());
  }

  get unreadCount(): number { return this.notifications.filter(n => !n.isRead).length; }
}
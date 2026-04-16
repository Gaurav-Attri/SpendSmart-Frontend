import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  user: User | null = null;
  unreadCount = 0;
  isCollapsed = false;

  navItems = [
    { label: 'Dashboard',      icon: '📊', route: '/dashboard' },
    { label: 'Expenses',       icon: '💸', route: '/expenses' },
    { label: 'Income',         icon: '💰', route: '/income' },
    { label: 'Budgets',        icon: '🎯', route: '/budgets' },
    { label: 'Categories',     icon: '🏷️',  route: '/categories' },
    { label: 'Reports',        icon: '📈', route: '/reports' },
    { label: 'Notifications',  icon: '🔔', route: '/notifications' },
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.loadUnread(u.userId);
    });
  }

  loadUnread(userId: number): void {
    this.notificationService.getUnreadCount(userId).subscribe(r => this.unreadCount = r.unreadCount);
  }

  logout(): void { this.auth.logout(); }

  toggleCollapse(): void { this.isCollapsed = !this.isCollapsed; }
}
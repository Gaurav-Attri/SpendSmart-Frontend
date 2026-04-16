import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  loading = true;
  broadcastForm!: FormGroup;
  broadcasting = false;
  broadcastSuccess = '';
  filter = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.broadcastForm = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required]
    });
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  deactivate(userId: number): void {
    if (!confirm('Deactivate this user account?')) return;
    this.adminService.deactivateUser(userId).subscribe(() => this.loadUsers());
  }

  sendBroadcast(): void {
    if (this.broadcastForm.invalid) return;
    this.broadcasting = true;
    const { title, message } = this.broadcastForm.value;
    this.notificationService.broadcast(title, message).subscribe({
      next: () => {
        this.broadcasting = false;
        this.broadcastSuccess = 'Broadcast sent to all users!';
        this.broadcastForm.reset();
        setTimeout(() => this.broadcastSuccess = '', 3000);
      },
      error: () => { this.broadcasting = false; }
    });
  }

  get filteredUsers() {
    const q = this.filter.toLowerCase();
    return q ? this.users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.users;
  }

  get activeCount() { return this.users.filter(u => u.isActive).length; }
}
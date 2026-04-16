export interface NotificationRecord {
  notificationRecordId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  type: string;
}
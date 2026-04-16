export interface User {
  userId: number;
  fullName: string;
  email: string;
  currency: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  isGoogleUser: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  currency: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  fullName: string;
  avatarUrl?: string;
}
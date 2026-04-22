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

export interface GoogleAuthUrlResponse {
  url: string;
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
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  fullName: string;
  avatarUrl?: string;
}

export interface GoogleLoginDto {
  idToken: string;
  accessToken?: string | null;
}

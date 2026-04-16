export interface IncomeRecord {
  incomeRecordId: number;
  userId: number;
  source: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurrenceType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateIncomeDto {
  userId: number;
  source: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurrenceType?: string;
}

export interface UpdateIncomeDto {
  source?: string;
  amount?: number;
  currency?: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  recurrenceType?: string;
}
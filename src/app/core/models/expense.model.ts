export interface ExpenseEntry {
  expenseEntryId: number;
  userId: number;
  categoryId: number;
  amount: number;
  currency: string;
  description: string;
  date: string;
  paymentMode: string;
  receiptUrl?: string;
  tags?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExpenseDto {
  userId: number;
  categoryId: number;
  amount: number;
  currency: string;
  description: string;
  date: string;
  paymentMode: string;
  tags?: string;
  isRecurring: boolean;
}

export interface UpdateExpenseDto {
  categoryId?: number;
  amount?: number;
  currency?: string;
  description?: string;
  date?: string;
  paymentMode?: string;
  tags?: string;
  isRecurring?: boolean;
}
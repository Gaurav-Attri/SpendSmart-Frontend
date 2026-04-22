export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  topCategory?: string | null;
  categoryBreakdown?: Record<string, number> | null;
}

export interface MonthlySummaryResponse {
  totalIncome?: number;
  totalExpense?: number;
  totalExpenses?: number;
  netBalance?: number;
  netSavings?: number;
  savingsRate?: number;
  topCategory?: string | null;
  categoryBreakdown?: Record<string, number> | null;
}

export interface ReportRecord {
  reportRecordId: number;
  userId: number;
  reportType: string;
  title: string;
  generatedAt: string;
  filePath?: string;
  status: string;
}

export interface GenerateReportDto {
  userId: number;
  reportType: string;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
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
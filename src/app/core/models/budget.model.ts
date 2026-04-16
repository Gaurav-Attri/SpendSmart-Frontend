export interface BudgetPlan {
  budgetPlanId: number;
  userId: number;
  categoryId?: number;
  name: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  currency: string;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateBudgetDto {
  userId: number;
  categoryId?: number;
  name: string;
  limitAmount: number;
  currency: string;
  period: string;
  startDate: string;
  endDate: string;
}
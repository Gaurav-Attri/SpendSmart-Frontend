export interface CategoryItem {
  categoryItemId: number;
  userId?: number;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCategoryDto {
  userId?: number;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
}
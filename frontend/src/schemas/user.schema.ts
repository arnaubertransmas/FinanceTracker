export type UserRole = "USER" | "ADMIN";

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  _count: {
    transactions: number;
    categories: number;
    budgets: number;
  };
}

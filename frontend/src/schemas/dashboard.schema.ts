export interface DashboardSummary {
  month: number | null;
  year: number | null;
  income: string;
  expense: string;
  investment: string;
  cleanMoney: string;
  savingsPercent: string;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  nombre: string;
  color: string;
  total: string;
  percent: string;
}

export interface HistoryPoint {
  date: string;
  wealth: string;
}

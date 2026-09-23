export interface InvestingSeriesPoint {
  date: string;
  invested: string;
  portfolioValue: string | null;
}

export interface InvestingSummary {
  series: InvestingSeriesPoint[];
  totalInvested: string;
  latestPortfolioValue: string | null;
  gainAmount: string | null;
  gainPercent: string | null;
}

export interface PortfolioSnapshot {
  id: string;
  date: string;
  value: string;
}

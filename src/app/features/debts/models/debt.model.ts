export type DebtStatus = 'pending' | 'paid';

export interface Debt {
  id: string;
  title: string;
  amount: number;
  status: DebtStatus;
  createdAt?: string;
}


export enum Role {
  ADMIN = 'Administrator',
  STAFF = 'Staff'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface Transaction {
  id: string;
  code: string;
  date: string;
  staffId: string;
  staffName: string;
  customerName: string;
  customerUser: string;
  amount: number;
  finalBalance: number;
  description: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'DEBIT' | 'CREDIT';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  details: string;
  targetId?: string;
}

export type TabType = 'RECENT' | 'ALL' | 'ACCOUNTS' | 'LOGS';

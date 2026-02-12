
import { Role, User, Account, Transaction } from './types';

export const INITIAL_STAFF: User[] = [
  { id: '1', name: 'Siti Nurhaliza', username: 'siti', role: Role.STAFF },
  { id: '2', name: 'Budi Santoso', username: 'budi', role: Role.STAFF },
  { id: '3', name: 'Andi Wijaya', username: 'andi', role: Role.STAFF },
  { id: '4', name: 'Rahmat Hidayat', username: 'rahmat', role: Role.STAFF },
  { id: 'admin-1', name: 'Administrator', username: 'admin', role: Role.ADMIN },
];

export const ACCOUNTS: Account[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ACC-${i + 1}`,
  name: `Rekening Operasional ${i + 1}`,
  balance: 0,
  type: i % 3 === 0 ? 'CREDIT' : 'DEBIT'
}));

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    code: 'TRX20260211-01026',
    date: '2026-02-11T14:13:00',
    staffId: '1',
    staffName: 'Siti Nurhaliza',
    customerName: 'PT Indo Gemilang',
    customerUser: 'indogemilang_admin',
    amount: -24295627,
    finalBalance: 245000000,
    description: 'Refund pelanggan',
    accountId: 'ACC-1'
  },
  {
    id: 'trx-2',
    code: 'TRX20260211-01027',
    date: '2026-02-11T14:11:00',
    staffId: '2',
    staffName: 'Budi Santoso',
    customerName: 'UD Cahaya Baru',
    customerUser: 'cahaya_owner',
    amount: 32165282,
    finalBalance: 269295627,
    description: 'Penarikan tunai',
    accountId: 'ACC-1'
  },
  {
    id: 'trx-3',
    code: 'TRX20260211-01028',
    date: '2026-02-11T14:11:00',
    staffId: '3',
    staffName: 'Andi Wijaya',
    customerName: 'UD Cahaya Baru',
    customerUser: 'cahaya_owner',
    amount: -15201798,
    finalBalance: 237130345,
    description: 'Pembelian perlengkapan',
    accountId: 'ACC-2'
  }
];

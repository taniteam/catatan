
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Role, User, Transaction, Account, AuditLog, TabType 
} from './types';
import { 
  INITIAL_STAFF, INITIAL_TRANSACTIONS, ACCOUNTS 
} from './constants';
import { 
  formatCurrency, formatFullCurrency, formatDate 
} from './utils';
import StatCard from './components/StatCard';
import TransactionModal from './components/TransactionModal';
import StaffManager from './components/StaffManager';
import LoginPage from './components/LoginPage';
import AccountManager from './components/AccountManager';

const App: React.FC = () => {
  // Persistence states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<User[]>(() => {
    const saved = localStorage.getItem('company_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('company_trxs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('company_accounts');
    return saved ? JSON.parse(saved) : ACCOUNTS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('company_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState<TabType>('RECENT');
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [filterAccountId, setFilterAccountId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('company_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('company_trxs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('company_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('company_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Dynamic Account Balances
  const calculatedAccounts = useMemo(() => {
    return accounts.map(acc => {
      const accTransactions = transactions.filter(t => t.accountId === acc.id);
      const balance = accTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { ...acc, balance };
    });
  }, [accounts, transactions]);

  // Statistics
  const totalBalance = useMemo(() => transactions.reduce((sum, trx) => sum + trx.amount, 0), [transactions]);
  const incomeThisMonth = useMemo(() => transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const expenseThisMonth = useMemo(() => Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)), [transactions]);

  // Main Filtering Logic
  const displayedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by Account ID (from Bank click)
    if (filterAccountId) {
      filtered = filtered.filter(t => t.accountId === filterAccountId);
    }

    // Filter by Date Range
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.date) >= sDate);
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.date) <= eDate);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.code.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerUser.toLowerCase().includes(q) ||
        t.staffName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.accountId.toLowerCase().includes(q)
      );
    }

    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Only apply limit if it's the "RECENT" tab and NO filters are active
    const hasAnyFilter = filterAccountId || searchQuery || startDate || endDate;
    if (activeTab === 'RECENT' && !hasAnyFilter) return sorted.slice(0, 10);
    
    return sorted;
  }, [transactions, activeTab, filterAccountId, searchQuery, startDate, endDate]);

  // Actions
  const addLog = (action: AuditLog['action'], details: string, targetId?: string) => {
    const userToLog = currentUser || { id: 'sys', name: 'System' };
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: userToLog.id,
      userName: userToLog.name,
      action,
      details,
      targetId
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setTimeout(() => addLog('LOGIN', `User @${user.username} berhasil masuk ke sistem`), 100);
  };

  const handleLogout = () => {
    if (currentUser) {
      addLog('LOGIN', `User @${currentUser.username} keluar dari sistem`);
      setCurrentUser(null);
    }
  };

  const handleSaveTransaction = (trxData: Partial<Transaction>) => {
    if (!currentUser) return;
    if (editingTrx) {
      setTransactions(prev => prev.map(t => t.id === editingTrx.id ? { ...t, ...trxData } as Transaction : t));
      addLog('UPDATE', `Mengedit transaksi ${trxData.code} (Pelanggan: ${trxData.customerName})`, editingTrx.id);
    } else {
      const newTrx: Transaction = {
        ...trxData,
        id: `trx-${Date.now()}`,
        finalBalance: totalBalance + (trxData.amount || 0)
      } as Transaction;
      setTransactions(prev => [newTrx, ...prev]);
      addLog('CREATE', `Input transaksi baru ${newTrx.code} senilai ${formatCurrency(newTrx.amount)}`, newTrx.id);
    }
    setIsTrxModalOpen(false);
    setEditingTrx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const trx = transactions.find(t => t.id === id);
    if (!trx) return;
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${trx.code}?`)) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      addLog('DELETE', `Menghapus transaksi ${trx.code}`, id);
    }
  };

  const handleUpdateStaffRole = (id: string, role: Role) => {
    const target = staff.find(s => s.id === id);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, role } : s));
    addLog('UPDATE', `Mengubah akses staff ${target?.name} menjadi ${role}`);
  };

  // Improved CSV Export Logic
  const downloadCSV = () => {
    // We use displayedTransactions to ensure it matches the current table view (filters + bank selection)
    const headers = ['No. Transaksi', 'Tanggal', 'Pelanggan', 'User Pelanggan', 'Rekening', 'Jumlah (IDR)', 'Staff Pencatat', 'Keterangan'];
    
    // Function to wrap values in double quotes and escape existing quotes to keep CSV "rapi"
    const escapeCSV = (val: any) => {
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = displayedTransactions.map(t => [
      escapeCSV(t.code),
      escapeCSV(formatDate(t.date)),
      escapeCSV(t.customerName),
      escapeCSV(t.customerUser),
      escapeCSV(t.accountId),
      t.amount, // Numeric values don't necessarily need quotes but helpful for formatting
      escapeCSV(t.staffName),
      escapeCSV(t.description || '-')
    ]);

    const csvContent = "\uFEFF" // Byte Order Mark for Excel UTF-8 support
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Naming based on current view
    let filename = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}`;
    if (filterAccountId) filename += `_Bank_${filterAccountId}`;
    if (searchQuery) filename += `_Search_${searchQuery.substring(0, 10)}`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('CREATE', `Mengunduh laporan (${displayedTransactions.length} data) dalam format CSV`);
  };

  if (!currentUser) {
    return <LoginPage staff={staff} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setFilterAccountId(null); setActiveTab('RECENT'); setSearchQuery(''); setStartDate(''); setEndDate(''); }}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-lg tracking-tight leading-none">FinCorp</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Sistem Keuangan</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right border-r border-gray-100 pr-4 mr-2">
              <p className="text-xs font-black text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{currentUser.role}</p>
            </div>
            {currentUser.role === Role.ADMIN && (
              <div className="flex space-x-2">
                <button onClick={() => setIsStaffModalOpen(true)} className="p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-white rounded-xl transition-all" title="Manage Staff">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </button>
                <button onClick={() => setIsAccountModalOpen(true)} className="p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-white rounded-xl transition-all" title="Manage Accounts">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1" /></svg>
                </button>
              </div>
            )}
            <button onClick={handleLogout} className="px-4 py-2 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Stats Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50 mb-2">Total Estimasi Saldo Perusahaan</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{formatFullCurrency(totalBalance)}</h2>
            </div>
            <div className="relative z-10 flex items-center space-x-8 mt-4">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Total Pemasukan</p>
                <p className="text-emerald-400 font-black text-lg">+{formatFullCurrency(incomeThisMonth)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Total Pengeluaran</p>
                <p className="text-rose-400 font-black text-lg">-{formatFullCurrency(expenseThisMonth)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aksi Cepat</p>
              <button onClick={() => { setEditingTrx(null); setIsTrxModalOpen(true); }} className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 transform active:scale-[0.97]">
                + Input Transaksi
              </button>
              <button onClick={downloadCSV} className="w-full border-2 border-slate-100 text-slate-600 rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Download Report (CSV)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                {activeTab === 'LOGS' ? 'Audit Log & Aktivitas' : (filterAccountId ? `Rekening: ${filterAccountId}` : 'Riwayat Transaksi')}
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                {activeTab === 'LOGS' ? 'Pemantauan integritas data' : 'Data operasional terbaru perusahaan'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              {/* Date Filters */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-gray-300 font-bold">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex bg-slate-200 p-1 rounded-xl items-center">
                <button 
                  onClick={() => { setActiveTab('RECENT'); setFilterAccountId(null); }}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${activeTab === 'RECENT' && !filterAccountId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Terbaru
                </button>
                <button 
                  onClick={() => { setActiveTab('ALL'); setFilterAccountId(null); }}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${activeTab === 'ALL' && !filterAccountId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Semua
                </button>
                <button 
                  onClick={() => setActiveTab('ACCOUNTS')}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${activeTab === 'ACCOUNTS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Rekening
                </button>
                <button 
                  onClick={() => { setActiveTab('LOGS'); setFilterAccountId(null); }}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${activeTab === 'LOGS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Log
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'ACCOUNTS' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-8 gap-6 bg-slate-50/30">
                {calculatedAccounts.map(acc => (
                  <div 
                    key={acc.id} 
                    className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => { setFilterAccountId(acc.id); setActiveTab('ALL'); }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{acc.id}</p>
                        <h4 className="font-bold text-slate-800 group-hover:text-slate-900">{acc.name}</h4>
                      </div>
                      <span className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase ${acc.type === 'CREDIT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {acc.type}
                      </span>
                    </div>
                    <div className="text-right w-full">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Saldo Saat Ini</p>
                      <p className="text-lg font-black text-slate-900">{formatFullCurrency(acc.balance)}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Klik: Laporan Bank</span>
                       <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'LOGS' ? (
              <div className="p-8 bg-slate-50/20 space-y-4">
                {auditLogs.map(log => (
                  <div key={log.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-5 transition-all hover:border-slate-200">
                    <div className={`mt-1 w-2 h-2 rounded-full ${
                      log.action === 'CREATE' ? 'bg-emerald-500' : 
                      log.action === 'UPDATE' ? 'bg-amber-500' : 
                      log.action === 'DELETE' ? 'bg-rose-500' : 'bg-slate-900'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-black text-slate-800">{log.userName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(log.timestamp)}</p>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded uppercase tracking-widest">{log.action}</span>
                        {log.targetId && <span className="text-[9px] font-mono text-gray-300">ID: {log.targetId}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Belum ada aktivitas tercatat</p>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Transaksi</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rekening</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayedTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-800 font-mono tracking-tight">{trx.code}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-[10px] font-black text-gray-500 uppercase">{formatDate(trx.date)}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-800">{trx.customerName}</p>
                        <p className="text-[10px] font-medium text-gray-400">@{trx.customerUser}</p>
                      </td>
                      <td className={`px-8 py-5 text-sm font-black ${trx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {formatCurrency(trx.amount)}
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{trx.accountId}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-slate-700">{trx.staffName}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => { setEditingTrx(trx); setIsTrxModalOpen(true); }} className="p-2 text-slate-300 hover:text-slate-800 transition-all rounded-lg hover:bg-slate-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          {(currentUser.role === Role.ADMIN || trx.staffId === currentUser.id) && (
                            <button onClick={() => handleDeleteTransaction(trx.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tidak ada data transaksi yang sesuai filter</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={isTrxModalOpen}
        onClose={() => { setIsTrxModalOpen(false); setEditingTrx(null); }}
        onSave={handleSaveTransaction}
        currentUser={currentUser}
        editingTransaction={editingTrx}
        accounts={accounts}
      />

      <StaffManager 
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staff={staff}
        onAddStaff={(s) => {
          const newS = { ...s, id: `staff-${Date.now()}` };
          setStaff(prev => [...prev, newS]);
          addLog('CREATE', `Daftar staff baru: ${s.name} (${s.role})`);
        }}
        onDeleteStaff={(id) => {
          const s = staff.find(st => st.id === id);
          if (s && confirm(`Hapus staff ${s.name}?`)) {
            setStaff(prev => prev.filter(st => st.id !== id));
            addLog('DELETE', `Menonaktifkan staff: ${s.name}`);
          }
        }}
        onUpdateRole={handleUpdateStaffRole}
      />

      <AccountManager
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onAddAccount={(acc) => {
          setAccounts(prev => [...prev, { ...acc, balance: 0 }]);
          addLog('CREATE', `Menambahkan rekening baru: ${acc.name} (${acc.id})`);
        }}
        onUpdateAccount={(id, updated) => {
          setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
          addLog('UPDATE', `Memperbarui detail rekening ${id}`);
        }}
        onDeleteAccount={(id) => {
          setAccounts(prev => prev.filter(a => a.id !== id));
          addLog('DELETE', `Menghapus rekening ${id}`);
        }}
      />
    </div>
  );
};

export default App;


import React, { useState } from 'react';
import { Account } from '../types';

interface AccountManagerProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'balance'>) => void;
  onUpdateAccount: (id: string, updated: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ isOpen, onClose, accounts, onAddAccount, onUpdateAccount, onDeleteAccount }) => {
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) return;
    onAddAccount({ id: newId, name: newName, type: newType });
    setNewId('');
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Daftar Rekening</h2>
            <p className="text-sm text-gray-500">Kelola rekening operasional perusahaan</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-gray-600 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden grid md:grid-cols-5">
          {/* Add New Account Form */}
          <div className="md:col-span-2 p-8 border-r border-gray-100 overflow-y-auto">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <span className="w-2 h-2 bg-slate-900 rounded-full"></span>
              <span>Tambah Rekening</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">ID Rekening</label>
                <input 
                  type="text" 
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
                  placeholder="Mis: ACC-001"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Nama Rekening</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="Mis: Mandiri Operasional"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Tipe</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'DEBIT' | 'CREDIT')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="DEBIT">Debit</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
              <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]">
                Tambah Rekening
              </button>
            </form>
          </div>

          {/* Account List */}
          <div className="md:col-span-3 bg-gray-50/50 p-8 overflow-y-auto">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Daftar Rekening ({accounts.length})</span>
            </h3>
            <div className="space-y-4">
              {accounts.map(acc => (
                <div key={acc.id} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-tight">{acc.id}</p>
                    <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${acc.type === 'CREDIT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {acc.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onDeleteAccount(acc.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;

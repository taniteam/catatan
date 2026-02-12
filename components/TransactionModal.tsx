
import React, { useState, useEffect } from 'react';
import { Transaction, User, Account } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<Transaction>) => void;
  currentUser: User;
  editingTransaction?: Transaction | null;
  accounts: Account[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, onClose, onSave, currentUser, editingTransaction, accounts 
}) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    code: '',
    customerName: '',
    customerUser: '',
    amount: 0,
    description: '',
    accountId: accounts[0]?.id || ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
    } else {
      setFormData({
        code: '',
        customerName: '',
        customerUser: '',
        amount: 0,
        description: '',
        accountId: accounts[0]?.id || ''
      });
    }
  }, [editingTransaction, accounts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      staffId: currentUser.id,
      staffName: currentUser.name,
      date: editingTransaction ? editingTransaction.date : new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {editingTransaction ? 'Edit Data Transaksi' : 'Input Transaksi Baru'}
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Formulir Pencatatan Keuangan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* 1. Pilihan Rekening */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilihan Rekening</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-700"
              value={formData.accountId}
              onChange={(e) => setFormData({...formData, accountId: e.target.value})}
              required
            >
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.id})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Nama Pelanggan */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Pelanggan</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="E.g. Andi Wijaya"
                required
              />
            </div>
            {/* 3. User Pelanggan */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">User Pelanggan</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold"
                value={formData.customerUser}
                onChange={(e) => setFormData({...formData, customerUser: e.target.value})}
                placeholder="andi_user"
                required
              />
            </div>
          </div>

          {/* 4. No Transaksi (Manual Input) */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No Transaksi (Manual)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono font-bold text-slate-800"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="E.g. TRX-2024-0001"
              required
            />
            <p className="text-[9px] text-gray-400 mt-1 font-bold italic">*Gunakan kode unik sesuai bukti transaksi server</p>
          </div>

          {/* 5. Jumlah */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jumlah (IDR)</label>
            <div className="relative">
              <input 
                type="number" 
                className={`w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-black text-lg ${formData.amount && formData.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                required
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
            </div>
          </div>

          {/* 6. Keterangan (Opsional) */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keterangan <span className="text-gray-300">(Opsional)</span></label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-medium"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
              placeholder="Catatan tambahan jika ada..."
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:shadow-slate-300 transform active:scale-[0.98] uppercase tracking-widest"
            >
              Simpan Data Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;


import React, { useState } from 'react';
import { User, Role } from '../types';

interface StaffManagerProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User[];
  onAddStaff: (staff: Omit<User, 'id'>) => void;
  onDeleteStaff: (id: string) => void;
  onUpdateRole: (id: string, role: Role) => void;
}

const StaffManager: React.FC<StaffManagerProps> = ({ isOpen, onClose, staff, onAddStaff, onDeleteStaff, onUpdateRole }) => {
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.STAFF);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername) return;
    onAddStaff({ name: newName, username: newUsername, role: newRole });
    setNewName('');
    setNewUsername('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Manajemen Karyawan</h2>
            <p className="text-sm text-gray-500">Kelola akses dan otoritas staff perusahaan</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-gray-600 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden grid md:grid-cols-5">
          {/* Add New Staff Form */}
          <div className="md:col-span-2 p-8 border-r border-gray-100 overflow-y-auto">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <span className="w-2 h-2 bg-slate-900 rounded-full"></span>
              <span>Tambah Staff Baru</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="E.g. Diana Rose"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Username</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="username_diana"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Otoritas (Role)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setNewRole(Role.STAFF)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${newRole === Role.STAFF ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    Staff
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewRole(Role.ADMIN)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${newRole === Role.ADMIN ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] mt-4">
                Daftarkan Staff
              </button>
            </form>
          </div>

          {/* Staff List */}
          <div className="md:col-span-3 bg-gray-50/50 p-8 overflow-y-auto">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Daftar Staff Aktif ({staff.length})</span>
            </h3>
            <div className="space-y-4">
              {staff.map(s => (
                <div key={s.id} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs text-gray-400 font-medium italic">@{s.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select 
                      value={s.role}
                      onChange={(e) => onUpdateRole(s.id, e.target.value as Role)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value={Role.STAFF}>Staff</option>
                      <option value={Role.ADMIN}>Administrator</option>
                    </select>

                    <button 
                      onClick={() => onDeleteStaff(s.id)}
                      disabled={s.username === 'admin'}
                      className={`p-2 text-gray-300 hover:text-rose-500 transition-colors ${s.username === 'admin' ? 'opacity-0 cursor-default' : ''}`}
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

export default StaffManager;

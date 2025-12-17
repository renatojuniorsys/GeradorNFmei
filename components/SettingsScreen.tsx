import React, { useState } from 'react';
import { User, AppSettings, UserRole } from '../types';
import { Trash2, Plus, Upload, Save, UserPlus, Shield, UserCog, Image as ImageIcon, QrCode } from 'lucide-react';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ users, setUsers, settings, setSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'USERS'>('VISUAL');
  
  // New User State
  const [newUser, setNewUser] = useState({ name: '', password: '', role: 'OPERATOR' as UserRole });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'qrCodeUrl') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings(prev => ({ ...prev, [field]: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.password) return;

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      password: newUser.password,
      role: newUser.role
    };

    setUsers([...users, user]);
    setNewUser({ name: '', password: '', role: 'OPERATOR' });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in mt-8">
      <div className="bg-gray-900 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Configurações do Sistema</h2>
          <p className="text-gray-400 text-sm">Gerenciamento visual e controle de acesso</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          Voltar para Home
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('VISUAL')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'VISUAL' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Personalização Visual
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'USERS' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCog className="w-4 h-4" /> Gerenciar Usuários
        </button>
      </div>

      <div className="p-8 min-h-[400px]">
        {activeTab === 'VISUAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div className="border rounded-xl p-6 flex flex-col items-center text-center bg-gray-50">
              <div className="w-full h-32 mb-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-gray-300 font-bold text-xl">LOGO</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Logo do Recibo</h3>
              <p className="text-xs text-gray-500 mb-4">Aparecerá no cabeçalho do Recibo Formal. (PNG/JPG)</p>
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                <Upload className="w-4 h-4" />
                Carregar Logo
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
              </label>
              {settings.logoUrl && (
                <button onClick={() => setSettings(p => ({...p, logoUrl: null}))} className="mt-2 text-xs text-red-500 hover:underline">Remover</button>
              )}
            </div>

            {/* QR Code Upload */}
            <div className="border rounded-xl p-6 flex flex-col items-center text-center bg-gray-50">
              <div className="w-full h-32 mb-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {settings.qrCodeUrl ? (
                  <img src={settings.qrCodeUrl} alt="QR" className="h-24 w-24 object-contain" />
                ) : (
                  <QrCode className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">QR Code de Pagamento/Validação</h3>
              <p className="text-xs text-gray-500 mb-4">Aparecerá no rodapé dos documentos. (PNG/JPG)</p>
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                <Upload className="w-4 h-4" />
                Carregar QR Code
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'qrCodeUrl')} />
              </label>
              {settings.qrCodeUrl && (
                <button onClick={() => setSettings(p => ({...p, qrCodeUrl: null}))} className="mt-2 text-xs text-red-500 hover:underline">Remover</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-8">
            {/* Add User Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Adicionar Novo Usuário
              </h3>
              <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nome de Usuário</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    placeholder="Ex: joao.silva"
                    required
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    placeholder="Senha de acesso"
                    required
                  />
                </div>
                <div className="w-full md:w-40">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Permissão</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  >
                    <option value="OPERATOR">Operador</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-3">Usuário</th>
                    <th className="px-6 py-3">Senha</th>
                    <th className="px-6 py-3">Permissão</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500 tracking-widest text-xs">
                        {/* Showing password for demo purposes as requested functionality implies management */}
                        {user.password} 
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.name !== 'admin' && ( // Prevent deleting main admin
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
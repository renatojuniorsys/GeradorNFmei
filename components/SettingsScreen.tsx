
import React, { useState } from 'react';
import { User, AppSettings, UserRole } from '../types';
import { Trash2, Plus, Upload, Save, UserPlus, Shield, UserCog, Image as ImageIcon, QrCode, PenTool, MousePointer2, ChevronRight, Sparkles, Loader2, Check } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { generateAiLogo } from '../services/geminiService';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ users, setUsers, settings, setSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'USERS' | 'SIGNATURE'>('VISUAL');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', password: '', role: 'OPERATOR' as UserRole });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings(prev => ({ ...prev, [field]: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerateAiLogo = async () => {
    setIsGeneratingLogo(true);
    try {
      const logoDataUrl = await generateAiLogo();
      setSettings(prev => ({ ...prev, logoUrl: logoDataUrl }));
    } catch (err: any) {
      alert(err.message || "Erro ao gerar logo.");
    } finally {
      setIsGeneratingLogo(false);
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in mt-6 sm:mt-8 border border-gray-100 flex flex-col max-h-[90vh] sm:max-h-none">
      <div className="bg-gray-900 p-6 sm:p-8 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">Ajustes</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configurações globais</p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
        >
          Fechar
        </button>
      </div>

      <div className="flex bg-gray-50 border-b border-gray-100 p-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('VISUAL')}
          className={`flex-1 min-w-[100px] py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all rounded-xl ${
            activeTab === 'VISUAL' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400'
          }`}
        >
          <ImageIcon className="w-4 h-4 shrink-0" /> Visual
        </button>
        <button
          onClick={() => setActiveTab('SIGNATURE')}
          className={`flex-1 min-w-[110px] py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all rounded-xl ${
            activeTab === 'SIGNATURE' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400'
          }`}
        >
          <PenTool className="w-4 h-4 shrink-0" /> Assinatura
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 min-w-[100px] py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all rounded-xl ${
            activeTab === 'USERS' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400'
          }`}
        >
          <UserCog className="w-4 h-4 shrink-0" /> Usuários
        </button>
      </div>

      <div className="p-6 sm:p-10 overflow-y-auto no-scrollbar">
        {activeTab === 'VISUAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="border border-gray-100 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center text-center bg-gray-50/50">
              <div className="w-full h-32 sm:h-40 mb-5 sm:mb-6 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden shadow-inner p-4 relative group">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-gray-200 font-black text-lg sm:text-2xl tracking-tighter uppercase">Logo</span>
                )}
                
                {isGeneratingLogo && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">IA Criando...</span>
                  </div>
                )}
              </div>

              <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm sm:text-base mb-1">Identidade Visual</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">Personalize sua marca</p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={handleGenerateAiLogo}
                  disabled={isGeneratingLogo}
                  className="w-full bg-indigo-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Gerar Logo Profissional (IA)
                </button>

                <label className="w-full cursor-pointer bg-white border border-gray-200 text-gray-900 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                  <Upload className="w-3.5 h-3.5" /> Upload Manual
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                </label>
              </div>
            </div>

            <div className="border border-gray-100 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center text-center bg-gray-50/50">
              <div className="w-full h-32 sm:h-40 mb-5 sm:mb-6 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden shadow-inner p-4">
                {settings.qrCodeUrl ? (
                  <img src={settings.qrCodeUrl} alt="QR" className="h-24 w-24 sm:h-32 sm:w-32 object-contain" />
                ) : (
                  <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200" />
                )}
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm sm:text-base mb-1">QR Pagamento</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">PIX ou Validação extra</p>
              <label className="w-full cursor-pointer bg-white border border-gray-200 text-gray-900 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                <Upload className="w-3.5 h-3.5" /> Upload QR
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'qrCodeUrl')} />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'SIGNATURE' && (
          <div className="max-w-2xl mx-auto">
            {!isDrawingMode ? (
              <div className="border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-12 flex flex-col items-center text-center bg-gray-50/50">
                <div className="w-full h-40 sm:h-56 mb-6 sm:mb-8 bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center overflow-hidden relative shadow-2xl p-4">
                  {settings.signatureUrl ? (
                    <img src={settings.signatureUrl} alt="Assinatura" className="max-h-full w-auto object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 sm:gap-4 text-gray-200">
                      <PenTool className="w-12 h-12 sm:w-16 sm:h-16" />
                      <span className="font-black text-[10px] sm:text-sm uppercase tracking-[0.2em]">Sem Assinatura</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2 tracking-tight">Assinatura Digital</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 sm:mb-10 max-w-sm leading-relaxed px-4">
                  Será aplicada automaticamente em todos os seus documentos fiscais.
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="cursor-pointer bg-white border border-gray-200 text-gray-900 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                      <Upload className="w-4 h-4" /> Upload
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'signatureUrl')} />
                    </label>

                    <button onClick={() => setIsDrawingMode(true)} className="bg-indigo-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95">
                      <MousePointer2 className="w-4 h-4" /> Desenhar
                    </button>
                  </div>
                  
                  {settings.signatureUrl && (
                    <button onClick={() => setSettings(p => ({...p, signatureUrl: null}))} className="w-full bg-rose-50 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95">
                      Remover Assinatura
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <SignaturePad 
                onSave={(base64) => {
                  setSettings(p => ({ ...p, signatureUrl: base64 }));
                  setIsDrawingMode(false);
                }} 
                onCancel={() => setIsDrawingMode(false)} 
              />
            )}
            
            <div className="mt-8 sm:mt-10 p-6 sm:p-8 bg-indigo-50 rounded-[1.5rem] sm:rounded-[2rem] border border-indigo-100 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 shrink-0" />
              <div>
                <h4 className="font-black text-indigo-900 text-xs sm:text-sm uppercase mb-1 sm:mb-2 tracking-wider">Certificação Digital</h4>
                <p className="text-[10px] sm:text-xs text-indigo-700/80 font-bold leading-relaxed">
                  Sua assinatura vincula-se aos documentos com selo de autenticidade visual, garantindo profissionalismo em suas quitações.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-8 sm:space-y-10">
            <div className="bg-gray-50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Novo Colaborador
              </h3>
              <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Usuário</label>
                    <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Nome" required />
                  </div>
                  <div className="w-full">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                    <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Senha" required />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Função</label>
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none">
                      <option value="OPERATOR">Operador</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl hover:bg-black font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95">
                    Salvar
                  </button>
                </div>
              </form>
            </div>

            <div className="border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Usuário</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Função</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 sm:px-8 py-4 sm:py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-sm">{user.name}</span>
                          <span className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {user.id}</span>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.role === 'ADMIN' ? <Shield className="w-2.5 h-2.5" /> : <UserCog className="w-2.5 h-2.5" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-5 text-right">
                        {user.name !== 'admin' && (
                          <button onClick={() => handleDeleteUser(user.id)} className="text-gray-300 hover:text-rose-600 transition-all p-2 rounded-lg hover:bg-rose-50 active:scale-90">
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

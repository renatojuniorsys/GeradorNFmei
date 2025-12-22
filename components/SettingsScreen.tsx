
import React, { useState } from 'react';
import { User, AppSettings, UserRole, HistoryItem } from '../types';
import { Trash2, Upload, ImageIcon, QrCode, PenTool, MousePointer2, Sparkles, Loader2, X, UserCog, UserPlus, Shield, Database, Download, AlertCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { generateAiLogo } from '../services/geminiService';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

export const SettingsScreen: React.FC<Props> = ({ users, setUsers, settings, setSettings, onClose, history, setHistory }) => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'USERS' | 'SIGNATURE' | 'BACKUP'>('VISUAL');
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

  const handleRemoveImage = (field: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [field]: null }));
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

  // BACKUP LOGIC
  const handleExportBackup = () => {
    const backupData = {
      version: "1.0",
      timestamp: Date.now(),
      data: {
        users,
        settings,
        history
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_meismartdoc_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.data && json.data.users && json.data.settings && json.data.history) {
          if (confirm('Atenção: Restaurar um backup substituirá TODOS os dados atuais. Deseja continuar?')) {
            setUsers(json.data.users);
            setSettings(json.data.settings);
            setHistory(json.data.history);
            
            // Force save to localstorage and refresh to ensure consistency
            localStorage.setItem('app_users', JSON.stringify(json.data.users));
            localStorage.setItem('app_settings', JSON.stringify(json.data.settings));
            localStorage.setItem('invoice_history', JSON.stringify(json.data.history));
            
            alert('Backup restaurado com sucesso! O sistema será reiniciado.');
            window.location.reload();
          }
        } else {
          alert('Arquivo de backup inválido ou corrompido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo de backup.');
      }
    };
    reader.readAsDataURL(file);
  };

  const tabButtonStyle = (tab: 'VISUAL' | 'USERS' | 'SIGNATURE' | 'BACKUP') => `
    flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all
    ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}
  `;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in mt-4 border border-gray-100 flex flex-col max-h-[90vh] sm:max-h-none">
      <div className="bg-gray-900 p-6 sm:p-8 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase leading-none">Configurações</h2>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">Gestão da plataforma</p>
        </div>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 sm:px-6 sm:py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">
          <span className="hidden sm:inline">Fechar</span>
          <X className="w-4 h-4 sm:hidden" />
        </button>
      </div>

      <div className="flex bg-gray-50 border-b border-gray-100 shrink-0">
        <button onClick={() => setActiveTab('VISUAL')} className={tabButtonStyle('VISUAL')}>
          <ImageIcon className="w-4 h-4" /> Visual
        </button>
        <button onClick={() => setActiveTab('SIGNATURE')} className={tabButtonStyle('SIGNATURE')}>
          <PenTool className="w-4 h-4" /> Assinatura
        </button>
        <button onClick={() => setActiveTab('USERS')} className={tabButtonStyle('USERS')}>
          <UserCog className="w-4 h-4" /> Usuários
        </button>
        <button onClick={() => setActiveTab('BACKUP')} className={tabButtonStyle('BACKUP')}>
          <Database className="w-4 h-4" /> Backup
        </button>
      </div>

      <div className="p-6 sm:p-10 overflow-y-auto no-scrollbar">
        {activeTab === 'VISUAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div className="border border-gray-100 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center text-center bg-gray-50/30">
              <div className="w-full h-32 sm:h-40 mb-6 bg-white border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner p-4 relative group">
                {settings.logoUrl ? (
                  <>
                    <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    <button onClick={() => handleRemoveImage('logoUrl')} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 shadow-lg">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-200" />
                )}
                {isGeneratingLogo && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    <span className="text-[9px] font-black text-indigo-600 uppercase">Gerando IA...</span>
                  </div>
                )}
              </div>
              <h3 className="font-black text-gray-900 uppercase text-sm mb-1">Logotipo da Empresa</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">Exibido na Nota e no Recibo</p>
              
              <div className="flex flex-col gap-3 w-full">
                <button onClick={handleGenerateAiLogo} disabled={isGeneratingLogo} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50">
                  <Sparkles className="w-3.5 h-3.5" /> Gerar com IA
                </button>
                <label className="w-full cursor-pointer bg-white border border-gray-200 text-gray-900 py-4 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-50">
                  <Upload className="w-3.5 h-3.5" /> Upload Manual
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                </label>
              </div>
            </div>

            <div className="border border-gray-100 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center text-center bg-gray-50/30">
              <div className="w-full h-32 sm:h-40 mb-6 bg-white border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner p-4 relative group">
                {settings.qrCodeUrl ? (
                  <>
                    <img src={settings.qrCodeUrl} alt="QR" className="h-full w-auto object-contain" />
                    <button onClick={() => handleRemoveImage('qrCodeUrl')} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 shadow-lg">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <QrCode className="w-10 h-10 text-gray-200" />
                )}
              </div>
              <h3 className="font-black text-gray-900 uppercase text-sm mb-1">QR Code de Pagamento</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">PIX Estático ou Personalizado</p>
              <label className="w-full cursor-pointer bg-white border border-gray-200 text-gray-900 py-4 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-50">
                <Upload className="w-3.5 h-3.5" /> Upload QR Code
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'qrCodeUrl')} />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'SIGNATURE' && (
          <div className="max-w-xl mx-auto">
            {!isDrawingMode ? (
              <div className="border border-gray-100 rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center text-center bg-gray-50/30">
                <div className="w-full h-40 sm:h-48 mb-6 bg-white border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-lg p-4 group">
                  {settings.signatureUrl ? (
                    <>
                      <img src={settings.signatureUrl} alt="Assinatura" className="max-h-full w-auto object-contain" />
                      <button onClick={() => handleRemoveImage('signatureUrl')} className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 shadow-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <PenTool className="w-12 h-12 text-gray-200" />
                  )}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Assinatura Digital</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 leading-relaxed">Sua assinatura será aplicada em todos os recibos automáticos.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <label className="cursor-pointer bg-white border border-gray-200 py-4 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-all">
                    <Upload className="w-4 h-4" /> Upload Imagem
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'signatureUrl')} />
                  </label>
                  <button onClick={() => setIsDrawingMode(true)} className="bg-indigo-600 text-white py-4 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                    <MousePointer2 className="w-4 h-4" /> Assinar na Tela
                  </button>
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
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-10">
            <div className="bg-gray-50/50 p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-inner">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Novo Colaborador
              </h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none" placeholder="Usuário" required />
                <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none" placeholder="Senha" required />
                <div className="flex gap-2">
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="flex-grow border border-gray-200 rounded-xl p-3.5 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none">
                    <option value="OPERATOR">Operador</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button type="submit" className="bg-gray-900 text-white px-5 rounded-xl hover:bg-black transition-all">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            <div className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Colaborador</th>
                      <th className="px-8 py-5">Nível de Acesso</th>
                      <th className="px-8 py-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <span className="font-black text-gray-900 text-sm block">{user.name}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">UID: {user.id}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {user.name !== 'admin' && (
                            <button onClick={() => handleDeleteUser(user.id)} className="text-gray-300 hover:text-rose-600 transition-all p-2 rounded-lg">
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
          </div>
        )}

        {activeTab === 'BACKUP' && (
          <div className="max-w-2xl mx-auto py-4">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-inner mb-8">
              <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Segurança dos Dados</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                Exporte todos os seus documentos, configurações visuais e lista de usuários em um único arquivo de segurança.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleExportBackup}
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" /> Baixar Backup (.json)
                </button>
                
                <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-indigo-200 text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-indigo-50 transition-all active:scale-95">
                  <Upload className="w-4 h-4" /> Restaurar Backup
                  <input type="file" className="hidden" accept=".json" onChange={handleImportBackup} />
                </label>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Aviso Importante</p>
                <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                  A restauração de backup substituirá permanentemente todos os dados atuais. Recomendamos baixar um backup atual antes de importar um novo arquivo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

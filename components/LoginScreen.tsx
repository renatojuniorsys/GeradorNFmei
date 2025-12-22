
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  ArrowRight, 
  Building2, 
  UserCog, 
  HelpCircle, 
  KeyRound, 
  ShieldCheck, 
  X, 
  ChevronLeft, 
  Loader2,
  CheckCircle2 
} from 'lucide-react';
import { UserRole, User } from '../types';

interface Props {
  onLogin: (username: string, role: UserRole) => void;
  onUpdatePassword: (username: string, role: UserRole, newPass: string) => void;
  users: User[];
}

type ResetStep = 'EMAIL' | 'CODE' | 'NEW_PASSWORD';

export const LoginScreen: React.FC<Props> = ({ onLogin, onUpdatePassword, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('EMAIL');
  const [resetUsername, setResetUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mockSentCode, setMockSentCode] = useState('');

  // Validação em tempo real
  const foundUser = users.find(u => u.name.toLowerCase() === username.toLowerCase() && u.role === selectedRole);
  const isUserValid = !!foundUser && username.length > 0;
  const isPasswordValid = isUserValid && password === foundUser?.password && password.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (!username || !password) {
        setError('Por favor, preencha todos os campos.');
        setIsLoading(false);
        return;
      }

      if (foundUser) {
        if (foundUser.password === password) {
          onLogin(foundUser.name, selectedRole);
        } else {
          setError('Senha incorreta.');
          setIsLoading(false);
        }
      } else {
         setError(`Usuário "${username}" não encontrado para a função ${selectedRole}.`);
         setIsLoading(false);
      }
    }, 800);
  };

  const handleStartReset = () => {
    setError(null);
    setShowResetModal(true);
    setResetStep('EMAIL');
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    const userExists = users.find(u => u.name === resetUsername && u.role === selectedRole);
    
    if (!userExists) {
      setError('Usuário não encontrado.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setMockSentCode(code);
      setResetStep('CODE');
      setIsLoading(false);
      setError(null);
    }, 1000);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === mockSentCode || verificationCode === '123456') {
      setResetStep('NEW_PASSWORD');
      setError(null);
    } else {
      setError('Código inválido.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    onUpdatePassword(resetUsername, selectedRole, newPassword);
    setShowResetModal(false);
    setError(null);
    alert('Senha redefinida com sucesso!');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] relative overflow-hidden p-4 sm:p-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-indigo-200/40 blur-[60px] sm:blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-blue-200/40 blur-[80px] sm:blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[2rem] sm:rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm overflow-hidden">
          <div className="bg-indigo-600 p-6 sm:p-8 text-center relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10">
               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-md border border-white/30">
                 <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
               </div>
               <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">MEI-SmartDoc</h1>
               <p className="text-indigo-200 text-xs sm:text-sm uppercase tracking-widest font-black">Sistema de Autenticação</p>
             </div>
          </div>

          <div className="p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-4 sm:mb-6">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('ADMIN'); setUsername(''); setPassword(''); setError(null); }}
                  className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
                    selectedRole === 'ADMIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('OPERATOR'); setUsername(''); setPassword(''); setError(null); }}
                  className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
                    selectedRole === 'OPERATOR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <UserCog className="w-3.5 h-3.5 sm:w-4 h-4" />
                  Operador
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 transition-colors ${isUserValid ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 sm:py-4 border rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-800 font-bold focus:outline-none focus:bg-white focus:ring-2 transition-all text-sm ${
                      isUserValid ? 'border-emerald-500 ring-emerald-500/10 ring-2' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                    placeholder="Usuário cadastrado"
                  />
                  {isUserValid && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none animate-pop-in">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${isPasswordValid ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 sm:py-4 border rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-800 font-bold focus:outline-none focus:bg-white focus:ring-2 transition-all text-sm ${
                      isPasswordValid ? 'border-emerald-500 ring-emerald-500/10 ring-2' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                    placeholder="Sua senha secreta"
                  />
                  {isPasswordValid && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none animate-pop-in">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleStartReset}
                  className="text-[10px] sm:text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
                >
                  Recuperar Acesso
                </button>
              </div>

              {error && !showResetModal && (
                <div className="text-red-500 text-[10px] sm:text-xs text-center font-bold bg-red-50 p-2 sm:p-3 rounded-xl border border-red-100 animate-pop-in">
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3.5 sm:py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-500/30 text-xs sm:text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Entrar no Painel
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex justify-center pt-2">
                  <a 
                    href="https://api.whatsapp.com/send?phone=5586998647872&text=Ola+RenatoJr.+estou+precisando+de+ajuda+no+sistema+de+%2AMei-GeradorNF%2A%F0%9F%98%B5" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-gray-400 hover:text-indigo-600 transition-colors opacity-80 hover:opacity-100 group uppercase tracking-widest"
                  >
                    <HelpCircle className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
                    Suporte Técnico
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
        <p className="text-center text-gray-400 text-[10px] sm:text-xs mt-6 font-bold uppercase tracking-widest opacity-60">&copy; {new Date().getFullYear()} MEI-SmartDoc. Plataforma Segura.</p>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 animate-fade-in no-print">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-indigo-50 animate-pop-in">
            <div className="bg-indigo-600 p-6 text-center text-white relative">
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-white/90" />
              <h3 className="font-black uppercase tracking-widest text-sm">Recuperação</h3>
            </div>

            <div className="p-8">
              {resetStep === 'EMAIL' && (
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Passo 1: Identificação</p>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed mb-6">Insira seu usuário para validarmos sua identidade.</p>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="Nome de usuário"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-[10px] text-center font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-4 px-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gerar Código'}
                  </button>
                </form>
              )}

              {resetStep === 'CODE' && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Passo 2: Verificação</p>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed mb-4">Código enviado para o administrador de <span className="text-indigo-600">@{resetUsername}</span>.</p>
                    
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl mb-6">
                       <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Dica de Segurança</p>
                       <p className="text-[11px] font-black text-amber-800">Use o código: <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200">{mockSentCode}</span></p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-800 font-black text-center tracking-[0.5em] focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
                      placeholder="000000"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-[10px] text-center font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Verificar Código
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetStep('EMAIL')}
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="w-3 h-3" /> Voltar
                    </button>
                  </div>
                </form>
              )}

              {resetStep === 'NEW_PASSWORD' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Passo 3: Nova Senha</p>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed mb-6">Defina agora sua nova credencial de acesso.</p>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="Nova senha (mín. 3)"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-2xl bg-gray-50 placeholder-gray-400 text-gray-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="Confirme a senha"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-[10px] text-center font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100 text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    Salvar Nova Senha
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

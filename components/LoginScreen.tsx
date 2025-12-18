
import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, Building2, UserCog } from 'lucide-react';
import { UserRole, User } from '../types';

interface Props {
  onLogin: (username: string, role: UserRole) => void;
  users: User[];
}

export const LoginScreen: React.FC<Props> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Dynamic Validation Logic
      const foundUser = users.find(u => u.name === username && u.role === selectedRole);
      
      let isValid = false;

      if (foundUser) {
        if (foundUser.password === password) {
          isValid = true;
        } else {
          setError('Senha incorreta.');
        }
      } else {
         setError(`Usuário "${username}" não encontrado para a função ${selectedRole}.`);
      }

      if (isValid) {
        onLogin(username, selectedRole);
      } else {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 p-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-white/50 backdrop-blur-sm overflow-hidden">
          
          {/* Header */}
          <div className="bg-indigo-600 p-8 text-center relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10">
               <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                 <Building2 className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">MEI-GeradorNf</h1>
               <p className="text-indigo-200 text-sm">Acesso ao Sistema</p>
             </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('ADMIN'); setError(null); }}
                  className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedRole === 'ADMIN' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('OPERATOR'); setError(null); }}
                  className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedRole === 'OPERATOR' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  Operador
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 text-gray-800 font-medium drop-shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                    placeholder={selectedRole === 'ADMIN' ? "Usuário: admin" : "Usuário: operador"}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 text-gray-800 font-medium drop-shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Acesso Seguro
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-xs mt-6">
          &copy; {new Date().getFullYear()} MEI-GeradorNf. Secure Access.
        </p>
      </div>
    </div>
  );
};

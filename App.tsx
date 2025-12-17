
import React, { useState, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { ModernInvoice } from './components/ModernInvoice';
import { ReceiptPreview } from './components/ReceiptPreview';
import { LoginScreen } from './components/LoginScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { InvoiceData, AppState, TabView, User, UserRole, AppSettings } from './types';
import { extractInvoiceData } from './services/geminiService';
import { Printer, FileCheck, FileSignature, AlertTriangle, LogOut, Shield, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  // --- Global State ---
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'admin', password: '123456', role: 'ADMIN' },
    { id: '2', name: 'operador', password: '123', role: 'OPERATOR' }
  ]);

  const [settings, setSettings] = useState<AppSettings>({
    logoUrl: null,
    qrCodeUrl: null
  });

  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('INVOICE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleLogin = (username: string, role: UserRole) => {
    const u = users.find(u => u.name === username && u.role === role);
    if(u) setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
  };

  const handleFileSelect = async (file: File) => {
    setState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const mimeType = file.type;
        const base64Data = base64.split(',')[1];

        try {
          const extractedData = await extractInvoiceData(base64Data, mimeType);
          setData(extractedData);
          setState(AppState.PREVIEW);
        } catch (err: any) {
          console.error(err);
          const message = err.message || "Erro ao processar o documento. Verifique se é uma Nota Fiscal válida.";
          setErrorMsg(message);
          setState(AppState.ERROR);
        }
      };
      reader.onerror = () => {
        setErrorMsg("Erro ao ler o arquivo.");
        setState(AppState.ERROR);
      };
    } catch (e) {
      setErrorMsg("Ocorreu um erro inesperado.");
      setState(AppState.ERROR);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    if (data && data.number) {
      const type = activeTab === 'INVOICE' ? 'NF' : 'Recibo';
      const providerName = data.provider.name?.split(' ')[0] || 'MEI';
      document.title = `${type}-${data.number}-${providerName}`;
    }
    
    // Slight delay to ensure DOM updates and title change are respected
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 150);
  };

  const handleReset = () => {
    setData(null);
    setState(AppState.UPLOAD);
    setErrorMsg(null);
  };

  const toggleSettings = () => {
    if (state === AppState.SETTINGS) {
      handleReset();
    } else {
      setState(AppState.SETTINGS);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <nav className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center no-print sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-2 cursor-pointer select-none transition-transform active:scale-95" onClick={handleReset}>
          <div className="bg-indigo-600 text-white font-black rounded-xl p-2 text-xl shadow-lg shadow-indigo-100">MEI</div>
          <div>
            <span className="font-black text-gray-900 text-lg block leading-tight tracking-tighter">Smart Doc</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
            <div className={`p-1.5 rounded-xl ${user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white shadow-md shadow-emerald-100'}`}>
              {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-gray-900 leading-none">{user.name}</span>
              <span className="text-[10px] font-bold text-gray-400 leading-none mt-1 uppercase tracking-widest">{user.role}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden lg:block mx-1"></div>

          {user.role === 'ADMIN' && (
             <button
               onClick={toggleSettings}
               title="Configurações"
               type="button"
               className={`p-2.5 rounded-xl transition-all ${state === AppState.SETTINGS ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
             >
               <SettingsIcon className="w-5 h-5" />
             </button>
          )}

          {state === AppState.PREVIEW && (
            <div className="flex gap-2">
               <button 
                 onClick={handleReset}
                 type="button"
                 className="text-gray-500 hover:text-gray-900 px-4 py-2 text-sm font-bold transition-colors hidden sm:block uppercase tracking-wider"
               >
                 Novo
               </button>
               <button 
                 onClick={handlePrint}
                 type="button"
                 className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl transition-all active:scale-95 hover:shadow-gray-900/20 uppercase tracking-wider"
               >
                 <Printer className="w-4 h-4" />
                 <span className="hidden md:inline whitespace-nowrap">Imprimir / Salvar PDF</span>
                 <span className="md:hidden">PDF</span>
               </button>
            </div>
          )}

          <button 
            onClick={handleLogout}
            title="Sair do sistema"
            type="button"
            className="text-gray-300 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50 transition-all active:scale-90"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-start p-8 print:p-0 print:m-0 print:bg-white relative">
        {state === AppState.UPLOAD && (
          <div className="mt-16 w-full flex flex-col items-center animate-fade-in max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 text-center tracking-tighter">
              Olá, <span className="text-indigo-600 uppercase">{user.name}</span>
            </h1>
            <p className="text-gray-400 font-medium text-center max-w-xl mb-16 text-lg">
              Pronto para processar seus documentos fiscais MEI? <br/>
              A tecnologia de IA cuida de toda a extração para você.
            </p>
            <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {state === AppState.SETTINGS && (
          <SettingsScreen 
            users={users} 
            setUsers={setUsers} 
            settings={settings}
            setSettings={setSettings}
            onClose={handleReset}
          />
        )}

        {state === AppState.PROCESSING && (
           <div className="mt-20 w-full flex flex-col items-center">
             <FileUpload onFileSelect={() => {}} isProcessing={true} />
           </div>
        )}

        {state === AppState.ERROR && (
           <div className="mt-20 text-center max-w-md animate-fade-in bg-white p-12 rounded-[2rem] shadow-2xl border border-gray-50">
             <div className="bg-rose-50 p-6 rounded-3xl inline-flex mb-8">
               <AlertTriangle className="w-10 h-10 text-rose-500" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Eita! Algo travou.</h3>
             <p className="text-gray-500 font-medium mb-10 leading-relaxed">{errorMsg}</p>
             <button 
               onClick={handleReset}
               type="button"
               className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black uppercase tracking-widest transition-all active:scale-95"
             >
               Tentar Novamente
             </button>
           </div>
        )}

        {state === AppState.PREVIEW && data && (
          <div className="w-full max-w-5xl flex flex-col gap-10 print:block print:w-full mt-10">
            {/* Component-integrated print buttons are inside the document components */}
            <div className="flex justify-center mb-6 no-print">
               <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex">
                 <button
                   onClick={() => setActiveTab('INVOICE')}
                   type="button"
                   className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 uppercase tracking-wider
                     ${activeTab === 'INVOICE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-700 hover:bg-white'}
                   `}
                 >
                   <FileCheck className="w-4 h-4" /> Nota Fiscal
                 </button>
                 <button
                   onClick={() => setActiveTab('RECEIPT')}
                   type="button"
                   className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 uppercase tracking-wider
                     ${activeTab === 'RECEIPT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-700 hover:bg-white'}
                   `}
                 >
                   <FileSignature className="w-4 h-4" /> Recibo Formal
                 </button>
               </div>
            </div>

            <div className="w-full flex justify-center print:block print:w-full">
               {activeTab === 'INVOICE' ? (
                 <ModernInvoice data={data} refProp={invoiceRef} settings={settings} />
               ) : (
                 <ReceiptPreview data={data} settings={settings} />
               )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-gray-300 text-xs font-bold uppercase tracking-[0.3em] no-print">
        <p>&copy; {new Date().getFullYear()} MEI Smart Doc &bull; Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;

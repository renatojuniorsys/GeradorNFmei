import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ModernInvoice } from './components/ModernInvoice';
import { ReceiptPreview } from './components/ReceiptPreview';
import { LoginScreen } from './components/LoginScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { InvoiceData, AppState, TabView, User, UserRole, AppSettings } from './types';
import { extractInvoiceData } from './services/geminiService';
import { Printer, FileCheck, FileSignature, AlertTriangle, LogOut, Shield, User as UserIcon, Settings as SettingsIcon, FileStack } from 'lucide-react';

const App: React.FC = () => {
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
  const [isPrintingAll, setIsPrintingAll] = useState(false);

  // Sound Synthesis Logic
  const playClickSound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
      
      setTimeout(() => {
        if (audioCtx.state !== 'closed') audioCtx.close();
      }, 100);
    } catch (e) {
      console.warn("Audio feedback not supported or blocked by browser.");
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      playClickSound();
    };
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

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
          const message = err.message || "Não foi possível processar o documento. Verifique se o arquivo é uma nota fiscal válida ou tente novamente.";
          setErrorMsg(message);
          setState(AppState.ERROR);
        }
      };
    } catch (e) {
      setErrorMsg("Erro de leitura do arquivo.");
      setState(AppState.ERROR);
    }
  };

  const handlePrintCurrent = () => {
    const originalTitle = document.title;
    if (data && data.number) {
      const type = activeTab === 'INVOICE' ? 'NF' : 'Recibo';
      const provider = data.provider.name?.split(' ')[0] || 'MEI';
      document.title = `${type}-${data.number}-${provider}`;
    }
    setIsPrintingAll(false);
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 200);
  };

  const handlePrintAll = () => {
    const originalTitle = document.title;
    if (data && data.number) {
      const provider = data.provider.name?.split(' ')[0] || 'MEI';
      document.title = `COMPLETO-${data.number}-${provider}`;
    }
    setIsPrintingAll(true);
    // Give react a tick to render the print-only div if we were using state for visibility
    // Although our CSS handles it via .print-only { display: block !important; } during @media print
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setIsPrintingAll(false);
    }, 200);
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
      <nav className="bg-white border-b border-gray-100 py-3 px-8 flex justify-between items-center no-print sticky top-0 z-50 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="flex items-center gap-3 cursor-pointer select-none transition-transform active:scale-95" onClick={handleReset}>
          <div className="bg-indigo-600 text-white font-black rounded-2xl p-2.5 text-xl shadow-xl shadow-indigo-100">MEI</div>
          <div>
            <span className="font-black text-gray-900 text-xl block leading-tight tracking-tighter">Smart Doc</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-[1.25rem] border border-gray-100">
            <div className={`p-2 rounded-xl ${user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
              {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{user.role}</span>
              <span className="text-sm font-black text-gray-900 leading-none">{user.name}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden lg:block mx-1"></div>

          {user.role === 'ADMIN' && (
             <button
               onClick={toggleSettings}
               className={`p-3 rounded-2xl transition-all ${state === AppState.SETTINGS ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
             >
               <SettingsIcon className="w-5 h-5" />
             </button>
          )}

          {state === AppState.PREVIEW && (
            <div className="flex gap-2">
               <button 
                 onClick={handlePrintAll}
                 title="Baixar NF e Recibo juntos"
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest border border-emerald-500/20"
               >
                 <FileStack className="w-4 h-4" />
                 <span className="hidden xl:inline">Pacote Completo</span>
               </button>
               <button 
                 onClick={handlePrintCurrent}
                 className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest"
               >
                 <Printer className="w-4 h-4" />
                 <span className="hidden md:inline">Salvar PDF</span>
               </button>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="text-gray-300 hover:text-red-600 p-3 rounded-2xl hover:bg-red-50 transition-all active:scale-90"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-start p-10 print:p-0 print:m-0 print:bg-white relative">
        {state === AppState.UPLOAD && (
          <div className="mt-20 w-full flex flex-col items-center animate-fade-in max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 text-center tracking-tighter">
              Olá, <span className="text-indigo-600 uppercase">{user.name}</span>
            </h1>
            <p className="text-gray-400 font-bold text-center max-w-xl mb-20 text-xl leading-relaxed">
              Bem-vindo ao futuro da gestão fiscal. <br/>
              Processamento inteligente de documentos MEI.
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
           <div className="mt-24 w-full flex flex-col items-center">
             <FileUpload onFileSelect={() => {}} isProcessing={true} />
           </div>
        )}

        {state === AppState.ERROR && (
           <div className="mt-24 text-center max-w-lg animate-fade-in bg-white p-16 rounded-[3rem] shadow-2xl border border-gray-50">
             <div className="bg-rose-50 p-8 rounded-[2rem] inline-flex mb-10">
               <AlertTriangle className="w-12 h-12 text-rose-500" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Ocorreu um erro</h3>
             <p className="text-gray-500 font-bold mb-12 leading-relaxed text-lg">{errorMsg}</p>
             <button 
               onClick={handleReset}
               className="bg-indigo-600 text-white px-10 py-5 rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest transition-all active:scale-95"
             >
               Recomeçar
             </button>
           </div>
        )}

        {state === AppState.PREVIEW && data && (
          <div className="w-full max-w-5xl flex flex-col gap-12 print:hidden mt-10">
            <div className="flex justify-center mb-4 no-print">
               <div className="bg-white/40 backdrop-blur-2xl p-2 rounded-[1.5rem] shadow-sm border border-gray-100 inline-flex">
                 <button
                   onClick={() => setActiveTab('INVOICE')}
                   className={`px-10 py-4 rounded-[1.25rem] text-sm font-black transition-all flex items-center gap-2 uppercase tracking-widest
                     ${activeTab === 'INVOICE' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-800 hover:bg-white'}
                   `}
                 >
                   <FileCheck className="w-5 h-5" /> Nota Fiscal
                 </button>
                 <button
                   onClick={() => setActiveTab('RECEIPT')}
                   className={`px-10 py-4 rounded-[1.25rem] text-sm font-black transition-all flex items-center gap-2 uppercase tracking-widest
                     ${activeTab === 'RECEIPT' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-800 hover:bg-white'}
                   `}
                 >
                   <FileSignature className="w-5 h-5" /> Recibo Formal
                 </button>
               </div>
            </div>

            <div className="w-full flex justify-center">
               {activeTab === 'INVOICE' ? (
                 <ModernInvoice data={data} settings={settings} />
               ) : (
                 <ReceiptPreview data={data} settings={settings} />
               )}
            </div>
          </div>
        )}

        {/* Print only section containing both documents */}
        {data && (
          <div className="print-only w-[210mm] print:block">
            <div className="page-break">
              <ModernInvoice data={data} settings={settings} />
            </div>
            <div>
              <ReceiptPreview data={data} settings={settings} />
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.5em] no-print">
        <p>&copy; {new Date().getFullYear()} MEI Smart Doc &bull; Enterprise Edition</p>
      </footer>
    </div>
  );
};

export default App;
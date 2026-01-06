
import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ModernInvoice } from './components/ModernInvoice';
import { ReceiptPreview } from './components/ReceiptPreview';
import { LoginScreen } from './components/LoginScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DocumentLibrary } from './components/DocumentLibrary';
import { InvoiceData, AppState, TabView, User, UserRole, AppSettings, HistoryItem, PdfMargins } from './types';
import { extractInvoiceData } from './services/geminiService';
import { formatDate, formatCurrency } from './services/utils';
import { 
  FileCheck, 
  FileSignature, 
  AlertTriangle, 
  LogOut, 
  Settings as SettingsIcon, 
  FileStack, 
  Loader2, 
  Files, 
  XCircle, 
  CheckCircle2, 
  Info, 
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  Share2
} from 'lucide-react';

declare const html2pdf: any;

interface Notification {
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'LOADING';
  message: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'admin', password: '123456', role: 'ADMIN' },
    { id: '2', name: 'operador', password: '123', role: 'OPERATOR' }
  ]);

  const [settings, setSettings] = useState<AppSettings>({
    logoUrl: null,
    qrCodeUrl: null,
    signatureUrl: null,
    pdfMargins: { top: 40, bottom: 40, left: 40, right: 40 }
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('INVOICE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...parsed,
          pdfMargins: parsed.pdfMargins || { top: 40, bottom: 40, left: 40, right: 40 }
        });
      } catch (e) { console.error(e); }
    }
    const savedHistory = localStorage.getItem('invoice_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  useEffect(() => { localStorage.setItem('invoice_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('app_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);

  const showNotification = (type: Notification['type'], message: string, duration = 4000) => {
    setNotification({ type, message });
    if (type !== 'LOADING') setTimeout(() => setNotification(null), duration);
  };

  const saveToHistory = (newData: InvoiceData) => {
    const newItem: HistoryItem = { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), data: newData };
    setHistory(prev => [newItem, ...prev].slice(0, 30));
  };

  const handleLogin = (username: string, role: UserRole) => {
    const u = users.find(u => u.name === username && u.role === role);
    if(u) setUser(u);
  };

  const handleUpdatePassword = (username: string, role: UserRole, newPassword: string) => {
    setUsers(prev => prev.map(u => u.name === username && u.role === role ? { ...u, password: newPassword } : u ));
    return true;
  };

  const handleLogout = () => { setUser(null); handleReset(); };

  const handleUpdateMargins = (newMargins: PdfMargins) => {
    setSettings(prev => ({ ...prev, pdfMargins: newMargins }));
  };

  const handleUpdateData = (newData: InvoiceData) => {
    setData(newData);
    // Atualiza também no histórico se for a nota atual
    setHistory(prev => prev.map(item => item.data.accessKey === newData.accessKey || item.data.number === newData.number ? { ...item, data: newData } : item));
  };

  const handleFileSelect = async (file: File) => {
    setState(AppState.PROCESSING);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      try {
        const extractedData = await extractInvoiceData(base64Data, file.type);
        setData(extractedData);
        saveToHistory(extractedData);
        setState(AppState.PREVIEW);
        showNotification('SUCCESS', 'Documento processado com sucesso!');
      } catch (err: any) {
        setErrorMsg(err.message || "Falha ao processar documento.");
        setState(AppState.ERROR);
        showNotification('ERROR', 'Falha na leitura.');
      }
    };
    reader.readAsDataURL(file);
  };

  const waitForImages = async (container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll('img'));
    const promises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 2500); // Timeout de segurança
        img.onload = () => { clearTimeout(timeout); resolve(); };
        img.onerror = () => { clearTimeout(timeout); resolve(); };
      });
    });
    return Promise.all(promises);
  };

  const generatePdfBlob = async (type: 'INVOICE' | 'RECEIPT' | 'BOTH'): Promise<{blob: Blob, fileName: string} | null> => {
    if (!data) return null;
    const renderZone = document.getElementById('pdf-render-zone');
    if (!renderZone) throw new Error("Ambiente de renderização não encontrado.");
    renderZone.innerHTML = '';
    
    const fileName = `${type}-${data.number || '00'}-${data.provider.name?.split(' ')[0]}.pdf`;
    const invoiceEl = document.querySelector('.invoice-hidden-source .print-container');
    const receiptEl = document.querySelector('.receipt-hidden-source .print-container');

    const elements = [];
    if ((type === 'INVOICE' || type === 'BOTH') && invoiceEl) elements.push(invoiceEl);
    if ((type === 'RECEIPT' || type === 'BOTH') && receiptEl) elements.push(receiptEl);

    const captureContainer = document.createElement('div');
    elements.forEach(el => {
      const page = document.createElement('div');
      page.className = 'pdf-page-A4';
      page.appendChild(el.cloneNode(true));
      captureContainer.appendChild(page);
    });
    renderZone.appendChild(captureContainer);

    await waitForImages(captureContainer);
    await new Promise(r => setTimeout(r, 400));

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const blob = await html2pdf().from(captureContainer).set(opt).output('blob');
    renderZone.innerHTML = '';
    return { blob, fileName };
  };

  const downloadPDF = async (type: 'INVOICE' | 'RECEIPT' | 'BOTH') => {
    if (isDownloading) return;
    setIsDownloading(true);
    showNotification('LOADING', 'Gerando arquivo de alta fidelidade...');
    try {
      const result = await generatePdfBlob(type);
      if (result) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('SUCCESS', 'Arquivo pronto!');
      }
    } catch (e: any) {
      showNotification('ERROR', 'Erro ao gerar arquivo.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => { setData(null); setState(AppState.UPLOAD); setErrorMsg(null); setNotification(null); };

  if (!user) return <LoginScreen onLogin={handleLogin} onUpdatePassword={handleUpdatePassword} users={users} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-pop-in px-4 w-full max-w-sm">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${
            notification.type === 'SUCCESS' ? 'bg-emerald-600 text-white border-emerald-500' :
            notification.type === 'ERROR' ? 'bg-rose-600 text-white border-rose-500' :
            notification.type === 'LOADING' ? 'bg-gray-900 text-white border-gray-800' :
            'bg-indigo-600 text-white border-indigo-500'
          }`}>
            {notification.type === 'LOADING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />}
            <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="hidden-print-sources" style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0 }}>
        <div className="invoice-hidden-source">{data && <ModernInvoice data={data} settings={settings} isPrinting={true} />}</div>
        <div className="receipt-hidden-source">{data && <ReceiptPreview data={data} settings={settings} isPrinting={true} />}</div>
      </div>

      <nav className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center no-print sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
          <div className="bg-indigo-600 text-white font-black rounded-xl p-2.5 text-xl">NF</div>
          <span className="font-black text-gray-900 text-xl tracking-tighter">MeiGerador-NFS-e</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setState(AppState.HISTORY)} className="text-gray-400 hover:text-indigo-600 p-2"><Files className="w-5 h-5" /></button>
          <button onClick={() => setState(AppState.SETTINGS)} className="text-gray-400 hover:text-indigo-600 p-2"><SettingsIcon className="w-5 h-5" /></button>
          <button onClick={handleLogout} className="text-gray-300 hover:text-red-600 p-2"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="flex-grow p-4 sm:p-10 flex flex-col items-center">
        {state === AppState.UPLOAD && (
          <div className="w-full max-w-5xl mt-10">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Olá, <span className="text-indigo-600 uppercase">{user.name}</span></h1>
              <p className="text-gray-400 font-bold text-xl">Arraste sua nota fiscal para começar.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7"><FileUpload onFileSelect={handleFileSelect} isProcessing={false} /></div>
              <div className="lg:col-span-5 flex flex-col gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-indigo-600 p-3 rounded-2xl text-white"><LayoutGrid className="w-6 h-6" /></div>
                      <h3 className="text-lg font-black uppercase">Menu Rápido</h3>
                    </div>
                    <button onClick={() => setState(AppState.HISTORY)} className="w-full flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:text-white group transition-all">
                      <span className="font-black uppercase text-[10px] tracking-widest">Biblioteca de Notas</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {state === AppState.PROCESSING && <FileUpload onFileSelect={handleFileSelect} isProcessing={true} />}
        
        {state === AppState.PREVIEW && data && (
          <div className="w-full max-w-6xl animate-fade-in flex flex-col items-center gap-6">
            <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-xl">
               <button onClick={() => setActiveTab('INVOICE')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'INVOICE' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Nota Fiscal</button>
               <button onClick={() => setActiveTab('RECEIPT')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'RECEIPT' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Recibo</button>
            </div>
            {activeTab === 'INVOICE' ? (
              <ModernInvoice 
                data={data} 
                settings={settings} 
                isDownloading={isDownloading} 
                onDownloadInvoice={() => downloadPDF('INVOICE')} 
                onUpdateMargins={handleUpdateMargins}
                onUpdateData={handleUpdateData}
              />
            ) : (
              <ReceiptPreview 
                data={data} 
                settings={settings} 
                isDownloading={isDownloading} 
                onDownloadInvoice={() => downloadPDF('RECEIPT')} 
                onUpdateMargins={handleUpdateMargins}
              />
            )}
            <button onClick={() => downloadPDF('BOTH')} disabled={isDownloading} className="fixed bottom-10 right-10 bg-emerald-600 text-white p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50">
              {isDownloading ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileStack className="w-8 h-8" />}
            </button>
          </div>
        )}

        {state === AppState.HISTORY && <DocumentLibrary items={history} onClose={handleReset} onView={(item) => { setData(item.data); setState(AppState.PREVIEW); }} onDelete={(id) => setHistory(h => h.filter(i => i.id !== id))} />}
        {state === AppState.SETTINGS && <SettingsScreen users={users} setUsers={setUsers} settings={settings} setSettings={setSettings} onClose={handleReset} history={history} setHistory={setHistory} />}
        
        {state === AppState.ERROR && (
          <div className="mt-20 text-center bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase mb-2">Erro no Processamento</h2>
            <p className="text-gray-500 mb-8">{errorMsg}</p>
            <button onClick={handleReset} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Tentar novamente</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

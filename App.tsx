
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
  Download, 
  Loader2, 
  History as HistoryIcon,
  Trash2,
  Eye,
  ChevronLeft,
  Calendar,
  User as UserIcon,
  Share2,
  Files,
  XCircle,
  CheckCircle2,
  Info,
  Database
} from 'lucide-react';
import { InfoTooltip } from './components/InfoTooltip';

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
      } catch (e) {
        console.error("Erro ao carregar settings:", e);
      }
    }

    const savedHistory = localStorage.getItem('invoice_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  useEffect(() => {
    localStorage.setItem('invoice_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const showNotification = (type: Notification['type'], message: string, duration = 4000) => {
    setNotification({ type, message });
    if (type !== 'LOADING') {
      setTimeout(() => setNotification(null), duration);
    }
  };

  const saveToHistory = (newData: InvoiceData) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      data: newData
    };
    setHistory(prev => [newItem, ...prev].slice(0, 30));
  };

  const handleLogin = (username: string, role: UserRole) => {
    const u = users.find(u => u.name === username && u.role === role);
    if(u) setUser(u);
  };

  const handleUpdatePassword = (username: string, role: UserRole, newPassword: string) => {
    setUsers(prev => prev.map(u => 
      u.name === username && u.role === role ? { ...u, password: newPassword } : u
    ));
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
  };

  const handleFileSelect = async (file: File) => {
    setState(AppState.PROCESSING);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const mimeType = file.type;
      const base64Data = base64.split(',')[1];

      try {
        const extractedData = await extractInvoiceData(base64Data, mimeType);
        setData(extractedData);
        saveToHistory(extractedData);
        setState(AppState.PREVIEW);
        showNotification('SUCCESS', 'Documento processado com sucesso!');
      } catch (err: any) {
        let finalMessage = "Não foi possível processar o documento.";
        
        // Tenta parsear erro da API do Gemini (que muitas vezes vem como string JSON)
        try {
          const parsedError = typeof err.message === 'string' ? JSON.parse(err.message) : err;
          if (parsedError.error?.code === 403) {
            finalMessage = "Erro de Autenticação: A chave de API expirou ou foi bloqueada. Contate o administrador.";
          } else if (parsedError.error?.message) {
            finalMessage = `Erro na Extração: ${parsedError.error.message}`;
          }
        } catch (e) {
          finalMessage = err.message || finalMessage;
        }

        setErrorMsg(finalMessage);
        setState(AppState.ERROR);
        showNotification('ERROR', 'Falha na comunicação com a IA.');
      }
    };
    reader.readAsDataURL(file);
  };

  const waitForImages = (container: HTMLElement): Promise<void[]> => {
    const images = Array.from(container.querySelectorAll('img'));
    const promises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
    });
    return Promise.all(promises);
  };

  const generatePdfBlob = async (type: 'INVOICE' | 'RECEIPT' | 'BOTH'): Promise<{blob: Blob, fileName: string} | null> => {
    if (!data) return null;
    
    const renderZone = document.getElementById('pdf-render-zone');
    if (!renderZone) throw new Error("Zona de renderização não encontrada.");

    renderZone.innerHTML = '';
    
    const providerName = data.provider.name?.split(' ')[0] || 'MEI';
    const fileName = `${type === 'BOTH' ? 'PACOTE' : type}-${data.number || '00'}-${providerName}.pdf`;

    const invoiceElement = document.querySelector('.invoice-hidden-source .print-container');
    const receiptElement = document.querySelector('.receipt-hidden-source .print-container');

    const elementsToCapture = [];
    if ((type === 'INVOICE' || type === 'BOTH') && invoiceElement) {
      elementsToCapture.push(invoiceElement);
    }
    if ((type === 'RECEIPT' || type === 'BOTH') && receiptElement) {
      elementsToCapture.push(receiptElement);
    }

    if (elementsToCapture.length === 0) {
      const activePreview = document.querySelector('.print-container');
      if (activePreview) elementsToCapture.push(activePreview);
      else throw new Error("Conteúdo não preparado. Tente novamente.");
    }

    const captureContainer = document.createElement('div');
    captureContainer.style.backgroundColor = 'white';

    elementsToCapture.forEach((el) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page-A4';
      
      const clone = el.cloneNode(true) as HTMLElement;
      
      const originalCanvases = el.querySelectorAll('canvas');
      const cloneCanvases = clone.querySelectorAll('canvas');
      originalCanvases.forEach((orig, i) => {
        const dest = cloneCanvases[i] as HTMLCanvasElement;
        if (dest) {
          dest.width = (orig as HTMLCanvasElement).width;
          dest.height = (orig as HTMLCanvasElement).height;
          dest.getContext('2d')?.drawImage(orig as HTMLCanvasElement, 0, 0);
        }
      });

      pageDiv.appendChild(clone);
      captureContainer.appendChild(pageDiv);
    });

    renderZone.appendChild(captureContainer);

    await waitForImages(captureContainer);
    await new Promise(r => setTimeout(r, 500)); 

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
    };
    
    try {
      const blob = await html2pdf().from(captureContainer).set(opt).output('blob');
      renderZone.innerHTML = '';
      return { blob, fileName };
    } catch (e) {
      renderZone.innerHTML = '';
      throw new Error("Falha na geração do arquivo PDF.");
    }
  };

  const downloadPDF = async (type: 'INVOICE' | 'RECEIPT' | 'BOTH') => {
    setIsDownloading(true);
    showNotification('LOADING', 'Gerando documento em alta definição...');
    
    try {
      const result = await generatePdfBlob(type);
      if (result) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('SUCCESS', 'Download concluído com sucesso!');
      }
    } catch (error: any) {
      console.error("Erro PDF:", error);
      showNotification('ERROR', error.message || "Ocorreu um erro ao baixar o PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const shareFullPdf = async () => {
    if (!navigator.share) {
      showNotification('INFO', 'Navegador não suporta compartilhamento direto.');
      downloadPDF('BOTH');
      return;
    }

    setIsDownloading(true);
    showNotification('LOADING', 'Processando documento para compartilhamento...');

    try {
      const result = await generatePdfBlob('BOTH');
      if (result) {
        const file = new File([result.blob], result.fileName, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `NF-e ${data?.number}`,
            text: `Documento fiscal gerado para ${data?.provider.name}`
          });
          showNotification('SUCCESS', 'Compartilhamento concluído!');
        } else {
          showNotification('INFO', 'Erro ao anexar arquivo.');
          downloadPDF('BOTH');
        }
      }
    } catch (error: any) {
      console.error("Erro Share:", error);
      showNotification('ERROR', "Falha ao compartilhar.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setState(AppState.UPLOAD);
    setErrorMsg(null);
    setNotification(null);
  };

  const updateMargins = (newMargins: PdfMargins) => {
    setSettings(prev => ({ ...prev, pdfMargins: newMargins }));
  };

  const updateData = (updatedData: InvoiceData) => {
    setData(updatedData);
  };

  const toggleSettings = () => {
    setState(state === AppState.SETTINGS ? AppState.UPLOAD : AppState.SETTINGS);
  };

  const toggleHistory = () => {
    setState(state === AppState.HISTORY ? AppState.UPLOAD : AppState.HISTORY);
  };

  const deleteHistoryItem = (id: string) => {
    if(confirm('Deseja realmente excluir este histórico?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
      showNotification('INFO', 'Histórico atualizado.');
    }
  };

  const viewHistoryItem = (item: HistoryItem) => {
    setData(item.data);
    setState(AppState.PREVIEW);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onUpdatePassword={handleUpdatePassword} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-pop-in no-print px-4 w-full max-w-sm">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${
            notification.type === 'SUCCESS' ? 'bg-emerald-600 text-white border-emerald-500' :
            notification.type === 'ERROR' ? 'bg-rose-600 text-white border-rose-500' :
            notification.type === 'LOADING' ? 'bg-gray-900 text-white border-gray-800' :
            'bg-indigo-600 text-white border-indigo-500'
          }`}>
            <div className="shrink-0">
              {notification.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5" />}
              {notification.type === 'ERROR' && <XCircle className="w-5 h-5" />}
              {notification.type === 'LOADING' && <Loader2 className="w-5 h-5 animate-spin" />}
              {notification.type === 'INFO' && <Info className="w-5 h-5" />}
            </div>
            <p className="text-xs font-black uppercase tracking-widest leading-tight">{notification.message}</p>
            {notification.type !== 'LOADING' && (
              <button onClick={() => setNotification(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="hidden-print-sources" style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
        <div className="invoice-hidden-source">
          {data && <ModernInvoice data={data} settings={settings} isPrinting={true} />}
        </div>
        <div className="receipt-hidden-source">
          {data && <ReceiptPreview data={data} settings={settings} isPrinting={true} />}
        </div>
      </div>

      <nav className="bg-white/90 border-b border-gray-100 py-3 sm:py-4 px-4 sm:px-8 flex justify-between items-center no-print sticky top-0 z-50 shadow-sm backdrop-blur-xl">
        <div className="group flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition-all duration-300 active:scale-95" onClick={handleReset}>
          <div className="bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-base sm:text-xl shadow-xl shadow-indigo-100 transition-all">NF</div>
          <div className="transition-transform duration-300">
            <span className="font-black text-gray-900 text-sm sm:text-xl block leading-tight tracking-tighter">
              <span className="hidden xs:inline">MEI-</span>SmartDoc
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-6">
          <button onClick={toggleHistory} className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${state === AppState.HISTORY ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
            <Files className="w-4 h-4" />
            <span className="hidden md:inline">Arquivo</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleSettings} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${state === AppState.SETTINGS ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {state === AppState.PREVIEW && (
              <div className="flex gap-1.5 sm:gap-2">
                <button onClick={() => shareFullPdf()} disabled={isDownloading} className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs font-black uppercase tracking-widest">Share</span>
                </button>
                <button onClick={() => downloadPDF('BOTH')} disabled={isDownloading} className="bg-emerald-600 text-white p-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-xl disabled:opacity-50">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileStack className="w-4 h-4" />}
                  <span className="hidden lg:inline text-xs font-black uppercase tracking-widest">Download</span>
                </button>
              </div>
            )}

            <button onClick={handleLogout} className="text-gray-300 hover:text-red-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-10 no-print relative overflow-x-hidden">
        {state === AppState.UPLOAD && (
          <div className="mt-8 sm:mt-20 w-full flex flex-col items-center animate-fade-in max-w-4xl text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tighter px-4">Olá, <span className="text-indigo-600 uppercase">{user.name}</span></h1>
            <p className="text-gray-400 font-bold max-w-xl mb-12 sm:mb-20 text-sm sm:text-xl leading-relaxed px-6">Emita seus recibos e organize sua contabilidade em segundos.</p>
            <div className="w-full flex flex-col items-center gap-10">
              <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
            </div>
          </div>
        )}

        {state === AppState.HISTORY && <DocumentLibrary items={history} settings={settings} onView={viewHistoryItem} onDelete={deleteHistoryItem} onClose={handleReset} />}
        {state === AppState.SETTINGS && (
          <SettingsScreen 
            users={users} 
            setUsers={setUsers} 
            settings={settings} 
            setSettings={setSettings} 
            onClose={handleReset} 
            history={history}
            setHistory={setHistory}
          />
        )}
        {state === AppState.PROCESSING && <FileUpload onFileSelect={handleFileSelect} isProcessing={true} />}
        {state === AppState.ERROR && (
          <div className="mt-20 w-full max-w-md animate-pop-in bg-white p-10 rounded-[2.5rem] border border-red-100 shadow-2xl text-center">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-red-500" /></div>
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-4">Problema Encontrado</h2>
            <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed px-4">{errorMsg}</p>
            <button onClick={handleReset} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95">Tentar Novamente</button>
          </div>
        )}

        {state === AppState.PREVIEW && data && (
          <div className="w-full max-w-6xl animate-fade-in mt-2 flex flex-col items-center gap-0">
            {/* TABS NAVEGAÇÃO - Movidas para cima e integradas */}
            <div className="flex p-1 bg-white/80 border border-gray-100 rounded-2xl sm:rounded-[2rem] shadow-xl z-40 backdrop-blur-md mb-[-1.5rem] relative translate-y-[-0.5rem]">
               <button 
                 onClick={() => setActiveTab('INVOICE')} 
                 className={`px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'INVOICE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
               >
                 <FileCheck className="w-4 h-4" /> <span className="hidden xs:inline">Nota Fiscal</span><span className="xs:hidden">Nota</span>
               </button>
               <button 
                 onClick={() => setActiveTab('RECEIPT')} 
                 className={`px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'RECEIPT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
               >
                 <FileSignature className="w-4 h-4" /> <span className="hidden xs:inline">Recibo Formal</span><span className="xs:hidden">Recibo</span>
               </button>
            </div>

            {activeTab === 'INVOICE' ? (
              <ModernInvoice 
                data={data} 
                settings={settings} 
                isSuccess={false} 
                isDownloading={isDownloading} 
                onUpdateMargins={updateMargins} 
                onUpdateData={updateData} 
                onDownloadInvoice={() => downloadPDF('INVOICE')} 
                onShareFullPdf={shareFullPdf} 
              />
            ) : (
              <ReceiptPreview 
                data={data} 
                settings={settings} 
                isSuccess={false} 
                onUpdateMargins={updateMargins} 
                onDownloadInvoice={() => downloadPDF('RECEIPT')} 
              />
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center no-print px-6">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] leading-relaxed">Powered by Gemini 3 Pro AI Engine &bull; Corporate Solutions 2025</p>
      </footer>
    </div>
  );
};

export default App;

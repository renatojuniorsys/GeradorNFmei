
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
  Files
} from 'lucide-react';
import { InfoTooltip } from './components/InfoTooltip';

declare const html2pdf: any;

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
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Carregar configurações com as URLs em Base64 persistidas
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

  // Persistência automática no localStorage
  useEffect(() => {
    localStorage.setItem('invoice_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

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
      } catch (err: any) {
        setErrorMsg(err.message || "Não foi possível processar o documento.");
        setState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerSuccessFeedback = () => {
    setShowSuccessFeedback(true);
    setTimeout(() => setShowSuccessFeedback(false), 3000);
  };

  const generatePdfBlob = async (type: 'INVOICE' | 'RECEIPT' | 'BOTH'): Promise<{blob: Blob, fileName: string} | null> => {
    if (!data) return null;
    
    const renderZone = document.getElementById('pdf-render-zone');
    if (!renderZone) return null;

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

    if (elementsToCapture.length === 0) return null;

    const captureContainer = document.createElement('div');
    captureContainer.style.backgroundColor = 'white';

    elementsToCapture.forEach((el, index) => {
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

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true, precision: 16 }
    };

    // Delay otimizado para renderização segura
    await new Promise(r => setTimeout(r, 2000)); 
    
    const blob = await html2pdf().from(captureContainer).set(opt).output('blob');
    renderZone.innerHTML = '';
    return { blob, fileName };
  };

  const downloadPDF = async (type: 'INVOICE' | 'RECEIPT' | 'BOTH') => {
    setIsDownloading(true);
    try {
      const result = await generatePdfBlob(type);
      if (result) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        link.click();
        URL.revokeObjectURL(url);
        triggerSuccessFeedback();
      }
    } catch (error) {
      console.error("Erro PDF:", error);
      alert("Erro ao gerar o PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const shareFullPdf = async () => {
    if (!navigator.share) {
      downloadPDF('BOTH');
      return;
    }

    setIsDownloading(true);
    try {
      const result = await generatePdfBlob('BOTH');
      if (result) {
        const file = new File([result.blob], result.fileName, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `NF-e ${data?.number}`,
            text: `Segue documento fiscal gerado para ${data?.provider.name}`
          });
        } else {
          downloadPDF('BOTH');
        }
      }
    } catch (error) {
      console.error("Erro Share:", error);
      downloadPDF('BOTH');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setState(AppState.UPLOAD);
    setErrorMsg(null);
    setShowSuccessFeedback(false);
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
    if(confirm('Excluir este registro permanentemente?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
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
      <nav className="bg-white/80 border-b border-gray-100 py-3 sm:py-4 px-4 sm:px-8 flex justify-between items-center no-print sticky top-0 z-50 shadow-sm backdrop-blur-xl">
        <div 
          className="group flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition-all duration-300 active:scale-95" 
          onClick={handleReset}
        >
          <div className="bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-base sm:text-xl shadow-xl shadow-indigo-100 transition-all duration-500 group-hover:rotate-6">
            NF
          </div>
          <div className="transition-transform duration-300 group-hover:translate-x-1">
            <span className="font-black text-gray-900 text-sm sm:text-xl block leading-tight tracking-tighter group-hover:text-indigo-600">
              MEI-GeradorNf
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex items-center gap-1.5">
            <button 
              onClick={toggleHistory}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                state === AppState.HISTORY 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Files className="w-4 h-4" />
              Meus Documentos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <InfoTooltip content="Configurações globais.">
              <button onClick={toggleSettings} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${state === AppState.SETTINGS ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </InfoTooltip>

            {state === AppState.PREVIEW && (
              <div className="flex gap-1.5 sm:gap-2">
                <button onClick={() => shareFullPdf()} disabled={isDownloading} className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs font-black uppercase tracking-widest">Compartilhar</span>
                </button>
                <button onClick={() => downloadPDF('BOTH')} disabled={isDownloading} className="bg-emerald-600 text-white p-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-xl disabled:opacity-50">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileStack className="w-4 h-4" />}
                  <span className="hidden xl:inline text-xs font-black uppercase tracking-widest">Completo</span>
                </button>
              </div>
            )}

            <button onClick={handleLogout} className="text-gray-300 hover:text-red-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-red-50 transition-all active:scale-90">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-10 no-print relative">
        {state === AppState.UPLOAD && (
          <div className="mt-8 sm:mt-20 w-full flex flex-col items-center animate-fade-in max-w-4xl text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tighter">Olá, <span className="text-indigo-600 uppercase">{user.name}</span></h1>
            <p className="text-gray-400 font-bold max-w-xl mb-12 sm:mb-20 text-base sm:text-xl leading-relaxed px-4">Gerencie suas notas MEI de forma profissional e eficiente.</p>
            
            <div className="w-full flex flex-col items-center gap-10">
              <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={toggleHistory}
                  className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-[2rem] text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 group"
                >
                  <Files className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Ver Documentos Salvos
                </button>
                <button 
                  onClick={toggleSettings}
                  className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-[2rem] text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 group"
                >
                  <SettingsIcon className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  Configurar Empresa
                </button>
              </div>
            </div>
          </div>
        )}

        {state === AppState.HISTORY && (
          <DocumentLibrary 
            items={history}
            settings={settings}
            onView={viewHistoryItem}
            onDelete={deleteHistoryItem}
            onClose={handleReset}
          />
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
          <FileUpload onFileSelect={handleFileSelect} isProcessing={true} />
        )}

        {state === AppState.ERROR && (
          <div className="mt-20 w-full max-w-md animate-pop-in bg-white p-10 rounded-[2.5rem] border border-red-100 shadow-2xl text-center">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-4 tracking-tighter">Erro na Extração</h2>
            <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed">{errorMsg}</p>
            <button onClick={handleReset} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95">Tentar Novamente</button>
          </div>
        )}

        {state === AppState.PREVIEW && data && (
          <div className="w-full max-w-6xl animate-fade-in mt-2 flex flex-col items-center gap-8">
            <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] shadow-sm sticky top-24 z-40 backdrop-blur-md">
               <button 
                 onClick={() => setActiveTab('INVOICE')} 
                 className={`px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'INVOICE' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <FileCheck className="w-4 h-4" /> Nota Fiscal
               </button>
               <button 
                 onClick={() => setActiveTab('RECEIPT')} 
                 className={`px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'RECEIPT' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <FileSignature className="w-4 h-4" /> Recibo
               </button>
            </div>

            {activeTab === 'INVOICE' ? (
              <ModernInvoice 
                data={data} 
                settings={settings} 
                isSuccess={showSuccessFeedback} 
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
                isSuccess={showSuccessFeedback} 
                onUpdateMargins={updateMargins}
              />
            )}
          </div>
        )}
      </main>

      <div className="hidden-print-sources fixed -left-[10000px] top-0 pointer-events-none opacity-0">
        <div className="invoice-hidden-source">
          {data && (
            <ModernInvoice 
              data={data} 
              settings={settings} 
              isPrinting={true}
            />
          )}
        </div>
        <div className="receipt-hidden-source">
          {data && (
            <ReceiptPreview 
              data={data} 
              settings={settings} 
              isPrinting={true}
            />
          )}
        </div>
      </div>

      <footer className="py-8 text-center no-print">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Powered by Gemini 3 Pro AI Engine &bull; Fiscal Expert 2025
        </p>
      </footer>
    </div>
  );
};

export default App;

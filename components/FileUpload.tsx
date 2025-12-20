
import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, Cpu, Search, CheckCircle2 } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const processingStatuses = [
    { text: "Lendo documento...", icon: <FileText className="w-4 h-4" /> },
    { text: "Analisando estrutura...", icon: <Search className="w-4 h-4" /> },
    { text: "Extraindo com IA...", icon: <Cpu className="w-4 h-4" /> },
    { text: "Validando dados MEI...", icon: <CheckCircle2 className="w-4 h-4" /> },
    { text: "Finalizando...", icon: <Loader2 className="w-4 h-4 animate-spin" /> }
  ];

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % processingStatuses.length);
      }, 2000);
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndPassFile = (file: File) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      setError("Formato não suportado. Use PDF, JPG ou PNG.");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { 
      setError("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-64 sm:h-72 border-2 border-dashed rounded-[2.5rem] transition-all duration-300 ease-in-out overflow-hidden
          ${dragActive ? "border-indigo-600 bg-indigo-50 scale-[1.02]" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50/50"}
          ${isProcessing ? "border-indigo-400 bg-indigo-50/30 animate-pulse pointer-events-none" : "shadow-sm hover:shadow-md"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center px-6 sm:px-8 py-6">
          {isProcessing ? (
            <div className="flex flex-col items-center animate-fade-in w-full">
              <div className="relative mb-4 sm:mb-6">
                 <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
                 <div className="relative bg-indigo-600 p-4 sm:p-5 rounded-full shadow-xl shadow-indigo-200">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
                 </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 tracking-tight uppercase">Analisando</h3>
              
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                <span className="text-indigo-600 shrink-0">{processingStatuses[statusIndex].icon}</span>
                <span className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">{processingStatuses[statusIndex].text}</span>
              </div>

              <div className="mt-6 sm:mt-8 w-full max-w-[200px] bg-gray-200 h-1 rounded-full overflow-hidden">
                 <div 
                   className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear"
                   style={{ width: `${((statusIndex + 1) / processingStatuses.length) * 100}%` }}
                 ></div>
              </div>
            </div>
          ) : (
            <>
              <InfoTooltip content="Arraste ou selecione sua NFS-e (PDF ou Imagem).">
                <div className="bg-indigo-100 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] mb-4 sm:mb-6 group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 shadow-sm cursor-help">
                  <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </InfoTooltip>
              <p className="mb-2 text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-tight">
                Importar <span className="text-indigo-600">Documento</span>
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 mb-6 sm:mb-8 px-4 uppercase tracking-widest opacity-80">PDF ou Imagem de até 5MB</p>
              
              <label 
                htmlFor="dropzone-file" 
                className="px-6 sm:px-8 py-3 bg-gray-900 text-white rounded-xl sm:rounded-2xl hover:bg-black cursor-pointer font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                Selecionar Arquivo
              </label>
            </>
          )}
        </div>
        
        <input id="dropzone-file" type="file" className="hidden" onChange={handleChange} disabled={isProcessing} accept=".pdf,.jpg,.jpeg,.png,.webp" />
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-xs border border-red-100 animate-fade-in font-black uppercase tracking-widest">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 no-print">
         <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0"><FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /></div>
            <div>
               <p className="font-black text-gray-900 uppercase text-[8px] sm:text-[9px] tracking-widest mb-0.5">Visão IA</p>
               <p className="font-bold text-gray-400 text-[8px] leading-tight uppercase opacity-70">OCR Semântico de Alta Precisão</p>
            </div>
         </div>
         <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="bg-indigo-50 p-2.5 rounded-xl shrink-0 font-black text-indigo-600 text-[10px] sm:text-sm">R$</div>
            <div>
               <p className="font-black text-gray-900 uppercase text-[8px] sm:text-[9px] tracking-widest mb-0.5">Recibo Legal</p>
               <p className="font-bold text-gray-400 text-[8px] leading-tight uppercase opacity-70">Escrita Automática por Extenso</p>
            </div>
         </div>
      </div>
    </div>
  );
};

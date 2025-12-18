import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, Cpu, Search, CheckCircle2 } from 'lucide-react';

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
    { text: "Analisando estrutura fiscal...", icon: <Search className="w-4 h-4" /> },
    { text: "Extraindo dados com IA...", icon: <Cpu className="w-4 h-4" /> },
    { text: "Validando informações MEI...", icon: <CheckCircle2 className="w-4 h-4" /> },
    { text: "Finalizando extração...", icon: <Loader2 className="w-4 h-4 animate-spin" /> }
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
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
    <div className="w-full max-w-lg mx-auto">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out overflow-hidden
          ${dragActive ? "border-indigo-600 bg-indigo-50 scale-[1.02]" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50/50"}
          ${isProcessing ? "border-indigo-400 bg-indigo-50/30 animate-pulse pointer-events-none" : "shadow-sm hover:shadow-md"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-8">
          {isProcessing ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
                 <div className="relative bg-indigo-600 p-5 rounded-full shadow-xl shadow-indigo-200">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                 </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Processamento Ativo</h3>
              
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm transition-all duration-500">
                <span className="text-indigo-600">{processingStatuses[statusIndex].icon}</span>
                <span className="text-sm font-bold text-gray-700">{processingStatuses[statusIndex].text}</span>
              </div>

              <div className="mt-8 w-64 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                 <div 
                   className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear"
                   style={{ width: `${((statusIndex + 1) / processingStatuses.length) * 100}%` }}
                 ></div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-indigo-100 p-5 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 shadow-sm">
                <UploadCloud className="w-10 h-10 transition-colors" />
              </div>
              <p className="mb-2 text-xl font-black text-gray-900 tracking-tight">
                Arraste sua <span className="text-indigo-600">Nota Fiscal</span> aqui
              </p>
              <p className="text-sm font-bold text-gray-400 mb-6 px-4">PDF, JPG ou PNG de até 5MB para extração inteligente</p>
              
              <label 
                htmlFor="dropzone-file" 
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black cursor-pointer font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                Selecionar do Computador
              </label>
            </>
          )}
        </div>
        
        {/* Decorative Progress Bar for Idle State */}
        {!isProcessing && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 opacity-50"></div>
        )}

        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          onChange={handleChange} 
          disabled={isProcessing}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
        />
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-fade-in font-bold">
          <div className="bg-red-200 p-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4" />
          </div>
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 no-print">
         <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="bg-emerald-50 p-2.5 rounded-xl">
               <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-xs">
               <p className="font-black text-gray-900 uppercase tracking-wider mb-0.5">Visão Computacional</p>
               <p className="font-bold text-gray-400">Leitura fiel de campos</p>
            </div>
         </div>
         <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="bg-indigo-50 p-2.5 rounded-xl font-black text-indigo-600 text-sm">
               R$
            </div>
            <div className="text-xs">
               <p className="font-black text-gray-900 uppercase tracking-wider mb-0.5">Recibo Jurídico</p>
               <p className="font-bold text-gray-400">Escrita por extenso automática</p>
            </div>
         </div>
      </div>
    </div>
  );
};
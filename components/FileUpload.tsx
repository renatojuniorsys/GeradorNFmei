import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out
          ${dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50"}
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="mb-2 text-lg font-semibold text-gray-700">Processando Inteligente...</p>
              <p className="text-sm text-gray-500">A IA está lendo e validando sua nota fiscal.</p>
            </>
          ) : (
            <>
              <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="mb-2 text-lg font-semibold text-gray-700">
                Arraste sua <span className="text-indigo-600">Nota Fiscal (PDF/Imagem)</span> aqui
              </p>
              <p className="text-sm text-gray-500 mb-4">ou clique para selecionar do computador</p>
              <label 
                htmlFor="dropzone-file" 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer font-medium transition-colors shadow-sm"
              >
                Selecionar Arquivo
              </label>
            </>
          )}
        </div>
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
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4">
         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <FileText className="w-5 h-5 text-green-500" />
            <div className="text-xs text-gray-600">
               <p className="font-semibold text-gray-800">Extração Automática</p>
               <p>Lê PDF e Imagens</p>
            </div>
         </div>
         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="font-bold text-indigo-600 border border-indigo-200 rounded px-1 text-xs">R$</div>
            <div className="text-xs text-gray-600">
               <p className="font-semibold text-gray-800">Recibo Formal</p>
               <p>Gera recibo c/ extenso</p>
            </div>
         </div>
      </div>
    </div>
  );
};
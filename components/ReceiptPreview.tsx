
import React from 'react';
import { InvoiceData, AppSettings, PdfMargins } from '../types';
import { formatCurrency, formatDate, formatDocument, numberToWordsPTBR } from '../services/utils';
import { Scissors, Building2, CheckCircle2, Move } from 'lucide-react';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  isSuccess?: boolean;
  isPrinting?: boolean;
  onUpdateMargins?: (margins: PdfMargins) => void;
}

export const ReceiptPreview: React.FC<Props> = ({ 
  data, 
  settings, 
  isSuccess, 
  isPrinting = false,
  onUpdateMargins
}) => {
  const cleanKey = data.accessKey?.replace(/\D/g, '') || '';
  const officialUrl = cleanKey 
    ? `https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${cleanKey}`
    : `https://www.nfse.gov.br/ConsultaPublica/?cod=${data.verificationCode}`;
    
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(officialUrl)}&margin=10&format=png`;

  const margins = settings?.pdfMargins || { top: 40, bottom: 40, left: 40, right: 40 };

  const handleMarginChange = (key: keyof PdfMargins, value: string) => {
    const numValue = Math.max(0, Math.floor(Number(value)) || 0);
    if (onUpdateMargins) {
      onUpdateMargins({ ...margins, [key]: numValue });
    }
  };

  // Dimensões A4 rigorosas para evitar overflow no motor de renderização
  const containerClasses = isPrinting
    ? "print-container bg-white text-gray-900 w-[794px] h-[1122px] relative flex flex-col box-border border-none overflow-hidden mx-auto shadow-none"
    : `print-container bg-white text-gray-800 w-[210mm] h-[297mm] max-h-[297mm] shadow-2xl print:shadow-none relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden origin-top transition-all duration-300
       scale-[0.6] min-[375px]:scale-[0.65] min-[425px]:scale-[0.7] min-[540px]:scale-[0.75] sm:scale-[0.8] md:scale-[0.9] lg:scale-100
       mb-[-120mm] min-[375px]:mb-[-105mm] min-[425px]:mb-[-90mm] min-[540px]:mb-[-75mm] sm:mb-[-60mm] md:mb-[-30mm] lg:mb-0
      `;

  const extenso = numberToWordsPTBR(data.values.netValue).toUpperCase();

  return (
    <div className={`relative w-full flex flex-col items-center group max-w-full overflow-x-auto no-scrollbar receipt-container-root ${isPrinting ? 'p-0' : ''}`}>
      
      {!isPrinting && (
        <div className="no-print mb-8 w-full max-w-[210mm] flex flex-col gap-4 px-4 sm:px-0 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><Move className="w-5 h-5" /></div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest">Ajuste do Recibo</h4>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ajuste fino de margens</p>
              </div>
            </div>
            
            <div className="flex justify-around sm:justify-start gap-3 sm:gap-4">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <div key={side} className="flex flex-col items-center">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">{side}</label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    value={margins[side]} 
                    onChange={(e) => handleMarginChange(side, e.target.value)}
                    className="w-10 bg-gray-50 border border-gray-100 rounded-lg p-1.5 text-center text-[10px] font-black outline-none focus:ring-1 focus:ring-indigo-300 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isSuccess && !isPrinting && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-[2.5rem] animate-fade-in no-print p-4">
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-emerald-100 flex flex-col items-center gap-6 animate-pop-in text-center w-full max-w-sm">
             <div className="bg-emerald-500 p-5 sm:p-6 rounded-full"><CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" /></div>
             <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Recibo Pronto!</h3>
          </div>
        </div>
      )}

      <div 
        className={containerClasses}
        style={{ 
          paddingTop: `${margins.top}px`, 
          paddingBottom: `${margins.bottom}px`, 
          paddingLeft: `${margins.left}px`, 
          paddingRight: `${margins.right}px` 
        }}
      >
        <div className="border-[5px] border-gray-900 p-6 sm:p-10 relative flex flex-col flex-grow box-border h-full overflow-hidden bg-white">
          <header className="flex justify-between items-start border-b-[5px] border-gray-900 pb-6 mb-6 shrink-0">
             <div className="max-w-[150px] sm:max-w-[200px]">
               {settings?.logoUrl ? (
                 <img src={settings.logoUrl} alt="Logo" className="max-h-16 sm:max-h-24 w-auto object-contain" />
               ) : (
                 <div className="bg-gray-900 text-white p-3 rounded-xl shadow-lg"><Building2 className="w-6 h-6 sm:w-8 sm:h-8" /></div>
               )}
             </div>
             <div className="text-right flex flex-col items-end">
                <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">RECIBO</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">REF. NF Nº {data.number || '00'}</p>
                
                <div className="mt-3 py-3 px-6 sm:py-5 sm:px-10 bg-black rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center justify-center shadow-xl">
                  <span className="text-[7px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Valor Líquido</span>
                  <span className="text-2xl sm:text-4xl font-black text-white tabular-nums tracking-tighter leading-tight">
                    {formatCurrency(data.values.netValue)}
                  </span>
                </div>
             </div>
          </header>

          <div className="space-y-6 sm:space-y-8 text-gray-900 shrink-0">
            <p className="text-base sm:text-xl leading-snug tracking-tight">
              Recebemos de <span className="font-black border-b-[3px] sm:border-b-[4px] border-gray-300 px-1 uppercase">{data.borrower.name || '---'}</span>, 
              inscrito sob o nº <span className="font-mono font-bold bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 text-sm sm:text-base">{formatDocument(data.borrower.document)}</span>, 
              a importância líquida de:
            </p>
            
            <div className="p-6 sm:p-10 bg-black text-white rounded-[2rem] sm:rounded-[2.5rem] font-black italic text-center leading-tight shadow-lg">
              <span className={`${extenso.length > 50 ? 'text-lg sm:text-2xl' : 'text-xl sm:text-3xl'} block`}>
                "{extenso}"
              </span>
            </div>

            <div className="p-5 sm:p-7 bg-gray-50/80 rounded-[1.5rem] sm:rounded-[2rem] border-l-[8px] sm:border-l-[12px] border-gray-900 shadow-inner flex-shrink">
              <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Serviços Prestados:</p>
              <p className="italic text-gray-900 text-sm sm:text-lg leading-relaxed font-bold line-clamp-5 overflow-hidden">
                {data.description || 'Prestação de serviços diversos conforme discriminado na nota fiscal eletrônica.'}
              </p>
            </div>
          </div>

          <div className="flex-grow min-h-[20px]"></div>

          <div className="mb-6 sm:mb-8 text-right shrink-0">
            <p className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">{data.provider.city || 'Cidade'}, {formatDate(data.issueDate)}</p>
          </div>

          <div className="flex flex-col items-center mb-6 sm:mb-8 shrink-0">
            <div className="relative w-full max-w-md sm:max-w-xl flex flex-col items-center">
              {settings?.signatureUrl && (
                <img 
                  src={settings.signatureUrl} 
                  alt="Sign" 
                  className="max-h-16 sm:max-h-24 mb-[-10px] sm:mb-[-15px] w-auto relative z-10 grayscale opacity-95" 
                />
              )}
              <div className="w-full border-b-[3px] sm:border-b-[4px] border-gray-900 mb-4 sm:mb-6"></div>
              <p className="text-lg sm:text-2xl font-black text-gray-900 uppercase truncate max-w-full px-4 text-center tracking-tighter leading-none">{data.provider.name}</p>
              <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1.5">CNPJ: {formatDocument(data.provider.document)}</p>
            </div>
          </div>

          <footer className="pt-4 sm:pt-6 border-t-[3px] sm:border-t-[4px] border-gray-900 flex justify-between items-end shrink-0">
            <div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] max-w-[300px] sm:max-w-[450px] leading-tight">
              ESTE RECIBO POSSUI VALIDADE JURÍDICA COMPLEMENTAR À NFS-E DIGITAL PARA FINS DE QUITAÇÃO DE OBRIGAÇÕES FINANCEIRAS ENTRE AS PARTES.
            </div>
            <div className="p-1 sm:p-1.5 border-[2px] sm:border-[3px] border-gray-900 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center">
              <img src={dynamicQrUrl} alt="QR" style={{ width: isPrinting ? '32mm' : '24mm', height: isPrinting ? '32mm' : '24mm' }} className="object-contain" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

import { Building2, CheckCircle, Printer, QrCode, User, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDocument, formatDate } from '../services/utils';
import { AppSettings, InvoiceData } from '../types';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  refProp?: React.RefObject<HTMLDivElement>;
}

export const ModernInvoice: React.FC<Props> = ({ data, settings, refProp }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="relative w-full flex flex-col items-center group">
      {/* Botão de Impressão Prominente com Estilo Moderno */}
      <div className="absolute -top-16 right-0 z-30 no-print flex items-center gap-4">
        {showSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-200 animate-fade-in border border-emerald-400/30">
            <div className="bg-white/20 p-1 rounded-full">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Documento Gerado!</span>
          </div>
        )}

        <button
          onClick={handlePrint}
          type="button"
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-7 py-3.5 rounded-2xl shadow-2xl shadow-indigo-200 transition-all active:scale-95 font-black border border-white/20 uppercase tracking-widest text-xs group/btn"
        >
          <Printer className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
          <span>Gerar Documento PDF</span>
        </button>
      </div>

      <div 
        ref={refProp}
        className="print-container bg-white text-gray-800 p-8 md:p-10 w-full max-w-[210mm] h-[297mm] shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-8 relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden"
      >
        {/* Marca d'água de fundo */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
          <Building2 size={400} />
        </div>

        {/* Cabeçalho - Otimizado */}
        <header className="flex justify-between items-start border-b-2 border-indigo-50 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-3.5 rounded-2xl shadow-lg">
              <Building2 className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1">Nota Fiscal de Serviço</h1>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Eletrônica</span>
                <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">NFS-e Modelo MEI</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-0.5">Documento Nº</p>
            <div className="text-3xl font-black text-indigo-600 tabular-nums tracking-tighter leading-none">
              {data.number || '00'}
              <span className="text-base text-gray-200 ml-1 font-light tracking-normal">/{data.series || 'A'}</span>
            </div>
          </div>
        </header>

        {/* Informações Chave */}
        <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Emissão</p>
            <p className="font-black text-gray-800 text-base">{formatDate(data.issueDate)}</p>
          </div>
          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Verificação</p>
            <p className="font-mono text-[10px] font-black text-indigo-600 break-all leading-tight">{data.verificationCode || '---'}</p>
          </div>
          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Chave de Acesso</p>
            <p className="font-mono text-[6.5px] leading-tight text-gray-500 break-all font-bold uppercase">{data.accessKey || '---'}</p>
          </div>
        </div>

        {/* Participantes */}
        <div className="grid grid-cols-2 gap-6 mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-3 h-3 text-indigo-600" />
              </div>
              <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Prestador</h3>
            </div>
            <p className="font-black text-sm text-gray-900 leading-tight mb-1">{data.provider.name}</p>
            <div className="text-[10px] text-gray-500 space-y-0">
              <p className="font-bold">CNPJ: <span className="text-gray-900 font-mono">{formatDocument(data.provider.document)}</span></p>
              <p className="leading-tight opacity-80 line-clamp-2">{data.provider.address}</p>
              <p className="font-black text-indigo-600 uppercase text-[8px]">{data.provider.city} — {data.provider.state}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                <User className="w-3 h-3 text-gray-500" />
              </div>
              <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Tomador</h3>
            </div>
            <p className="font-black text-sm text-gray-900 leading-tight mb-1">{data.borrower.name}</p>
            <div className="text-[10px] text-gray-500 space-y-0">
              <p className="font-bold">DOC: <span className="text-gray-900 font-mono">{formatDocument(data.borrower.document)}</span></p>
              <p className="leading-tight opacity-80 line-clamp-2">{data.borrower.address}</p>
              <p className="font-black text-gray-800 uppercase text-[8px]">{data.borrower.city} {data.borrower.state && `— ${data.borrower.state}`}</p>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="mb-5 flex-grow relative z-10 overflow-hidden flex flex-col">
          <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1.5 border-b border-indigo-50 pb-0.5">
            Discriminação dos Serviços
          </h3>
          <div className="bg-gray-50/30 rounded-2xl p-4 text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap flex-grow border border-indigo-50/50 print:bg-white relative">
            {data.description || 'Descrição não disponível.'}
            {data.activityCode && (
               <div className="mt-2 text-[6.5px] text-gray-400 font-black">
                 <span className="text-indigo-600 uppercase mr-1">CNAE:</span> {data.activityCode}
               </div>
            )}
          </div>
        </div>

        {/* Valores */}
        <div className="bg-indigo-950 text-white rounded-[1.5rem] p-4 mb-5 relative overflow-hidden print:bg-indigo-950 print:text-white shadow-xl">
          <div className="grid grid-cols-4 gap-2 text-center items-center relative z-10">
            <div className="flex flex-col">
              <p className="text-indigo-300/60 text-[6.5px] font-black uppercase tracking-widest mb-0.5">Bruto</p>
              <p className="text-xs font-black whitespace-nowrap tabular-nums">{formatCurrency(data.values.serviceValue)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-indigo-300/60 text-[6.5px] font-black uppercase tracking-widest mb-0.5">Desconto</p>
              <p className="text-xs font-black text-emerald-400 whitespace-nowrap tabular-nums">{formatCurrency(data.values.discount)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-indigo-300/60 text-[6.5px] font-black uppercase tracking-widest mb-0.5">Imp. Retidos</p>
              <p className="text-xs font-black text-rose-300 whitespace-nowrap tabular-nums">{formatCurrency(data.values.taxAmount || 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl py-2 px-1 border border-white/10">
              <p className="text-indigo-100 text-[6.5px] font-black uppercase tracking-widest mb-0.5">Líquido</p>
              <p className="text-base font-black whitespace-nowrap tabular-nums tracking-tighter leading-none">
                {formatCurrency(data.values.netValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé - Compactado para garantir página única */}
        <footer className="mt-auto border-t-2 border-indigo-50 pt-3 flex flex-col gap-3 relative z-10">
          <div className="flex justify-between items-end gap-4">
            {/* Selo e Status */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 self-start">
                 <CheckCircle className="w-3 h-3" />
                 <span className="text-[7px] font-black uppercase tracking-wider">Autenticidade Garantida</span>
              </div>
              <p className="italic font-bold text-gray-300 text-[6.5px] max-w-[240px] leading-tight">
                Representação visual de dados fiscais (XML/PDF) para fins informativos e organizacionais.
              </p>
            </div>

            {/* QR e Segurança em Linha Compacta */}
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-center gap-0.5">
                 <div className="p-1 bg-white rounded-lg shadow-sm border border-indigo-100/40">
                   {settings?.qrCodeUrl ? (
                     <img src={settings.qrCodeUrl} alt="QR" className="w-10 h-10 object-contain" />
                   ) : (
                     <QrCode className="w-10 h-10 opacity-5" />
                   )}
                 </div>
                 <p className="text-[5.5px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                   Validar
                 </p>
               </div>
               
               <div className="text-right">
                 <p className="mb-0.5 text-gray-400 text-[6.5px] font-black uppercase">Segurança SHA-256</p>
                 <p className="font-mono text-[8px] text-indigo-600 font-black bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50">
                   {data.verificationCode?.substring(0, 12) || 'SECURITY-HASH-2025'}
                 </p>
               </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-2">
            <p className="font-black text-gray-200 text-[7px] tracking-[0.2em] uppercase">
              MEI Smart Doc &bull; v2.5 &bull; Processado via Gemini AI
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
              <span className="w-1 h-1 rounded-full bg-indigo-300"></span>
              <span className="w-1 h-1 rounded-full bg-indigo-200"></span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
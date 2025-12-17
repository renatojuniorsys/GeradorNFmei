
import React from 'react';
import { InvoiceData, AppSettings } from '../types';
import { formatCurrency, formatDate, formatDocument } from '../services/utils';
import { QrCode, Building2, User, CheckCircle, Printer } from 'lucide-react';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  refProp?: React.RefObject<HTMLDivElement>;
}

export const ModernInvoice: React.FC<Props> = ({ data, settings, refProp }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 
        Proactive Action Button: 
        Styled with indigo gradient, subtle border, and high prominence.
        Class 'no-print' ensures it stays off the final document.
      */}
      <div className="absolute -top-14 right-0 z-20 no-print flex gap-3">
        <button
          onClick={handlePrint}
          type="button"
          className="flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-200 transition-all active:scale-95 font-semibold border border-indigo-400/30 group animate-fade-in"
        >
          <Printer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Gerar PDF da Nota</span>
        </button>
      </div>

      <div 
        ref={refProp}
        className="bg-white text-gray-800 p-10 w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-10 relative flex flex-col box-border border border-gray-100 print:border-none rounded-2xl print:rounded-none overflow-hidden"
      >
        {/* Subtle background watermark for modern look */}
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
          <Building2 size={400} />
        </div>

        {/* Header */}
        <header className="flex justify-between items-start border-b-2 border-indigo-50 pb-8 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl shadow-lg shadow-indigo-100 print:shadow-none">
              <Building2 className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Nota Fiscal de Serviço</h1>
              <p className="text-sm text-indigo-500 font-bold tracking-widest uppercase opacity-80">Eletrônica (NFS-e)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Número do Documento</div>
            <div className="text-4xl font-black text-indigo-600 tabular-nums">
              {data.number || '0000'}
              <span className="text-xl text-gray-300 ml-1 font-light">/ {data.series || 'A'}</span>
            </div>
          </div>
        </header>

        {/* Key Info Grid */}
        <div className="grid grid-cols-3 gap-6 mb-10 relative z-10">
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 print:bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Emissão</p>
            <p className="font-bold text-gray-800 text-lg">{formatDate(data.issueDate)}</p>
          </div>
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 print:bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Verificação</p>
            <p className="font-mono text-xs font-bold text-indigo-600 break-all">{data.verificationCode || '---'}</p>
          </div>
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 print:bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Chave de Acesso</p>
            <p className="font-mono text-[9px] leading-tight text-gray-500 break-all font-medium uppercase tracking-tighter">{data.accessKey || '---'}</p>
          </div>
        </div>

        {/* Entities Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 relative z-10">
          {/* Provider */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Prestador</h3>
            </div>
            <div className="space-y-2">
              <p className="font-black text-xl text-gray-900 leading-tight">{data.provider.name || 'Nome Indisponível'}</p>
              <div className="text-sm text-gray-600 font-medium">
                <p className="mb-1">CNPJ: <span className="text-gray-900 font-bold font-mono">{formatDocument(data.provider.document)}</span></p>
                <p className="opacity-80 leading-relaxed">{data.provider.address || 'Endereço não informado'}</p>
                <p className="font-bold text-gray-700">{data.provider.city} - {data.provider.state}</p>
              </div>
            </div>
          </div>

          {/* Borrower */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tomador</h3>
            </div>
            <div className="space-y-2">
              <p className="font-black text-xl text-gray-900 leading-tight">{data.borrower.name || 'Consumidor Final'}</p>
              <div className="text-sm text-gray-600 font-medium">
                <p className="mb-1">CNPJ/CPF: <span className="text-gray-900 font-bold font-mono">{formatDocument(data.borrower.document)}</span></p>
                <p className="opacity-80 leading-relaxed">{data.borrower.address || 'Endereço não informado'}</p>
                <p className="font-bold text-gray-700">{data.borrower.city} {data.borrower.state ? `- ${data.borrower.state}` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="mb-10 flex-grow relative z-10">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
            Discriminação dos Serviços
          </h3>
          <div className="bg-white rounded-2xl p-8 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[220px] border-2 border-indigo-50/50 print:bg-white shadow-inner">
            {data.description || 'Descrição não informada.'}
            
            {data.activityCode && (
               <div className="mt-8 pt-6 border-t border-indigo-50 text-[11px] text-gray-400 font-bold">
                 <span className="text-indigo-600 uppercase tracking-wider mr-2">Serviço/CNAE:</span> {data.activityCode}
               </div>
            )}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-indigo-900 text-white rounded-3xl p-8 mb-10 shadow-2xl shadow-indigo-900/20 relative overflow-hidden print:bg-indigo-900 print:text-white">
          {/* Subtle pattern for value box */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Valor Base</p>
              <p className="text-xl font-bold">{formatCurrency(data.values.serviceValue)}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Desconto</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(data.values.discount)}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Impostos</p>
              <p className="text-xl font-bold text-rose-300">{formatCurrency(data.values.taxAmount || 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 -my-4 flex flex-col justify-center border border-white/10">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Líquido a Receber</p>
              <p className="text-3xl font-black tracking-tighter">{formatCurrency(data.values.netValue)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t-2 border-indigo-50 pt-8 flex justify-between items-center text-[10px] text-gray-400 font-bold tracking-widest uppercase relative z-10">
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
             <CheckCircle className="w-4 h-4" />
             <span>Autenticidade Verificada</span>
          </div>
          <div className="flex items-center gap-4">
             {settings?.qrCodeUrl ? (
               <img src={settings.qrCodeUrl} alt="QR Validação" className="w-12 h-12 object-contain rounded-lg" />
             ) : (
               <div className="w-12 h-12 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center">
                 <QrCode className="w-6 h-6 opacity-20" />
               </div>
             )}
             <div className="text-right">
               <p className="mb-1">Hash de Segurança</p>
               <p className="font-mono text-[11px] text-indigo-600 font-black tracking-normal">f1a2-9b3c-4d5e</p>
             </div>
          </div>
          <p className="italic font-medium lowercase tracking-normal opacity-60">Representação visual baseada no documento original</p>
        </footer>
      </div>
    </div>
  );
};

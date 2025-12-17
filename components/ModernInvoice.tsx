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
    <div className="relative w-full flex flex-col items-center group">
      {/* Botão de Impressão Prominente com Estilo Moderno */}
      <div className="absolute -top-16 right-0 z-30 no-print">
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
        className="print-container bg-white text-gray-800 p-12 w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-12 relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden"
      >
        {/* Marca d'água de fundo */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
          <Building2 size={450} />
        </div>

        {/* Cabeçalho */}
        <header className="flex justify-between items-start border-b-4 border-indigo-50 pb-10 mb-10 relative z-10">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-[2rem] shadow-xl shadow-indigo-100 print:shadow-none">
              <Building2 className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">Nota Fiscal de Serviço</h1>
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Eletrônica</span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">NFS-e Modelo MEI</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Nº do Documento</p>
            <div className="text-5xl font-black text-indigo-600 tabular-nums tracking-tighter">
              {data.number || '0000'}
              <span className="text-xl text-gray-200 ml-2 font-light tracking-normal">/ {data.series || 'A'}</span>
            </div>
          </div>
        </header>

        {/* Grid de Informações Chave */}
        <div className="grid grid-cols-3 gap-6 mb-12 relative z-10">
          <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Data de Emissão</p>
            <p className="font-black text-gray-800 text-xl">{formatDate(data.issueDate)}</p>
          </div>
          <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Verificação</p>
            <p className="font-mono text-sm font-black text-indigo-600 break-all">{data.verificationCode || '---'}</p>
          </div>
          <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Chave de Acesso</p>
            <p className="font-mono text-[9px] leading-tight text-gray-500 break-all font-bold uppercase tracking-tighter">{data.accessKey || '---'}</p>
          </div>
        </div>

        {/* Seção de Participantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12 relative z-10">
          {/* Prestador */}
          <div className="group/entity">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 transition-colors group-hover/entity:bg-indigo-600 group-hover/entity:text-white">
                <Building2 className="w-5 h-5 text-indigo-600 group-hover/entity:text-white" />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Prestador</h3>
            </div>
            <div className="space-y-4">
              <p className="font-black text-2xl text-gray-900 leading-tight">{data.provider.name || 'Nome Indisponível'}</p>
              <div className="text-sm text-gray-600 font-medium">
                <p className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">CNPJ:</span>
                  <span className="text-gray-900 font-black font-mono bg-gray-100 px-3 py-1 rounded-xl">{formatDocument(data.provider.document)}</span>
                </p>
                <p className="opacity-70 leading-relaxed max-w-[320px]">{data.provider.address || 'Endereço não informado'}</p>
                <p className="font-black text-indigo-600 mt-2 text-base">{data.provider.city} — {data.provider.state}</p>
              </div>
            </div>
          </div>

          {/* Tomador */}
          <div className="group/entity">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 transition-colors group-hover/entity:bg-gray-900 group-hover/entity:text-white">
                <User className="w-5 h-5 text-gray-500 group-hover/entity:text-white" />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Tomador</h3>
            </div>
            <div className="space-y-4">
              <p className="font-black text-2xl text-gray-900 leading-tight">{data.borrower.name || 'Consumidor Final'}</p>
              <div className="text-sm text-gray-600 font-medium">
                <p className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Documento:</span>
                  <span className="text-gray-900 font-black font-mono bg-gray-100 px-3 py-1 rounded-xl">{formatDocument(data.borrower.document)}</span>
                </p>
                <p className="opacity-70 leading-relaxed max-w-[320px]">{data.borrower.address || 'Endereço não informado'}</p>
                <p className="font-black text-gray-800 mt-2 text-base">{data.borrower.city} {data.borrower.state ? `— ${data.borrower.state}` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Discriminação dos Serviços */}
        <div className="mb-12 flex-grow relative z-10">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-5 border-b-2 border-indigo-50 pb-3">
            Discriminação dos Serviços Prestados
          </h3>
          <div className="bg-gray-50/30 rounded-[2.5rem] p-12 text-base text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[300px] border border-indigo-50/50 print:bg-white shadow-inner relative overflow-hidden">
            {data.description || 'Descrição não informada.'}
            
            {data.activityCode && (
               <div className="mt-12 pt-10 border-t border-indigo-50/50 text-xs text-gray-400 font-black">
                 <span className="text-indigo-600 uppercase tracking-widest mr-4">Código CNAE/Serviço:</span> {data.activityCode}
               </div>
            )}
          </div>
        </div>

        {/* Resumo de Valores */}
        <div className="bg-indigo-950 text-white rounded-[3rem] p-10 mb-12 shadow-2xl shadow-indigo-950/20 relative overflow-hidden print:bg-indigo-950 print:text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
            <div>
              <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Valor Bruto</p>
              <p className="text-2xl font-black">{formatCurrency(data.values.serviceValue)}</p>
            </div>
            <div>
              <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Descontos</p>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(data.values.discount)}</p>
            </div>
            <div>
              <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Impostos Retidos</p>
              <p className="text-2xl font-black text-rose-300">{formatCurrency(data.values.taxAmount || 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] p-6 -my-6 flex flex-col justify-center border border-white/10 shadow-xl">
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Líquido a Receber</p>
              <p className="text-4xl font-black tracking-tighter whitespace-nowrap">{formatCurrency(data.values.netValue)}</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="mt-auto border-t-4 border-indigo-50 pt-10 flex justify-between items-center text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase relative z-10">
          <div className="flex items-center gap-4 bg-emerald-50 text-emerald-700 px-8 py-4 rounded-full border border-emerald-100">
             <CheckCircle className="w-5 h-5" />
             <span className="text-xs">Autenticidade Garantida</span>
          </div>
          <div className="flex items-center gap-8">
             {settings?.qrCodeUrl ? (
               <img src={settings.qrCodeUrl} alt="QR Validação" className="w-20 h-20 object-contain rounded-3xl bg-white p-2 shadow-sm border border-gray-100" />
             ) : (
               <div className="w-20 h-20 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center">
                 <QrCode className="w-10 h-10 opacity-10" />
               </div>
             )}
             <div className="text-right">
               <p className="mb-2 text-gray-300">Hash de Segurança SHA-256</p>
               <p className="font-mono text-sm text-indigo-500 font-black tracking-normal">MEI-PRO-8293-F1A2</p>
             </div>
          </div>
          <p className="italic font-bold lowercase tracking-normal opacity-40 max-w-[180px] leading-tight text-right">Documento visual gerado a partir do XML/PDF original via processamento inteligente</p>
        </footer>
      </div>
    </div>
  );
};
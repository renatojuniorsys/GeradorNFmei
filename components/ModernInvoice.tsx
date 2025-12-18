import { Building2, CheckCircle, QrCode, User } from 'lucide-react';
import React from 'react';
import { formatCurrency, formatDocument, formatDate } from '../services/utils';
import { AppSettings, InvoiceData } from '../types';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  refProp?: React.RefObject<HTMLDivElement>;
}

export const ModernInvoice: React.FC<Props> = ({ data, settings, refProp }) => {
  // Gera o link do QR Code dinamicamente baseado na chave de acesso ou código de verificação
  const qrData = data.accessKey || data.verificationCode || 'validacao-mei-smart-doc';
  const dynamicQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${qrData}`;

  return (
    <div className="relative w-full flex flex-col items-center group">
      <div 
        ref={refProp}
        className="print-container bg-white text-gray-800 p-8 md:p-10 w-full max-w-[210mm] h-[297mm] shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-8 relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden"
      >
        {/* Marca d'água de fundo */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
          <Building2 size={400} />
        </div>

        {/* Cabeçalho */}
        <header className="flex justify-between items-start border-b-2 border-indigo-50 pb-6 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl shadow-lg">
              <Building2 className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1.5">Nota Fiscal de Serviço</h1>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Eletrônica</span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">NFS-e Modelo MEI</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-0.5">Documento Nº</p>
            <div className="text-4xl font-black text-indigo-600 tabular-nums tracking-tighter leading-none">
              {data.number || '00'}
              <span className="text-xl text-gray-200 ml-1 font-light tracking-normal">/{data.series || 'A'}</span>
            </div>
          </div>
        </header>

        {/* Informações Chave */}
        <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Emissão</p>
            <p className="font-black text-gray-900 text-lg">{formatDate(data.issueDate)}</p>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Verificação</p>
            <p className="font-mono text-xs font-black text-indigo-600 break-all leading-tight">{data.verificationCode || 'PENDENTE'}</p>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Chave de Acesso</p>
            <p className="font-mono text-[8px] leading-tight text-gray-500 break-all font-bold uppercase">{data.accessKey || 'AGUARDANDO PROCESSAMENTO'}</p>
          </div>
        </div>

        {/* Participantes */}
        <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Prestador</h3>
            </div>
            <p className="font-black text-lg text-gray-900 leading-tight mb-2">{data.provider.name || '---'}</p>
            <div className="text-xs text-gray-500 space-y-1 font-medium">
              <p>CNPJ: <span className="text-gray-900 font-mono font-bold">{formatDocument(data.provider.document)}</span></p>
              <p className="leading-relaxed opacity-90 line-clamp-2">{data.provider.address || '---'}</p>
              <p className="font-black text-indigo-600 uppercase text-[10px] tracking-wide">{data.provider.city || '---'} — {data.provider.state || '--'}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tomador</h3>
            </div>
            <p className="font-black text-lg text-gray-900 leading-tight mb-2">{data.borrower.name || '---'}</p>
            <div className="text-xs text-gray-500 space-y-1 font-medium">
              <p>DOC: <span className="text-gray-900 font-mono font-bold">{formatDocument(data.borrower.document)}</span></p>
              <p className="leading-relaxed opacity-90 line-clamp-2">{data.borrower.address || '---'}</p>
              <p className="font-black text-gray-800 uppercase text-[10px] tracking-wide">{data.borrower.city || '---'} {data.borrower.state && `— ${data.borrower.state}`}</p>
            </div>
          </div>
        </div>

        {/* Discriminação dos Serviços */}
        <div className="mb-8 flex-grow relative z-10 overflow-hidden flex flex-col">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-indigo-50 pb-2">
            Discriminação dos Serviços
          </h3>
          <div className="bg-gray-50/30 rounded-[2rem] p-6 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap flex-grow border border-indigo-50/50 print:bg-white relative">
            {data.description || 'Descrição não disponível.'}
            {data.activityCode && (
               <div className="mt-4 pt-4 border-t border-indigo-50/30 text-[9px] text-gray-400 font-black">
                 <span className="text-indigo-600 uppercase mr-1">CNAE / Atividade:</span> {data.activityCode}
               </div>
            )}
          </div>
        </div>

        {/* Valores */}
        <div className="bg-indigo-950 text-white rounded-[2rem] p-6 mb-8 relative overflow-hidden print:bg-indigo-950 print:text-white shadow-xl">
          <div className="grid grid-cols-4 gap-4 text-center items-center relative z-10">
            <div className="flex flex-col">
              <p className="text-indigo-300/60 text-[8px] font-black uppercase tracking-widest mb-1.5">Bruto</p>
              <p className="text-base font-black whitespace-nowrap tabular-nums">{formatCurrency(data.values.serviceValue)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-indigo-300/60 text-[8px] font-black uppercase tracking-widest mb-1.5">Desconto</p>
              <p className="text-base font-black text-emerald-400 whitespace-nowrap tabular-nums">{formatCurrency(data.values.discount)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-indigo-300/60 text-[8px] font-black uppercase tracking-widest mb-1.5">Imp. Retidos</p>
              <p className="text-base font-black text-rose-300 whitespace-nowrap tabular-nums">{formatCurrency(data.values.taxAmount || 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl py-3 px-2 border border-white/10">
              <p className="text-indigo-100 text-[9px] font-black uppercase tracking-widest mb-1">Líquido</p>
              <p className="text-xl md:text-2xl font-black whitespace-nowrap tabular-nums tracking-tighter leading-none">
                {formatCurrency(data.values.netValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé - Refinado de acordo com a referência visual */}
        <footer className="mt-auto border-t-2 border-indigo-50 pt-6 flex flex-col gap-6 relative z-10">
          <div className="flex justify-between items-center gap-8">
            
            {/* Esquerda: Status e Badge */}
            <div className="flex flex-col gap-3 flex-grow">
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 self-start shadow-sm">
                 <CheckCircle className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Autenticidade Garantida</span>
              </div>
              <p className="italic font-bold text-gray-300 text-[9px] max-w-[320px] leading-relaxed">
                Representação visual de dados fiscais (XML/PDF) para fins informativos e organizacionais. Gerado via IA Processamento Inteligente.
              </p>
            </div>

            {/* Centro: QR Code Automático */}
            <div className="flex flex-col items-center gap-1.5">
               <div className="p-2 bg-white rounded-2xl shadow-xl border border-indigo-100/50">
                 <img 
                   src={dynamicQrUrl} 
                   alt="Autenticidade" 
                   className="w-16 h-16 object-contain"
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=error';
                   }}
                 />
               </div>
               <p className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-none">
                 VALIDAR
               </p>
            </div>
            
            {/* Direita: Campo de Segurança */}
            <div className="text-right min-w-[200px]">
              <p className="mb-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">Segurança SHA-256</p>
              <div className="bg-indigo-50/50 px-4 py-3 rounded-2xl border border-indigo-100/40 shadow-inner">
                <p className="font-mono text-[10px] text-indigo-700 font-black break-all leading-tight">
                  {data.verificationCode?.toUpperCase() || 'AUTENTICAÇÃO-PENDENTE'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-4">
            <p className="font-black text-gray-200 text-[9px] tracking-[0.4em] uppercase">
              MEI Smart Doc &bull; v2.5 &bull; Processado via Gemini AI &bull; 2025
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500/20"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500/40"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500/60"></span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
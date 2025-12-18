import React from 'react';
import { InvoiceData, AppSettings } from '../types';
import { formatCurrency, formatDate, formatDocument, numberToWordsPTBR } from '../services/utils';
import { Scissors, Building2 } from 'lucide-react';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  refProp?: React.RefObject<HTMLDivElement>;
}

export const ReceiptPreview: React.FC<Props> = ({ data, settings, refProp }) => {
  return (
    <div 
      ref={refProp}
      className="bg-white p-8 md:p-12 w-full max-w-[210mm] h-[297mm] mx-auto shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-8 relative flex flex-col box-border border border-gray-100 print:border-none overflow-hidden"
    >
      <div className="border-[3px] border-gray-900 p-8 md:p-10 relative flex flex-col flex-grow print:border-gray-900 overflow-hidden">
        {/* Cut Line Visual - Apenas Tela */}
        <div className="absolute -left-[3px] -right-[3px] -top-10 flex items-center justify-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] no-print">
          <Scissors className="w-3 h-3 mr-2" /> Recibo de Quitação Profissional
        </div>

        {/* Receipt Header - Reorganizado (Logo Esquerda, Título Centro, Valor Direita) */}
        <div className="flex items-center justify-between mb-10 border-b-4 border-gray-900 pb-6">
          {/* Logo - Canto Esquerdo */}
          <div className="w-1/3 flex justify-start">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo Empresa" className="h-16 object-contain" />
            ) : (
              <div className="bg-gray-900 text-white p-3 rounded-2xl inline-flex">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Título e Referência - Centralizados */}
          <div className="w-1/3 text-center flex flex-col gap-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">RECIBO</h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              REFERENTE À NF Nº {data.number || '---'}
            </p>
          </div>

          {/* Valor Total - Canto Direito */}
          <div className="w-1/3 flex justify-end">
            <div className="bg-gray-50 border-2 border-gray-900 p-5 rounded-2xl min-w-[180px] text-center print:bg-gray-50 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">VALOR TOTAL</p>
              <p className="text-2xl font-black text-gray-900 tabular-nums whitespace-nowrap">{formatCurrency(data.values.netValue)}</p>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="space-y-8 text-lg leading-relaxed text-gray-800 font-medium">
          <p>
            Recebemos de <span className="font-black border-b-2 border-gray-300 pb-0.5">{data.borrower.name || '____________________'}</span>, 
            inscrito(a) no CPF/CNPJ sob o nº <span className="font-mono text-base font-bold bg-gray-100 px-2 py-0.5 rounded-lg">{formatDocument(data.borrower.document) || '________________'}</span>,
            a importância líquida de:
          </p>

          <div className="bg-gray-900 text-white p-6 rounded-2xl font-black italic text-xl shadow-lg print:bg-gray-900 print:text-white leading-tight text-center">
            "{numberToWordsPTBR(data.values.netValue).toUpperCase()}"
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">REFERENTE AOS SERVIÇOS:</p>
            <p className="italic text-gray-700 leading-relaxed border-l-4 border-gray-200 pl-4 py-1 text-base">
              {data.description || 'Prestação de serviços diversos conforme discriminado na nota fiscal correspondente.'}
            </p>
          </div>

          <p className="text-base">
            Para maior clareza e validade jurídica, firmamos o presente recibo dando plena, rasa e geral quitação do valor acima mencionado.
          </p>
        </div>

        {/* Spacer dinâmico */}
        <div className="flex-grow"></div>

        {/* Date and Place */}
        <div className="mt-6 text-right">
          <p className="text-lg font-black text-gray-900">
            {data.provider.city || 'Cidade'}, {formatDate(data.issueDate)}
          </p>
        </div>

        {/* Signature Area */}
        <div className="mt-8 mb-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs border-b-2 border-gray-900 mb-3 opacity-20"></div>
          <p className="font-black text-lg text-gray-900 uppercase tracking-tight text-center">{data.provider.name}</p>
          <p className="text-[10px] font-bold text-gray-500 tracking-widest mt-0.5 uppercase">CNPJ: {formatDocument(data.provider.document)}</p>
          <p className="text-[9px] text-gray-400 mt-3 uppercase font-black tracking-[0.4em]">Assinatura do Emitente</p>
        </div>

        {/* Footer Brand & QR */}
        <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-100">
          <div className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
             DOCUMENTO GERADO VIA MEI SMART DOC
          </div>
          
          <div className="flex items-center gap-3">
            {settings?.qrCodeUrl && (
               <div className="p-1 border border-gray-100 rounded-lg">
                 <img src={settings.qrCodeUrl} alt="QR" className="w-10 h-10 object-contain grayscale opacity-50" />
               </div>
            )}
            <div className="text-right">
               <p className="text-[7px] font-black text-gray-300 uppercase leading-none">SEGURANÇA</p>
               <p className="font-mono text-[8px] text-gray-300">{data.verificationCode?.substring(0, 10) || 'HASH-SEC'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
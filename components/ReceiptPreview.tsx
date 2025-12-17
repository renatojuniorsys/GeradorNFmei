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
      className="bg-white p-8 max-w-[210mm] mx-auto shadow-lg print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-8 relative box-border"
    >
      <div className="border-2 border-gray-800 p-8 relative print:border-gray-800">
        {/* Cut Line Visual */}
        <div className="absolute -left-[2px] -right-[2px] -top-8 flex items-center justify-center text-gray-400 text-xs print:hidden">
          <Scissors className="w-4 h-4 mr-2" /> Recibo de Pagamento
        </div>

        {/* Receipt Header */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
          <div className="text-left flex flex-col gap-2">
            {/* Custom Logo Display */}
            {settings?.logoUrl && (
              <div className="mb-2">
                <img src={settings.logoUrl} alt="Logo Empresa" className="h-16 object-contain" />
              </div>
            )}
            
            <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-wide">RECIBO</h2>
            <p className="text-sm font-medium text-gray-600 mt-1 uppercase">
              Referente à NF Nº {data.number || '---'}
            </p>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-4 rounded min-w-[200px] text-center print:bg-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Valor</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.values.netValue)}</p>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="space-y-6 text-lg leading-relaxed text-gray-800 font-serif">
          <p>
            Recebemos de <span className="font-bold underline decoration-dotted decoration-gray-400 print:no-underline print:border-b print:border-gray-400">{data.borrower.name || '____________________'}</span>, 
            inscrito(a) no CPF/CNPJ sob nº <span className="font-mono text-base">{formatDocument(data.borrower.document) || '________________'}</span>,
            a importância de:
          </p>

          <div className="bg-gray-50 border-l-4 border-gray-800 p-4 font-bold italic text-gray-700 print:bg-gray-50 print:border-gray-800">
            "{numberToWordsPTBR(data.values.netValue).toUpperCase()}"
          </div>

          <p>
            Referente aos serviços prestados de: <span className="italic">{data.description ? data.description.substring(0, 100) + (data.description.length > 100 ? '...' : '') : 'Serviços gerais'}</span>.
          </p>

          <p>
            Para maior clareza, firmamos o presente recibo dando plena e geral quitação.
          </p>
        </div>

        {/* Date and Place */}
        <div className="mt-12 text-right font-serif">
          <p>
            {data.provider.city || 'Cidade'}, {formatDate(data.issueDate)}
          </p>
        </div>

        {/* Signature Area */}
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="w-2/3 border-b border-gray-800 mb-2"></div>
          <p className="font-bold text-gray-900">{data.provider.name}</p>
          <p className="text-sm text-gray-600">CNPJ: {formatDocument(data.provider.document)}</p>
          <p className="text-xs text-gray-400 mt-1">Assinatura do Prestador</p>
        </div>

        {/* Footer Brand & QR */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
          <div className="text-[10px] text-gray-300 print:text-gray-400">
             Gerado via MEI Smart Doc
          </div>
          
          {settings?.qrCodeUrl && (
             <div className="opacity-80">
               <img src={settings.qrCodeUrl} alt="QR" className="w-12 h-12 object-contain" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
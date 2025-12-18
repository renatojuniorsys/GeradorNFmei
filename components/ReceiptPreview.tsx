import React from 'react';
import { InvoiceData, AppSettings } from '../types';
import { formatCurrency, formatDate, formatDocument, numberToWordsPTBR } from '../services/utils';
import { Scissors, Building2, QrCode, CheckCircle2 } from 'lucide-react';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  refProp?: React.RefObject<HTMLDivElement>;
  isSuccess?: boolean;
}

export const ReceiptPreview: React.FC<Props> = ({ data, settings, refProp, isSuccess }) => {
  // Gera o link oficial da NFS-e Nacional para o QR Code do Recibo
  const cleanKey = data.accessKey?.replace(/\D/g, '') || '';
  const officialUrl = cleanKey 
    ? `https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${cleanKey}`
    : `https://www.nfse.gov.br/ConsultaPublica/?cod=${data.verificationCode}`;
    
  const dynamicQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(officialUrl)}`;

  return (
    <div 
      ref={refProp}
      className="bg-white p-8 md:p-12 w-full max-w-[210mm] h-[297mm] mx-auto shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:max-w-none print:mx-0 print:p-8 relative flex flex-col box-border border border-gray-100 print:border-none overflow-hidden"
    >
      {/* Success Animation Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[2px] animate-fade-in no-print">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-emerald-100 flex flex-col items-center gap-6 animate-pop-in">
             <div className="bg-emerald-500 p-6 rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-16 h-16 text-white" />
             </div>
             <div className="text-center">
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Documento Gerado!</h3>
               <p className="text-emerald-600 font-bold text-sm tracking-widest mt-1 uppercase">Pronto para salvar ou imprimir</p>
             </div>
          </div>
        </div>
      )}

      <div className="border-[3px] border-gray-900 p-8 md:p-10 relative flex flex-col flex-grow print:border-gray-900 overflow-hidden">
        {/* Cut Line Visual - Apenas Tela */}
        <div className="absolute -left-[3px] -right-[3px] -top-10 flex items-center justify-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] no-print">
          <Scissors className="w-3 h-3 mr-2" /> Recibo de Quitação Profissional
        </div>

        {/* Receipt Header - Layout Ajustado para Logo (Esquerda) e Título/Valor (Direita) */}
        <div className="flex justify-between items-start mb-12 border-b-4 border-gray-900 pb-8 min-h-[140px]">
          
          {/* Logo - Canto Superior Esquerdo */}
          <div className="flex items-start max-w-[200px]">
            {settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Logo Empresa" 
                className="max-h-32 w-auto object-contain object-left" 
              />
            ) : (
              <div className="bg-gray-900 text-white p-4 rounded-2xl inline-flex shadow-lg">
                <Building2 className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Título e Valor Total - Alinhados à Direita conforme solicitado */}
          <div className="flex flex-col items-end gap-6 text-right">
            <div>
              <h2 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">RECIBO</h2>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">
                REFERENTE À NF Nº {data.number || '---'}
              </p>
            </div>
            
            <div className="bg-white border-[3px] border-gray-900 p-5 rounded-2xl min-w-[200px] text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">VALOR TOTAL</p>
              <p className="text-3xl font-black text-gray-900 tabular-nums whitespace-nowrap">
                {formatCurrency(data.values.netValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="space-y-10 text-xl leading-relaxed text-gray-800 font-medium">
          <p>
            Recebemos de <span className="font-black border-b-2 border-gray-300 pb-0.5">{data.borrower.name || '____________________'}</span>, 
            inscrito(a) no CPF/CNPJ sob o nº <span className="font-mono text-lg font-bold bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">{formatDocument(data.borrower.document) || '________________'}</span>,
            a importância líquida de:
          </p>

          <div className="bg-gray-900 text-white p-8 rounded-3xl font-black italic text-2xl shadow-xl print:bg-gray-900 print:text-white leading-tight text-center tracking-tight">
            "{numberToWordsPTBR(data.values.netValue).toUpperCase()}"
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">REFERENTE AOS SERVIÇOS:</p>
            <p className="italic text-gray-700 leading-relaxed border-l-8 border-gray-200 pl-6 py-2 text-lg bg-gray-50/30 rounded-r-2xl">
              {data.description || 'Prestação de serviços diversos conforme discriminado na nota fiscal correspondente.'}
            </p>
          </div>

          <p className="text-lg">
            Para maior clareza e validade jurídica, firmamos o presente recibo dando plena, rasa e geral quitação do valor acima mencionado.
          </p>
        </div>

        {/* Spacer dinâmico */}
        <div className="flex-grow"></div>

        {/* Date and Place */}
        <div className="mt-8 text-right">
          <p className="text-xl font-black text-gray-900">
            {data.provider.city || 'Cidade'}, {formatDate(data.issueDate)}
          </p>
        </div>

        {/* Signature Area */}
        <div className="mt-10 mb-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm border-b-2 border-gray-900 mb-4 opacity-30"></div>
          <p className="font-black text-2xl text-gray-900 uppercase tracking-tight text-center">{data.provider.name}</p>
          <p className="text-xs font-bold text-gray-500 tracking-widest mt-1 uppercase">CNPJ: {formatDocument(data.provider.document)}</p>
          <p className="text-[10px] text-gray-400 mt-4 uppercase font-black tracking-[0.5em]">Assinatura do Emitente</p>
        </div>

        {/* Footer Brand & QR Section - QR Code dinâmico apontando para portal oficial se não houver upload */}
        <div className="mt-auto flex justify-between items-end pt-8 border-t-2 border-gray-900">
          <div className="flex flex-col gap-4 max-w-[50%]">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] leading-relaxed">
               ESTE DOCUMENTO POSSUI VALIDADE JURÍDICA QUANDO ACOMPANHADO DA NOTA FISCAL ELETRÔNICA CORRESPONDENTE.
            </div>
            
            <div className="flex flex-col gap-1">
               <p className="text-[8px] font-black text-gray-900 uppercase leading-none tracking-widest">AUTENTICIDADE DO DOCUMENTO</p>
               <p className="font-mono text-[11px] text-indigo-600 font-black bg-indigo-50 px-2 py-1 rounded-lg self-start">
                 {data.verificationCode?.toUpperCase() || 'HASH-SECURITY-2025'}
               </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 border-2 border-white rounded-2xl bg-white shadow-lg overflow-hidden flex items-center justify-center bg-white">
              <img 
                src={settings?.qrCodeUrl || dynamicQrUrl} 
                alt="QR Code Validação Oficial" 
                className="w-[113px] h-[113px] object-contain" 
                style={{ width: '30mm', height: '30mm' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=error';
                }}
              />
            </div>
            <p className="text-[9px] font-black text-gray-900 uppercase tracking-tight text-center max-w-[150px] leading-tight italic">
              Escaneie para validação ou pagamento via PIX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
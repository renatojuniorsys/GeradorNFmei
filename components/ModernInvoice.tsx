
import { 
  Building2, 
  CheckCircle2, 
  User, 
  Copy, 
  Move, 
  Edit3, 
  Save, 
  Calendar, 
  CreditCard, 
  Hash, 
  HelpCircle, 
  Printer, 
  Loader2 
} from 'lucide-react';
import React, { useState } from 'react';
import { formatCurrency, formatDocument, formatDate } from '../services/utils';
import { AppSettings, InvoiceData, PdfMargins } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  data: InvoiceData;
  settings?: AppSettings;
  isSuccess?: boolean;
  isDownloading?: boolean;
  isPrinting?: boolean; 
  onDownloadReceipt?: () => void;
  onDownloadInvoice?: () => void;
  onUpdateMargins?: (margins: PdfMargins) => void;
  onUpdateData?: (updatedData: InvoiceData) => void;
  onShareFullPdf?: () => void;
}

export const ModernInvoice: React.FC<Props> = ({ 
  data, 
  settings, 
  isSuccess, 
  isDownloading, 
  isPrinting = false,
  onDownloadInvoice,
  onUpdateMargins, 
  onUpdateData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<InvoiceData>(data);
  const [shareStatus, setShareStatus] = useState<'IDLE' | 'COPIED'>('IDLE');
  
  const margins = settings?.pdfMargins || { top: 40, bottom: 40, left: 40, right: 40 };

  const cleanKey = data.accessKey?.replace(/\D/g, '') || '';
  const officialUrl = cleanKey 
    ? `https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${cleanKey}`
    : `https://www.nfse.gov.br/ConsultaPublica/?cod=${data.verificationCode}`;
    
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(officialUrl)}&margin=10&format=png`;

  const handleMarginChange = (key: keyof PdfMargins, value: string) => {
    const numValue = Math.max(0, Math.floor(Number(value)) || 0);
    if (onUpdateMargins) {
      onUpdateMargins({ ...margins, [key]: numValue });
    }
  };

  const saveEdits = () => {
    if (onUpdateData) onUpdateData(editValues);
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShareStatus('COPIED');
    setTimeout(() => setShareStatus('IDLE'), 2000);
  };

  const containerClasses = isPrinting
    ? "print-container bg-white text-gray-800 w-[794px] h-[1123px] relative flex flex-col box-border border-none overflow-hidden mx-auto"
    : `print-container bg-white text-gray-800 w-[210mm] h-[297mm] shadow-2xl print:shadow-none relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden origin-top transition-all duration-300
       scale-[0.45] min-[375px]:scale-[0.5] min-[425px]:scale-[0.6] min-[540px]:scale-[0.7] sm:scale-[0.8] md:scale-[0.9] lg:scale-100
       mb-[-160mm] min-[375px]:mb-[-140mm] min-[425px]:mb-[-115mm] min-[540px]:mb-[-85mm] sm:mb-[-55mm] md:mb-[-25mm] lg:mb-0
      `;

  const labelStyle = "text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-2";
  const valueStyle = "text-[12px] sm:text-[14px] font-bold text-gray-900 leading-tight block truncate";
  const sectionTitleStyle = "text-[11px] sm:text-[12px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 sm:mb-5 border-b-2 border-indigo-50/70 pb-2.5 flex items-center gap-2.5";

  return (
    <div className={`relative w-full flex flex-col items-center group max-w-full overflow-x-hidden ${isPrinting ? 'p-0' : 'pt-4'}`}>
      {!isPrinting && (
        <div className="no-print mb-8 w-full max-w-[210mm] flex flex-col gap-4 px-4 sm:px-0 animate-fade-in">
          {/* CONTROL BAR INTEGRADA COM TABS ACIMA NO COMPONENTE PAI */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white p-4 sm:p-5 rounded-b-3xl rounded-t-lg border border-gray-100 shadow-sm gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shrink-0"><Move className="w-5 h-5" /></div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest">Controles do Documento</h4>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ajuste fino e edição rápida</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex justify-between sm:justify-start gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                  <div key={side} className="flex flex-col items-center">
                    <label className="text-[7px] font-black text-gray-400 uppercase mb-0.5">{side}</label>
                    <input type="number" min="0" value={margins[side]} onChange={(e) => handleMarginChange(side, e.target.value)} className="w-10 bg-white border border-gray-200 rounded-lg p-1 text-center text-[10px] font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/10" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => isEditing ? saveEdits() : setIsEditing(true)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isEditing ? 'Salvar' : 'Editar'}</span>
                </button>
                {onDownloadInvoice && !isEditing && (
                  <button onClick={onDownloadInvoice} disabled={isDownloading} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-70 ${isDownloading ? 'bg-gray-900 text-white shadow-none' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'}`}>
                    {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                    {isDownloading ? 'Gerando...' : 'Imprimir PDF'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuccess && !isPrinting && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[4px] rounded-[2.5rem] animate-fade-in no-print p-4">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-emerald-100 flex flex-col items-center gap-6 animate-pop-in text-center max-w-sm">
             <div className="bg-emerald-500 p-6 rounded-full"><CheckCircle2 className="w-12 h-12 text-white" /></div>
             <h3 className="text-2xl font-black text-gray-900 uppercase">Sucesso!</h3>
          </div>
        </div>
      )}

      <div className={containerClasses} style={{ paddingTop: `${margins.top}px`, paddingBottom: `${margins.bottom}px`, paddingLeft: `${margins.left}px`, paddingRight: `${margins.right}px` }}>
        <div className="flex flex-col flex-grow bg-white relative">
          <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-4">
            <div className="flex gap-4 sm:gap-7">
              <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-2xl sm:rounded-[1.8rem] flex items-center justify-center overflow-hidden border border-gray-100 p-2 shadow-inner">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-200" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1.5">NFS-e Eletrônica</h1>
                <p className="text-[9px] sm:text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] opacity-90">MEI SmartDoc Engine</p>
                <div className="flex gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div className="bg-gray-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                    <span className="text-[7px] sm:text-[9px] font-black uppercase opacity-60 block tracking-widest">Nota Nº</span>
                    <span className="text-xs sm:text-sm font-black tabular-nums">{data.number}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="p-2 border-2 border-gray-50 rounded-xl bg-white shadow-sm mb-2">
                <img src={dynamicQrUrl} alt="QR" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Cód: <span className="text-gray-900">{data.verificationCode}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 bg-gray-50/40 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100/60 shadow-inner">
            <div className="px-2">
              <span className={labelStyle}><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Emissão</span>
              {isEditing ? (
                <input type="date" value={editValues.issueDate || ''} onChange={e => setEditValues({...editValues, issueDate: e.target.value})} className="w-full text-xs p-1.5 border rounded-lg text-gray-700 font-bold" />
              ) : (
                <span className={valueStyle}>{formatDate(data.issueDate)}</span>
              )}
            </div>
            <div className="px-2 sm:border-x border-gray-200/50">
              <span className={labelStyle}><CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Competência</span>
              <span className={valueStyle}>{formatDate(data.issueDate)}</span>
            </div>
            <div className="sm:text-right px-2">
              <span className={`${labelStyle} sm:justify-end`}><Hash className="w-3.5 h-3.5 text-indigo-400" /> Município</span>
              <span className={valueStyle}>{data.provider.city} / {data.provider.state}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-8">
            <div className="p-6 sm:p-7 bg-white border border-gray-100 rounded-[1.8rem] sm:rounded-[2.2rem] shadow-sm relative overflow-hidden group/card">
              <h3 className={sectionTitleStyle}><Building2 className="w-4.5 h-4.5" /> Prestador</h3>
              <div className="space-y-4">
                <div>
                  <span className={labelStyle}>Razão Social</span>
                  {isEditing ? (
                    <input value={editValues.provider.name || ''} onChange={e => setEditValues({...editValues, provider: {...editValues.provider, name: e.target.value}})} className="w-full text-xs p-1.5 border rounded-lg text-gray-700 font-bold" />
                  ) : (
                    <span className="text-[13px] sm:text-[14px] font-black text-gray-900 leading-snug uppercase line-clamp-2">{data.provider.name}</span>
                  )}
                </div>
                <div>
                  <span className={labelStyle}>CNPJ / CPF</span>
                  <span className="text-[11px] sm:text-[12px] font-mono font-bold text-indigo-700 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">{formatDocument(data.provider.document)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-7 bg-white border border-gray-100 rounded-[1.8rem] sm:rounded-[2.2rem] shadow-sm relative overflow-hidden group/card">
              <h3 className={sectionTitleStyle} style={{color: '#10b981', borderColor: '#d1fae5'}}><User className="w-4.5 h-4.5" /> Tomador</h3>
              <div className="space-y-4">
                <div>
                  <span className={labelStyle}>Nome / Razão Social</span>
                  {isEditing ? (
                    <input value={editValues.borrower.name || ''} onChange={e => setEditValues({...editValues, borrower: {...editValues.borrower, name: e.target.value}})} className="w-full text-xs p-1.5 border rounded-lg text-gray-700 font-bold" />
                  ) : (
                    <span className="text-[13px] sm:text-[14px] font-black text-gray-900 leading-snug uppercase line-clamp-2">{data.borrower.name}</span>
                  )}
                </div>
                <div>
                  <span className={labelStyle}>CNPJ / CPF</span>
                  <span className="text-[11px] sm:text-[12px] font-mono font-bold text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100">{formatDocument(data.borrower.document)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col mb-8">
            <div className="bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4.5 rounded-t-[1.5rem] sm:rounded-t-[2rem] flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Discriminação dos Serviços</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ativ: {data.activityCode}</span>
            </div>
            <div className="border-x-2 border-b-2 border-gray-100 rounded-b-[1.5rem] sm:rounded-b-[2rem] p-6 sm:p-8 flex-grow bg-white">
              {isEditing ? (
                <textarea value={editValues.description || ''} onChange={e => setEditValues({...editValues, description: e.target.value})} className="w-full h-full min-h-[140px] text-[13px] p-3 border border-gray-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-500/5 outline-none text-gray-700" />
              ) : (
                <p className="text-[13px] sm:text-[14px] font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="p-4 sm:p-5 bg-gray-50/60 rounded-xl border border-gray-100">
              <span className={labelStyle}>Serviços</span>
              <span className="text-[14px] sm:text-[15px] font-black text-gray-900">{formatCurrency(data.values.serviceValue)}</span>
            </div>
            <div className="p-4 sm:p-5 bg-gray-50/60 rounded-xl border border-gray-100">
              <span className={labelStyle}>Deduções</span>
              <span className="text-[14px] sm:text-[15px] font-black text-gray-900">{formatCurrency(data.values.discount || 0)}</span>
            </div>
            <div className="p-4 sm:p-5 bg-gray-50/60 rounded-xl border border-gray-100">
              <span className={labelStyle}>Base Cálc.</span>
              <span className="text-[14px] sm:text-[15px] font-black text-gray-900">{formatCurrency(data.values.serviceValue)}</span>
            </div>
            <div className="p-4 sm:p-6 bg-indigo-600 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col justify-center">
              <span className="text-[8px] sm:text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1 opacity-90">Valor Líquido</span>
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{formatCurrency(data.values.netValue)}</span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t-2 border-dashed border-gray-100">
            <div className="bg-gray-50/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <span className={`${labelStyle} inline-flex items-center gap-1.5`}>Chave de Acesso <HelpCircle className="w-3 h-3 text-indigo-300" /></span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] sm:text-[12px] font-mono font-bold text-gray-400 break-all select-all">{data.accessKey || 'VALIDAÇÃO_AUTOMÁTICA_PENDENTE'}</span>
                  {!isPrinting && data.accessKey && (
                    <button onClick={() => copyToClipboard(data.accessKey!)} className="text-indigo-400 hover:text-indigo-600 shrink-0">
                      {shareStatus === 'COPIED' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-center sm:text-right">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Documento Válido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

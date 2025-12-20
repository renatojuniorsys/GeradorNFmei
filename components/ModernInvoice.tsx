
import { 
  Building2, 
  CheckCircle2, 
  User, 
  Copy, 
  FileSignature, 
  Move, 
  Edit3, 
  Save, 
  X, 
  Download, 
  Trash2, 
  Share2,
  ExternalLink,
  QrCode,
  ChevronRight,
  Calendar,
  CreditCard,
  Hash,
  HelpCircle,
  Printer,
  Loader2
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
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
  onUpdateData,
  onShareFullPdf
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<InvoiceData>(data);
  const [shareStatus, setShareStatus] = useState<'IDLE' | 'COPIED'>('IDLE');
  
  const margins = settings?.pdfMargins || { top: 40, bottom: 40, left: 40, right: 40 };

  const cleanKey = data.accessKey?.replace(/\D/g, '') || '';
  const officialUrl = cleanKey 
    ? `https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${cleanKey}`
    : `https://www.nfse.gov.br/ConsultaPublica/?cod=${data.verificationCode}`;
    
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(officialUrl)}&margin=10&format=png`;

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
    : `print-container bg-white text-gray-800 w-[210mm] h-[297mm] max-h-[297mm] shadow-2xl print:shadow-none relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden origin-top transition-all duration-300
       scale-[0.6] min-[375px]:scale-[0.65] min-[425px]:scale-[0.7] min-[540px]:scale-[0.75] sm:scale-[0.8] md:scale-[0.9] lg:scale-100
       mb-[-120mm] min-[375px]:mb-[-105mm] min-[425px]:mb-[-90mm] min-[540px]:mb-[-75mm] sm:mb-[-60mm] md:mb-[-30mm] lg:mb-0
      `;

  const labelStyle = "text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-2";
  const valueStyle = "text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight block truncate";
  const sectionTitleStyle = "text-[11px] sm:text-[12px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-5 border-b-2 border-indigo-50/70 pb-2.5 flex items-center gap-2.5";

  return (
    <div className={`relative w-full flex flex-col items-center group max-w-full overflow-x-auto no-scrollbar ${isPrinting ? 'p-0' : ''}`}>
      
      {!isPrinting && (
        <div className="no-print mb-8 w-full max-w-[210mm] flex flex-col gap-4 px-4 sm:px-0 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><Move className="w-5 h-5" /></div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest">Layout do Documento</h4>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ajuste de margens e edição</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex gap-2 sm:gap-4">
                {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                  <div key={side} className="flex flex-col items-center">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">{side}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={margins[side]} 
                      onChange={(e) => handleMarginChange(side, e.target.value)}
                      className="w-10 bg-gray-50 border border-gray-100 rounded-lg p-1.5 text-center text-[10px] font-black outline-none focus:ring-1 focus:ring-indigo-300 transition-all"
                    />
                  </div>
                ))}
              </div>
              
              <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => isEditing ? saveEdits() : setIsEditing(true)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isEditing ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isEditing ? <><Save className="w-3.5 h-3.5" /> Salvar</> : <><Edit3 className="w-3.5 h-3.5" /> Editar Dados</>}
                </button>

                {onDownloadInvoice && !isEditing && (
                  <button 
                    onClick={onDownloadInvoice}
                    disabled={isDownloading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                  >
                    {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                    Imprimir / PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuccess && !isPrinting && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-[2.5rem] animate-fade-in no-print p-4">
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-emerald-100 flex flex-col items-center gap-6 animate-pop-in text-center w-full max-w-sm">
             <div className="bg-emerald-500 p-5 sm:p-6 rounded-full"><CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" /></div>
             <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Documento Gerado!</h3>
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
        <div className="flex flex-col flex-grow bg-white relative">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-4">
            <div className="flex gap-7">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-[1.8rem] flex items-center justify-center overflow-hidden border border-gray-100 p-2.5 shadow-inner">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-200" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1.5">Nota Fiscal de Serviço</h1>
                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] opacity-90">Eletrônica (NFS-e)</p>
                <div className="flex gap-4 mt-4">
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg shadow-gray-200/50">
                    <span className="text-[9px] font-black uppercase opacity-60 block mb-0.5 tracking-widest">Nº da Nota</span>
                    <span className="text-sm font-black tabular-nums">{data.number}</span>
                  </div>
                  <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl border border-gray-200">
                    <span className="text-[9px] font-black uppercase opacity-60 block mb-0.5 tracking-widest">Série</span>
                    <span className="text-sm font-black tabular-nums">{data.series || '1'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <div className="p-2.5 border-2 border-gray-50 rounded-2xl bg-white shadow-sm mb-3">
                <img src={dynamicQrUrl} alt="Validação" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Valide via QR Code<br/>ou Código: <span className="text-gray-900 font-bold">{data.verificationCode}</span></p>
            </div>
          </div>

          {/* Dynamic Dynamic Relationship Title */}
          <div className="mb-6 px-2 flex items-center gap-4 bg-gray-50/20 py-3 rounded-2xl">
            <div className="h-[2px] flex-grow bg-gradient-to-r from-transparent via-gray-100 to-gray-200"></div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
              <span className="text-gray-400">Prestador:</span>
              <span className="text-indigo-600 truncate max-w-[120px] sm:max-w-[200px]">{data.provider.name}</span>
              <span className="text-gray-300 mx-1 italic">vs</span>
              <span className="text-gray-400">Tomador:</span>
              <span className="text-emerald-600 truncate max-w-[120px] sm:max-w-[200px]">{data.borrower.name}</span>
            </div>
            <div className="h-[2px] flex-grow bg-gradient-to-l from-transparent via-gray-100 to-gray-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-10 bg-gray-50/40 p-6 rounded-[2rem] border border-gray-100/60 shadow-inner">
            <div className="px-2">
              <span className={labelStyle}><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Data de Emissão</span>
              {isEditing ? (
                <input type="date" value={editValues.issueDate || ''} onChange={e => setEditValues({...editValues, issueDate: e.target.value})} className="w-full text-sm p-1.5 border rounded-lg" />
              ) : (
                <span className={valueStyle}>{formatDate(data.issueDate)}</span>
              )}
            </div>
            <div className="px-2 border-x border-gray-200/50">
              <span className={labelStyle}><CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Competência</span>
              <span className={valueStyle}>{formatDate(data.issueDate)}</span>
            </div>
            <div className="text-right px-2">
              <span className={labelStyle} style={{justifyContent: 'flex-end'}}><Hash className="w-3.5 h-3.5 text-indigo-400" /> Município Prestador</span>
              <span className={valueStyle}>{data.provider.city} / {data.provider.state}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div className="p-7 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm relative overflow-hidden group/card transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50/40 rounded-full -mr-12 -mt-12 transition-transform group-hover/card:scale-125"></div>
              <h3 className={sectionTitleStyle}><Building2 className="w-4.5 h-4.5" /> Prestador de Serviços</h3>
              <div className="space-y-5 relative z-10">
                <div>
                  <span className={labelStyle}>Razão Social / Nome</span>
                  {isEditing ? (
                    <input value={editValues.provider.name || ''} onChange={e => setEditValues({...editValues, provider: {...editValues.provider, name: e.target.value}})} className="w-full text-sm p-1.5 border rounded-lg" />
                  ) : (
                    <span className="text-[14px] font-black text-gray-900 leading-snug uppercase line-clamp-2 tracking-tight">{data.provider.name}</span>
                  )}
                </div>
                <div className="flex gap-6">
                  <div className="flex-1">
                    <span className={labelStyle}>CNPJ / CPF</span>
                    <span className="text-[12px] font-mono font-bold text-indigo-700 bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50">{formatDocument(data.provider.document)}</span>
                  </div>
                  <div className="flex-1">
                    <span className={labelStyle}>Cidade/UF</span>
                    <span className="text-[13px] font-bold text-gray-700">{data.provider.city} / {data.provider.state}</span>
                  </div>
                </div>
                <div>
                  <span className={labelStyle}>Endereço Completo</span>
                  <span className="text-[12px] font-bold text-gray-400 leading-snug line-clamp-2 italic opacity-80">{data.provider.address}</span>
                </div>
              </div>
            </div>

            <div className="p-7 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm relative overflow-hidden group/card transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50/40 rounded-full -mr-12 -mt-12 transition-transform group-hover/card:scale-125"></div>
              <h3 className={sectionTitleStyle} style={{color: '#10b981', borderColor: '#d1fae5'}}><User className="w-4.5 h-4.5" /> Tomador de Serviços</h3>
              <div className="space-y-5 relative z-10">
                <div>
                  <span className={labelStyle}>Nome / Razão Social</span>
                  {isEditing ? (
                    <input value={editValues.borrower.name || ''} onChange={e => setEditValues({...editValues, borrower: {...editValues.borrower, name: e.target.value}})} className="w-full text-sm p-1.5 border rounded-lg" />
                  ) : (
                    <span className="text-[14px] font-black text-gray-900 leading-snug uppercase line-clamp-2 tracking-tight">{data.borrower.name}</span>
                  )}
                </div>
                <div className="flex gap-6">
                  <div className="flex-1">
                    <span className={labelStyle}>CNPJ / CPF</span>
                    <span className="text-[12px] font-mono font-bold text-emerald-700 bg-emerald-50/50 px-3 py-1 rounded-lg border border-emerald-100/50">{formatDocument(data.borrower.document)}</span>
                  </div>
                  <div className="flex-1">
                    <span className={labelStyle}>E-mail</span>
                    <span className="text-[12px] font-bold text-gray-600 truncate block">{data.borrower.email || 'Não informado'}</span>
                  </div>
                </div>
                <div>
                  <span className={labelStyle}>Endereço Completo</span>
                  <span className="text-[12px] font-bold text-gray-400 leading-snug line-clamp-2 italic opacity-80">{data.borrower.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col mb-10">
            <div className="bg-gray-900 text-white px-8 py-4.5 rounded-t-[2rem] flex justify-between items-center shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Discriminação dos Serviços</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-80">Código: {data.activityCode}</span>
            </div>
            <div className="border-x-2 border-b-2 border-gray-100 rounded-b-[2rem] p-8 flex-grow bg-white shadow-inner">
              {isEditing ? (
                <textarea 
                  value={editValues.description || ''} 
                  onChange={e => setEditValues({...editValues, description: e.target.value})} 
                  className="w-full h-full min-h-[160px] text-[14px] p-4 border-2 border-gray-100 rounded-2xl font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              ) : (
                <p className="text-[14px] font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-100/80 transition-colors hover:bg-gray-50">
              <span className={labelStyle}>Vlr. Serviços</span>
              <span className="text-[15px] font-black text-gray-900 tracking-tight">{formatCurrency(data.values.serviceValue)}</span>
            </div>
            <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-100/80 transition-colors hover:bg-gray-50">
              <span className={labelStyle}>Deduções</span>
              <span className="text-[15px] font-black text-gray-900 tracking-tight">{formatCurrency(data.values.discount || 0)}</span>
            </div>
            <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-100/80 transition-colors hover:bg-gray-50">
              <span className={labelStyle}>Base Cálculo</span>
              <span className="text-[15px] font-black text-gray-900 tracking-tight">{formatCurrency(data.values.serviceValue)}</span>
            </div>
            
            <div className="p-6 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-center min-h-[90px] transition-transform hover:scale-[1.02]">
              <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1 opacity-90">Valor Líquido</span>
              <span className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none">
                {formatCurrency(data.values.netValue)}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t-2 border-dashed border-gray-200">
            <div className="bg-gray-50/50 p-5 rounded-[1.8rem] flex items-center justify-between gap-8 border border-gray-100/60">
              <div className="flex-grow">
                <InfoTooltip content="Esta é a chave de acesso da NFS-e, usada para validação oficial.">
                  <span className={`${labelStyle} cursor-help inline-flex items-center gap-1.5`}>
                    Chave de Acesso (44 dígitos)
                    <HelpCircle className="w-3 h-3 text-indigo-300" />
                  </span>
                </InfoTooltip>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-mono font-bold text-gray-400 break-all select-all tracking-tighter opacity-80">{data.accessKey || 'GERADO_AUTOMATICAMENTE_PELA_SEFAZ'}</span>
                  {!isPrinting && data.accessKey && (
                    <button onClick={() => copyToClipboard(data.accessKey!)} className="text-indigo-400 hover:text-indigo-600 transition-all active:scale-90 shrink-0">
                      {shareStatus === 'COPIED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1.5">Autenticidade</p>
                <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Documento Válido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

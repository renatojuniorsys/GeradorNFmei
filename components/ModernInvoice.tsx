
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
  Loader2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Info,
  Layers
} from 'lucide-react';
import React, { useState } from 'react';
import { formatCurrency, formatDocument, formatDateTime, formatDate, formatInvoiceNumber } from '../services/utils';
import { AppSettings, InvoiceData, PdfMargins, EntityData } from '../types';
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
    if (value === '') {
      if (onUpdateMargins) onUpdateMargins({ ...margins, [key]: 0 });
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && onUpdateMargins) {
      onUpdateMargins({ ...margins, [key]: Math.max(0, numValue) });
    }
  };

  const saveEdits = () => {
    if (onUpdateData) onUpdateData(editValues);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      saveEdits();
    } else {
      setEditValues(data);
      setIsEditing(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShareStatus('COPIED');
    setTimeout(() => setShareStatus('IDLE'), 2000);
  };

  const containerClasses = isPrinting
    ? "print-container bg-white text-gray-800 w-[794px] h-[1123px] relative flex flex-col box-border border-none overflow-hidden mx-auto"
    : `print-container bg-white text-gray-800 w-[210mm] h-[297mm] shadow-2xl print:shadow-none relative flex flex-col box-border border border-gray-100 print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden origin-top transition-all duration-300
       scale-[0.45] min-[375px]:scale-[0.5] min-[425px]:scale-[0.6] min-[540px]:scale-[0.7] sm:scale(0.8) md:scale-[0.9] lg:scale-100
       mb-[-160mm] min-[375px]:mb-[-140mm] min-[425px]:mb-[-115mm] min-[540px]:mb-[-85mm] sm:mb-[-55mm] md:mb-[-25mm] lg:mb-0
      `;

  const labelStyle = "text-[7.5px] sm:text-[8.5px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5";
  const sectionTitleStyle = "text-[10px] sm:text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 border-b border-indigo-50 pb-1.5 flex items-center gap-2";

  const EntityCard = ({ title, entity, type }: { title: string, entity: EntityData, type: 'provider' | 'borrower' }) => {
    const isProv = type === 'provider';
    const accent = isProv ? 'indigo' : 'emerald';
    
    return (
      <div className={`p-4 sm:p-5 bg-white border border-gray-100 rounded-[1.8rem] shadow-sm relative overflow-hidden flex flex-col gap-3 transition-all hover:shadow-md hover:border-${accent}-100`}>
        <div className={`absolute top-0 left-0 w-1 h-full bg-${accent}-500/20`}></div>
        <h3 className={sectionTitleStyle} style={{ color: isProv ? '#4f46e5' : '#10b981', borderColor: isProv ? '#eef2ff' : '#ecfdf5' }}>
          {isProv ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />} {title}
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className={labelStyle}>Razão Social / Nome</span>
              <span className="text-[10.5px] sm:text-[11.5px] font-black text-gray-900 uppercase leading-none block">
                {entity.name || '---'}
              </span>
            </div>
            <div className="shrink-0 sm:text-right">
              <span className={`${labelStyle} sm:justify-end`}>CNPJ / CPF</span>
              <span className={`inline-flex text-[9px] sm:text-[10px] font-mono font-black text-${accent}-600 bg-${accent}-50 px-2.5 py-0.5 rounded-lg border border-${accent}-100/30 whitespace-nowrap`}>
                {formatDocument(entity.document)}
              </span>
            </div>
          </div>

          <div>
            <span className={labelStyle}><MapPin className="w-2.5 h-2.5" /> Endereço Completo</span>
            <span className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-700 leading-tight uppercase block">
              {entity.address || 'Não informado'}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2 border-t border-gray-50 pt-3">
            <div className="col-span-12 sm:col-span-5">
              <span className={labelStyle}>Cidade / UF</span>
              <span className="text-[9.5px] sm:text-[10.5px] font-black text-gray-900 uppercase block truncate">{entity.city} / {entity.state}</span>
            </div>
            <div className="col-span-6 sm:col-span-3">
              <span className={labelStyle}>CEP</span>
              <span className="text-[9.5px] sm:text-[10.5px] font-mono font-bold text-gray-900 block">{entity.zipCode || '---'}</span>
            </div>
            <div className="col-span-6 sm:col-span-4 sm:text-right">
              <span className={`${labelStyle} sm:justify-end`}>Insc. Municipal</span>
              <span className="text-[9.5px] sm:text-[10.5px] font-mono font-bold text-gray-900 block">{entity.municipalRegistration || '-'}</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 sm:col-span-7">
              <span className={labelStyle}><Mail className="w-2.5 h-2.5" /> E-mail</span>
              <span className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-600 lowercase block break-all leading-none">{entity.email || '---'}</span>
            </div>
            <div className="col-span-12 sm:col-span-5 sm:text-right">
              <span className={`${labelStyle} sm:justify-end`}><Phone className="w-2.5 h-2.5" /> Telefone</span>
              <span className="text-[9.5px] sm:text-[10.5px] font-black text-gray-900 block leading-none">{entity.phone || '---'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative w-full flex flex-col items-center group max-w-full overflow-x-hidden ${isPrinting ? 'p-0' : 'pt-4'}`}>
      {!isPrinting && (
        <div className="no-print mb-8 w-full max-w-[210mm] flex flex-col gap-4 px-4 sm:px-0 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shrink-0"><Move className="w-5 h-5" /></div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest">Ajuste da Nota</h4>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Margens de impressão</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex justify-between sm:justify-start gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                  <div key={side} className="flex flex-col items-center">
                    <label className="text-[7px] font-black text-gray-400 uppercase mb-0.5">{side}</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={margins[side] === 0 ? '' : margins[side]} 
                      placeholder="0"
                      onChange={(e) => handleMarginChange(side, e.target.value)} 
                      className="w-10 bg-white border border-gray-200 rounded-lg p-1 text-center text-[10px] font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleToggleEdit} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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

      <div className={containerClasses} style={{ paddingTop: `${margins.top}px`, paddingBottom: `${margins.bottom}px`, paddingLeft: `${margins.left}px`, paddingRight: `${margins.right}px` }}>
        <div className="flex flex-col h-full bg-white relative">
          
          <div className="grid grid-cols-3 items-center border border-gray-200 px-4 py-2 mb-2 bg-gray-50/10 rounded-t-[1.5rem] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-black rounded mb-0.5">NFS-e</div>
                <div className="text-[5.5px] font-black text-gray-400 uppercase leading-none tracking-tighter">Nota Fiscal de</div>
                <div className="text-[5.5px] font-black text-gray-400 uppercase leading-none tracking-tighter">Serviço eletrônica</div>
              </div>
            </div>

            <div className="text-center flex flex-col justify-center border-x border-gray-100 h-full py-0.5">
              <h1 className="text-[11px] font-black text-gray-800 leading-none uppercase">{data.documentTitle || 'DANFSe v1.0'}</h1>
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{data.documentSubtitle || 'Documento Auxiliar da NFS-e'}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pl-2">
              <div className="text-right">
                <h2 className="text-[8.5px] font-black text-gray-700 leading-none uppercase">{data.cityIssuer || `MUNICÍPIO DE TERESINA-PI`}</h2>
                <p className="text-[6px] font-bold text-gray-500 leading-none uppercase mt-0.5">{data.cityDepartment || 'SECRETARIA MUNICIPAL DE FINANÇAS'}</p>
              </div>
              <div className="w-6 h-6 flex items-center justify-center opacity-30">
                 <ShieldCheck className="w-4 h-4 text-gray-900" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center border border-gray-100 rounded-[2rem] mb-3 bg-white shadow-sm overflow-hidden ring-1 ring-gray-50 shrink-0">
            <div className="col-span-3 h-24 flex items-center justify-center p-2 border-r border-gray-50 bg-gray-50/40">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Empresa" className="max-h-20 w-auto object-contain transition-transform hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center opacity-30 text-indigo-300">
                  <Building2 className="w-7 h-7" />
                  <span className="text-[7px] font-black uppercase tracking-tighter mt-1">Sua Empresa</span>
                </div>
              )}
            </div>

            <div className="col-span-3 h-full border-r border-gray-50 flex flex-col justify-center px-6 py-3 bg-white">
              <span className={labelStyle}>Número da Nota</span>
              <span className="text-2xl font-black text-gray-900 tabular-nums leading-none tracking-tighter">{formatInvoiceNumber(data.number)}</span>
            </div>

            <div className="col-span-4 h-full border-r border-gray-50 flex flex-col justify-center px-6 py-3 bg-white">
              <span className={labelStyle}>Código de Verificação</span>
              <div className="inline-block">
                <span className="text-[10px] font-mono font-black text-indigo-600 leading-none block uppercase bg-indigo-50/40 py-2 px-3 rounded-xl border border-indigo-100/50 shadow-inner">
                  {data.verificationCode}
                </span>
              </div>
            </div>

            <div className="col-span-2 h-full flex flex-col items-center justify-center p-2 bg-gray-50/20 gap-1">
              <div className="bg-white p-1 border border-gray-100 rounded-xl shadow-sm">
                <img src={dynamicQrUrl} alt="QR" className="w-11 h-11 object-contain" />
              </div>
              <p className="text-[5.5px] font-black text-gray-500 text-center leading-[1.1] px-1 uppercase tracking-tight">
                Autenticidade via QR Code ou portal nacional
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 mb-3 shrink-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-indigo-50/20 border border-indigo-100/30 p-3 rounded-[1.2rem] shadow-sm">
              <div className="flex flex-col">
                <span className={labelStyle}>Número da NFS-e</span>
                <span className="text-[10px] font-black text-gray-800 tracking-tight">{formatInvoiceNumber(data.number)}</span>
              </div>
              <div className="flex flex-col">
                <span className={labelStyle}>Competência</span>
                <span className="text-[10px] font-black text-gray-800 tracking-tight">{formatDate(data.issueDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className={labelStyle}>Número DPS</span>
                <span className="text-[10px] font-black text-gray-800 tracking-tight">{data.dpsNumber || '---'}</span>
              </div>
              <div className="flex flex-col">
                <span className={labelStyle}>Série DPS</span>
                <span className="text-[10px] font-black text-gray-800 tracking-tight">{data.dpsSeries || '---'}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 bg-gray-50/40 p-3 rounded-[1.2rem] border border-gray-100 shadow-inner">
              <div className="px-1">
                <span className={labelStyle}><Calendar className="w-3 h-3 text-indigo-400" /> Data de Emissão</span>
                <span className="text-[10.5px] font-black text-gray-900 leading-tight block truncate tracking-tight">{formatDate(data.issueDate)}</span>
              </div>
              <div className="px-1">
                <span className={labelStyle}><Hash className="w-3 h-3 text-indigo-400" /> Município Incidência</span>
                <span className="text-[10.5px] font-black text-gray-900 leading-tight block truncate tracking-tight">{data.provider.city} / {data.provider.state}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-4 mb-3 shrink-0">
            <EntityCard title="Prestador de Serviços" entity={data.provider} type="provider" />
            <EntityCard title="Tomador de Serviços" entity={data.borrower} type="borrower" />
          </div>

          <div className="flex-grow flex flex-col px-4 mb-3 overflow-hidden min-h-[120px]">
            <div className="bg-gray-900 text-white px-5 py-2.5 rounded-t-[1.5rem] flex justify-between items-center shadow-md shrink-0">
              <span className="text-[8.5px] font-black uppercase tracking-[0.25em]">Discriminação dos Serviços</span>
              <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest">Atividade: {data.activityCode}</span>
            </div>
            <div className="border-x-2 border-b-2 border-gray-100 rounded-b-[1.5rem] p-5 flex-grow bg-white overflow-y-auto no-scrollbar">
              <p className="text-[11px] font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap tracking-tight">
                {data.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 px-4 mb-4 shrink-0">
            <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-100 flex flex-col justify-center">
              <span className={labelStyle}>Valor Serviços</span>
              <span className="text-[12.5px] font-black text-gray-900 tabular-nums leading-none">{formatCurrency(data.values.serviceValue)}</span>
            </div>
            <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-100 flex flex-col justify-center">
              <span className={labelStyle}>Deduções</span>
              <span className="text-[12.5px] font-black text-gray-900 tabular-nums leading-none">{formatCurrency(data.values.discount || 0)}</span>
            </div>
            <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-100 flex flex-col justify-center">
              <span className={labelStyle}>Base Cálculo</span>
              <span className="text-[12.5px] font-black text-gray-900 tabular-nums leading-none">{formatCurrency(data.values.serviceValue)}</span>
            </div>
            <div className="p-3 bg-indigo-600 rounded-[1.5rem] shadow-xl flex flex-col justify-center border border-indigo-500">
              <span className="text-[8px] font-black text-indigo-100 uppercase tracking-widest mb-0.5 opacity-90">Valor Líquido</span>
              <span className="text-lg font-black text-white tabular-nums tracking-tighter leading-none">{formatCurrency(data.values.netValue)}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 px-4 pb-4 border-t-2 border-dashed border-gray-100 shrink-0">
            <div className="bg-gray-50/30 p-4 rounded-[1.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100/50">
              <div className="w-full sm:w-auto">
                <span className={`${labelStyle} inline-flex items-center gap-2`}>Chave de Acesso <HelpCircle className="w-3.5 h-3.5 text-indigo-300" /></span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-gray-500 break-all select-all tracking-tight leading-none">
                    {data.accessKey || 'VALIDAÇÃO_AUTOMÁTICA_PENDENTE'}
                  </span>
                  {!isPrinting && data.accessKey && (
                    <button onClick={() => copyToClipboard(data.accessKey!)} className="text-indigo-400 hover:text-indigo-600 shrink-0 p-1 hover:bg-white rounded-lg transition-all">
                      {shareStatus === 'COPIED' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Autenticidade Garantida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

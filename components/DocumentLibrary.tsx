
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  Eye, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  ChevronLeft,
  Filter,
  Download,
  MoreVertical,
  ExternalLink,
  FileSpreadsheet,
  X,
  FileSignature
} from 'lucide-react';
import { HistoryItem, AppSettings } from '../types';
import { formatDate, formatCurrency } from '../services/utils';
import { ReceiptPreview } from './ReceiptPreview';

interface Props {
  items: HistoryItem[];
  settings?: AppSettings;
  onView: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const DocumentLibrary: React.FC<Props> = ({ items, settings, onView, onDelete, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<HistoryItem | null>(null);

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.data.provider.name?.toLowerCase().includes(search) ||
      item.data.borrower.name?.toLowerCase().includes(search) ||
      item.data.number?.includes(search)
    );
  });

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;

    const headers = ['Nº Nota', 'Data Emissão', 'Prestador', 'Tomador', 'Valor Líquido'];
    const rows = filteredItems.map(item => [
      item.data.number || '---',
      formatDate(item.data.issueDate),
      item.data.provider.name || '---',
      item.data.borrower.name || '---',
      formatCurrency(item.data.values.netValue)
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // BOM for Excel compatibility in UTF-8
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_notas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in py-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 px-4">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Meus Documentos</h2>
          <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <HistoryIcon className="w-3.5 h-3.5" /> Arquivo completo de notas geradas
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:auto">
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente ou nº..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 font-black text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button 
            onClick={onClose}
            className="p-3.5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white p-16 sm:p-32 rounded-[3rem] border border-gray-100 text-center shadow-sm">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase mb-3">Nenhum Registro</h3>
          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
            {searchTerm ? 'Nenhuma nota encontrada para sua busca.' : 'Suas notas aparecerão aqui assim que forem processadas.'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-8 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedPreview(item)}
              className="group bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 shrink-0">
                  {item.data.number?.slice(-2) || 'NF'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Nota Nº {item.data.number || '---'}</p>
                  <h4 className="text-base font-black text-gray-900 tracking-tight truncate uppercase">{item.data.provider.name}</h4>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center gap-3 text-gray-400 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(item.data.issueDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.data.borrower.name}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Valor Total</span>
                  <span className="text-lg font-black text-gray-900">{formatCurrency(item.data.values.netValue)}</span>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2.5 rounded-xl text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  Visualizar <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Pré-visualização do Recibo */}
      {selectedPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/90 backdrop-blur-xl p-4 sm:p-8 animate-fade-in no-print">
          <div className="relative bg-[#f8fafc] w-full max-w-5xl h-full max-h-[95vh] rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-pop-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white">
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Pré-visualização do Recibo</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NF Nº {selectedPreview.data.number}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onView(selectedPreview)}
                  className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir Editor Completo
                </button>
                <button 
                  onClick={() => setSelectedPreview(null)}
                  className="p-3.5 bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-2xl transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable area for receipt */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-12 no-scrollbar bg-gray-50 flex flex-col items-center">
              <div className="w-full max-w-[210mm] transform scale-90 sm:scale-100 origin-top">
                <ReceiptPreview 
                  data={selectedPreview.data} 
                  settings={settings}
                />
              </div>
            </div>
            
            {/* Modal Footer Hints */}
            <div className="p-6 text-center border-t border-gray-100 bg-white shrink-0">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                 Use o Editor Completo para imprimir ou ajustar margens.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  Eye, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  ChevronLeft,
  FileSpreadsheet,
  X,
  FileSignature,
  ExternalLink,
  ChevronRight,
  Maximize2,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.data.provider.name?.toLowerCase().includes(search) ||
      item.data.borrower.name?.toLowerCase().includes(search) ||
      item.data.number?.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_notas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
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
        <div className="bg-white p-16 sm:p-32 rounded-[3rem] border border-gray-100 text-center shadow-sm mx-4">
          <FileText className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 uppercase">Nenhum Registro</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Aguardando novos documentos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {paginatedItems.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                  <button 
                    onClick={() => setSelectedPreview(item)}
                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Visualização Rápida"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-6" onClick={() => onView(item)}>
                  <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 shrink-0 cursor-pointer">
                    {item.data.number?.slice(-2) || 'NF'}
                  </div>
                  <div className="overflow-hidden cursor-pointer">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Nº {item.data.number}</p>
                    <h4 className="text-base font-black text-gray-900 truncate uppercase">{item.data.provider.name}</h4>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow cursor-pointer" onClick={() => onView(item)}>
                  <div className="flex items-center gap-2.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {formatDate(item.data.issueDate)}
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest truncate">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" /> {item.data.borrower.name}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">{formatCurrency(item.data.values.netValue)}</span>
                    <button 
                      onClick={() => onView(item)}
                      className="text-indigo-600 hover:text-indigo-800 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPreview(item)}
                    className="w-full py-3 bg-gray-50 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> Visualização Rápida
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4 px-4 pb-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-11 h-11 rounded-2xl text-xs font-black uppercase transition-all ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                          : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                Exibindo {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} de {filteredItems.length} registros
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal de Visualização Rápida (Quick View) */}
      {selectedPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
          {/* Backdrop com Blur */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedPreview(null)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-pop-in">
            
            {/* Header Fixo */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Pré-visualização do Recibo</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nota Fiscal Nº {selectedPreview.data.number}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPreview(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Área de Preview Rolável */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-8 no-scrollbar flex flex-col items-center">
              <div className="w-full transform scale-[0.7] sm:scale-100 origin-top">
                <ReceiptPreview 
                  data={selectedPreview.data} 
                  settings={settings}
                />
              </div>
            </div>

            {/* Footer de Ações */}
            <div className="bg-white p-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Clique em "Editor Completo" para imprimir ou ajustar margens.</p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setSelectedPreview(null)}
                  className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => onView(selectedPreview)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Editor Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

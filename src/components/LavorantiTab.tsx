import React, { useState } from 'react';
import { Plus, Trash2, Search, Upload, Download, Users, Edit2, Check, X } from 'lucide-react';

interface LavorantiTabProps {
  lavoranti: string[];
  onAddLavorante: (nome: string) => void;
  onUpdateLavorante: (index: number, newName: string) => void;
  onDeleteLavorante: (index: number) => void;
  onOpenCsvModal: () => void;
}

export const LavorantiTab: React.FC<LavorantiTabProps> = ({
  lavoranti,
  onAddLavorante,
  onUpdateLavorante,
  onDeleteLavorante,
  onOpenCsvModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newLavorante, setNewLavorante] = useState('');

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLavorante.trim()) return;

    onAddLavorante(newLavorante.trim());
    setNewLavorante('');
  };

  const startEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditName(currentName);
  };

  const saveEdit = (index: number) => {
    if (!editName.trim()) return;
    onUpdateLavorante(index, editName.trim());
    setEditingIndex(null);
  };

  const filteredLavoranti = lavoranti
    .map((name, index) => ({ name, originalIndex: index }))
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const exportLavorantiCsv = () => {
    let csv = 'Lavorante / Terzista\n';
    lavoranti.forEach((name) => {
      csv += `"${name.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lavoranti_hydro_mec_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Add New Worker Form Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Anagrafica Lavoranti e Terzisti</h3>
              <p className="text-xs text-slate-500">
                Totale {lavoranti.length} lavoranti censiti nel database locale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCsvModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Importa da CSV</span>
            </button>
            <button
              type="button"
              onClick={exportLavorantiCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Esporta CSV</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-9">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome Lavorante / Ragione Sociale Terzista / Reparto *
            </label>
            <input
              type="text"
              required
              placeholder="Es. Mario Rossi, Meccanica Delta Srl, Reparto Tornitura"
              value={newLavorante}
              onChange={(e) => setNewLavorante(e.target.value)}
              className="w-full text-sm font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Lavorante</span>
            </button>
          </div>
        </form>
      </div>

      {/* Workers Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Search Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca lavorante per nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Visualizzati <b>{filteredLavoranti.length}</b> di {lavoranti.length} lavoranti
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Nome / Ragione Sociale Lavorante</th>
                <th className="p-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLavoranti.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    Nessun lavorante trovato corrispondente ai criteri di ricerca.
                  </td>
                </tr>
              ) : (
                filteredLavoranti.map((item, displayIdx) => {
                  const isEditing = editingIndex === item.originalIndex;

                  if (isEditing) {
                    return (
                      <tr key={item.originalIndex} className="bg-emerald-50/50">
                        <td className="p-3 text-center text-slate-400">{item.originalIndex + 1}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full text-xs font-bold p-1.5 border border-emerald-400 rounded bg-white"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => saveEdit(item.originalIndex)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"
                              title="Salva"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"
                              title="Annulla"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.originalIndex} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-mono">
                        {item.originalIndex + 1}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 text-sm">
                        {item.name}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item.originalIndex, item.name)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Modifica lavorante"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Sei sicuro di voler eliminare il lavorante "${item.name}"?`)) {
                                onDeleteLavorante(item.originalIndex);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina lavorante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Articolo } from '../types';
import { Plus, Trash2, Search, Upload, Download, Package, Edit2, Check, X } from 'lucide-react';

interface ArticoliTabProps {
  articoli: Articolo[];
  onAddArticolo: (articolo: Omit<Articolo, 'id'>) => void;
  onUpdateArticolo: (id: string, updated: Partial<Articolo>) => void;
  onDeleteArticolo: (id: string) => void;
  onOpenCsvModal: () => void;
}

export const ArticoliTab: React.FC<ArticoliTabProps> = ({
  articoli,
  onAddArticolo,
  onUpdateArticolo,
  onDeleteArticolo,
  onOpenCsvModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newCodice, setNewCodice] = useState('');
  const [newRev, setNewRev] = useState('Rev. 00');
  const [newDescrizione, setNewDescrizione] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCodice, setEditCodice] = useState('');
  const [editRev, setEditRev] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodice.trim()) return;

    onAddArticolo({
      codice: newCodice.trim(),
      rev: newRev.trim() || 'Rev. 00',
      descrizione: newDescrizione.trim()
    });

    setNewCodice('');
    setNewRev('Rev. 00');
    setNewDescrizione('');
  };

  const startEdit = (art: Articolo) => {
    setEditingId(art.id);
    setEditCodice(art.codice);
    setEditRev(art.rev);
    setEditDesc(art.descrizione || '');
  };

  const saveEdit = (id: string) => {
    if (!editCodice.trim()) return;
    onUpdateArticolo(id, {
      codice: editCodice.trim(),
      rev: editRev.trim() || 'Rev. 00',
      descrizione: editDesc.trim()
    });
    setEditingId(null);
  };

  // Filtered list
  const filteredArticoli = articoli.filter(
    (a) =>
      a.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.rev.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.descrizione && a.descrizione.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Export articles to CSV
  const exportArticoliCsv = () => {
    let csv = 'Codice;Revisione;Descrizione\n';
    articoli.forEach((a) => {
      csv += `"${a.codice.replace(/"/g, '""')}";"${a.rev.replace(/"/g, '""')}";"${(a.descrizione || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `articoli_hydro_mec_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Add New Article Form Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Anagrafica Articoli e Revisioni</h3>
              <p className="text-xs text-slate-500">
                Totale {articoli.length} articoli registrati nel database locale
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
              onClick={exportArticoliCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Esporta CSV</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Codice Articolo *
            </label>
            <input
              type="text"
              required
              placeholder="Es. ART-10293 o CORPO-01"
              value={newCodice}
              onChange={(e) => setNewCodice(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Numero Revisione
            </label>
            <input
              type="text"
              placeholder="Es. Rev. 02"
              value={newRev}
              onChange={(e) => setNewRev(e.target.value)}
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descrizione (Opzionale)
            </label>
            <input
              type="text"
              placeholder="Es. Albero veloce Ø35"
              value={newDescrizione}
              onChange={(e) => setNewDescrizione(e.target.value)}
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Articles Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Search Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca per codice o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Visualizzati <b>{filteredArticoli.length}</b> di {articoli.length} articoli
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3">Codice Articolo</th>
                <th className="p-3">Revisione</th>
                <th className="p-3">Descrizione</th>
                <th className="p-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticoli.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Nessun articolo trovato corrispondente ai criteri di ricerca.
                  </td>
                </tr>
              ) : (
                filteredArticoli.map((art) => {
                  const isEditing = editingId === art.id;

                  if (isEditing) {
                    return (
                      <tr key={art.id} className="bg-blue-50/50">
                        <td className="p-3">
                          <input
                            type="text"
                            value={editCodice}
                            onChange={(e) => setEditCodice(e.target.value)}
                            className="w-full text-xs font-bold p-1.5 border border-blue-400 rounded bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editRev}
                            onChange={(e) => setEditRev(e.target.value)}
                            className="w-full text-xs p-1.5 border border-blue-400 rounded bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full text-xs p-1.5 border border-blue-400 rounded bg-white"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => saveEdit(art.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"
                              title="Salva"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
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
                    <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900 text-sm">
                        {art.codice}
                      </td>
                      <td className="p-3 text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                          {art.rev}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {art.descrizione || <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(art)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica articolo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Sei sicuro di voler eliminare l'articolo ${art.codice}?`)) {
                                onDeleteArticolo(art.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina articolo"
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

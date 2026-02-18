import React, { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { Filter, Search, Plus } from 'lucide-react';

// Configuração das Colunas (Conforme SPEC.md)
const COLUMNS = [
    { id: '1', title: 'Pré-Venda', color: 'border-t-blue-500', bg: 'bg-blue-50/30' },
    { id: '2', title: 'Venda / Projeto', color: 'border-t-blue-500', bg: 'bg-blue-50/30' },
    { id: '3', title: 'Medição', color: 'border-t-purple-500', bg: 'bg-purple-50/30' },
    { id: '4', title: 'Executivo', color: 'border-t-purple-600', bg: 'bg-purple-50/30' },
    { id: '5', title: 'Fabricação', color: 'border-t-orange-500', bg: 'bg-orange-50/30' },
    { id: '6', title: 'Entrega', color: 'border-t-emerald-500', bg: 'bg-emerald-50/30' },
    { id: '7', title: 'Montagem', color: 'border-t-emerald-600', bg: 'bg-emerald-50/30' },
    { id: '8', title: 'Pós-Montagem', color: 'border-t-emerald-700', bg: 'bg-emerald-50/30' },
    { id: '9', title: 'Concluído', color: 'border-t-slate-500', bg: 'bg-slate-50/50' },
    { id: '10', title: 'Assistência', color: 'border-t-rose-500', bg: 'bg-rose-50/30' },
];

// DADOS MOCKADOS (Para teste visual imediato)
const MOCK_DATA = [
    { id: 1, client: 'Residencial Alphaville - Sr. João', stageId: '4', subStage: '4.4B', owner: 'Liberador', days: 2, urgency: 'Média', area: 45 },
    { id: 2, client: 'Ap. Jardins - Dona Maria', stageId: '2', subStage: '2.1', owner: 'Projetista', days: -3, urgency: 'Alta', area: 120 },
    { id: 3, client: 'Escritório Advocacia Silva', stageId: '7', subStage: '7.1', owner: 'Montador', days: 5, urgency: 'Baixa', area: 30 },
    { id: 4, client: 'Consultório Dra. Ana', stageId: '1', subStage: '1.2', owner: 'Vendedor', days: 1, urgency: 'Média', area: 15 },
    { id: 5, client: 'Loja Shopping', stageId: '5', subStage: '5.2', owner: 'Indústria', days: 20, urgency: 'Alta', area: 200 },
];

export function KanbanBoard() {
    const [filterText, setFilterText] = useState('');

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header do Board */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Painel Operacional</h1>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400 w-64"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                    <Plus size={16} /> Novo Projeto
                </button>
            </div>

            {/* Área de Colunas (Scroll Horizontal) */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full p-6 gap-5 min-w-max">
                    {COLUMNS.map((col) => (
                        <div key={col.id} className={`w-[320px] flex flex-col h-full rounded-xl ${col.bg} border border-slate-200/60 shadow-sm`}>
                            {/* Header da Coluna */}
                            <div className={`p-4 bg-white rounded-t-xl border-t-[3px] border-b border-slate-100 flex justify-between items-center shadow-sm ${col.color}`}>
                                <h2 className="font-bold text-slate-700 text-sm">{col.id}. {col.title}</h2>
                                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                    {MOCK_DATA.filter(p => p.stageId === col.id).length}
                                </span>
                            </div>

                            {/* Lista de Cards (Scroll Vertical) */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {MOCK_DATA
                                    .filter(p => p.stageId === col.id && p.client.toLowerCase().includes(filterText.toLowerCase()))
                                    .map((proj) => (
                                        <ProjectCard
                                            key={proj.id}
                                            {...proj}
                                            stage={proj.subStage}
                                        />
                                    ))}

                                {/* Estado Vazio */}
                                {MOCK_DATA.filter(p => p.stageId === col.id).length === 0 && (
                                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
                                        <span className="text-xs">Sem projetos</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

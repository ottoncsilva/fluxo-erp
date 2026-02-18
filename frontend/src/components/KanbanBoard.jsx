import React, { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import Sidebar from './Sidebar';
import { Filter, Search, Plus } from 'lucide-react';
import { NewProjectWizard } from './NewProjectWizard';
import { getKanbanProjects } from '../services/api';

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

const MOCK_STAGES = [
    { id: 1, stage_category: '1. Pré-Venda', stage_name: 'Briefing e Qualificação', stage_code: '1.1' },
    { id: 2, stage_category: '1. Pré-Venda', stage_name: 'Visita Showroom', stage_code: '1.2' },
    { id: 3, stage_category: '1. Pré-Venda', stage_name: 'Follow Up', stage_code: '1.3' },
    { id: 4, stage_category: '4. Executivo', stage_name: 'Construção Ambientes', stage_code: '4.1' },
    { id: 5, stage_category: '4. Executivo', stage_name: 'Aprovação Financeira', stage_code: '4.4A' },
    { id: 6, stage_category: '4. Executivo', stage_name: 'Detalhamento Executivo', stage_code: '4.4B' },
];

export function KanbanBoard() {
    const [filterText, setFilterText] = useState('');
    const [selectedStage, setSelectedStage] = useState(null);
    const [activeSubstage, setActiveSubstage] = useState(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    // Carregar Projetos Reais
    const loadProjects = async () => {
        try {
            const data = await getKanbanProjects();
            setProjects(data);
        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleCardClick = (client) => {
        // Futuro: Abrir modal de detalhes
        console.log(`Abrir detalhes do projeto: ${client}`);
    };

    const handleHeaderClick = (col) => {
        setSelectedStage({ stage_category: `${col.id}. ${col.title}` });
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar
                selectedStage={selectedStage}
                allStages={MOCK_STAGES}
                onSubstageSelect={setActiveSubstage}
                activeSubstage={activeSubstage}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Superior */}
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
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus size={16} /> Novo Projeto
                    </button>
                </div>

                {/* Área de Colunas (Scroll Horizontal) */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full p-6 gap-5 min-w-max">
                        {COLUMNS.map((col) => (
                            <div key={col.id} className={`w-[320px] flex flex-col h-full rounded-xl ${col.bg} border border-slate-200/60 shadow-sm`}>

                                <div
                                    onClick={() => handleHeaderClick(col)}
                                    className={`p-4 bg-white rounded-t-xl border-t-[3px] border-b border-slate-100 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${col.color}`}
                                >
                                    <h2 className="font-bold text-slate-700 text-sm">{col.id}. {col.title}</h2>
                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                        {projects.filter(p => p.stageId === col.id).length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                    {projects
                                        .filter(p => p.stageId === col.id && p.clientName.toLowerCase().includes(filterText.toLowerCase()))
                                        .map((proj) => (
                                            <div key={proj.id} onClick={() => handleCardClick(proj.clientName)}>
                                                <ProjectCard
                                                    {...proj}
                                                    stage={proj.subStage}
                                                />
                                            </div>
                                        ))}

                                    {projects.filter(p => p.stageId === col.id).length === 0 && (
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

            {isWizardOpen && (
                <NewProjectWizard
                    onClose={() => setIsWizardOpen(false)}
                    onSuccess={() => {
                        loadProjects();
                    }}
                />
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { KanbanColumn, KanbanCard } from '../types';

const KanbanBoard: React.FC = () => {
    const [filter, setFilter] = useState('');
    const { batches, projects, workflowConfig, setCurrentProjectId } = useProjects();

    const getColumns = (): KanbanColumn[] => {
        const stages = Array.from(new Set(Object.values(workflowConfig).map(s => s.stage))).sort((a, b) => a - b);
        return stages.map(stageNum => {
            // Find first step definition for this stage to get label
            const stepDef = Object.values(workflowConfig).find(s => s.stage === stageNum);
            return {
                id: stageNum,
                title: stepDef ? getStageLabel(stageNum) : `Etapa ${stageNum}`,
                cards: batches
                    .filter(b => workflowConfig[b.currentStepId]?.stage === stageNum)
                    .map(b => {
                        const project = projects.find(p => p.id === b.projectId);
                        const step = workflowConfig[b.currentStepId];
                        return {
                            id: b.id,
                            projectId: b.projectId,
                            title: b.name,
                            subtitle: project?.client.phone || '',
                            clientName: project?.client.name || 'Desconhecido',
                            stepLabel: step.label,
                            owner: step.ownerRole,
                            slaStatus: 'No Prazo', // TODO: Calc SLA
                            slaColor: 'emerald',
                            date: new Date(b.lastUpdated).toLocaleDateString(),
                            environmentCount: b.environmentIds.length,
                            currentStepId: b.currentStepId
                        } as KanbanCard;
                    })
                    .filter(c => c.clientName.toLowerCase().includes(filter.toLowerCase()))
            };
        });
    };

    const getStageLabel = (stage: number) => {
        switch (stage) {
            case 1: return '1. Pré-Venda';
            case 2: return '2. Venda / Projeto';
            case 3: return '3. Medição';
            case 4: return '4. Executivo';
            case 5: return '5. Fabricação';
            case 6: return '6. Entrega';
            case 7: return '7. Montagem';
            case 8: return '8. Assistência';
            case 9: return '9. Finalizado';
            default: return `Etapa ${stage}`;
        }
    };

    const columns = getColumns();

    return (
        <div className="h-full flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            {/* Toolbar */}
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a2632]">
                <div className="flex items-center gap-4 w-96">
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-xl">add</span>
                    <span>Novo Projeto</span>
                </button>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex gap-6 h-full min-w-max">
                    {columns.map(col => (
                        <div key={col.id} className="w-80 flex flex-col gap-4">
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <span className="text-sm uppercase tracking-wide">{col.title}</span>
                                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{col.cards.length}</span>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 pb-4">
                                {col.cards.length === 0 && (
                                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                                        Sem projetos
                                    </div>
                                )}
                                {col.cards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => setCurrentProjectId(card.projectId)}
                                        className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {card.clientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{card.clientName}</h3>
                                                    <p className="text-xs text-slate-500">{card.title}</p>
                                                </div>
                                            </div>
                                            <div className={`size-2 rounded-full bg-${card.slaColor}-500`}></div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                                <span className="text-slate-500">Etapa Atual</span>
                                                <span className="font-medium text-primary">{card.stepLabel}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                    <span>{card.owner}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">grid_view</span>
                                                    <span>{card.environmentCount} amb.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;

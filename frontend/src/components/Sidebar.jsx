import React from 'react';
import { Filter, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

const Sidebar = ({ selectedStage, allStages, onSubstageSelect, activeSubstage }) => {
    // Filtra as subetapas da categoria selecionada
    const substages = selectedStage
        ? allStages.filter(s => s.stage_category === selectedStage.stage_category)
        : [];

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm z-10">
            <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-md">
                    <Filter size={18} className="text-white" />
                </div>
                <h2 className="font-bold text-gray-800">Filtros de Etapa</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {!selectedStage ? (
                    <div className="text-center text-gray-400 text-sm py-10 px-4">
                        Clique no título de uma coluna para ver as subetapas detalhadas.
                    </div>
                ) : (
                    <>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                            {selectedStage.stage_category}
                        </h3>
                        <div className="space-y-1">
                            {substages.map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => onSubstageSelect(sub)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors text-left
                            ${activeSubstage?.id === sub.id
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {activeSubstage?.id === sub.id ? (
                                        <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" />
                                    ) : (
                                        <Circle size={16} className="text-gray-300 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{sub.stage_name}</span>
                                    <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 rounded">
                                        {sub.stage_code}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                    Fluxo Planejados ERP v1.0
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

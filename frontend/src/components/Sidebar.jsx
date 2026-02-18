import React from 'react';
import { Filter, ChevronRight, LayoutDashboard, Settings, Users, LogOut } from 'lucide-react';

const Sidebar = ({ selectedStage, allStages, onSubstageSelect, activeSubstage }) => {
    const substages = selectedStage
        ? allStages.filter(s => s.stage_category === selectedStage.stage_category)
        : [];

    return (
        <div className="w-[260px] bg-slate-900 text-slate-300 h-full flex flex-col border-r border-slate-800 flex-shrink-0">

            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="font-bold text-white tracking-wide">Fluxo ERP</span>
            </div>

            {/* Contexto do Filtro */}
            <div className="p-6">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                    Filtro de Visualização
                </label>

                {!selectedStage ? (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 text-center">
                        <Filter size={20} className="mx-auto text-slate-500 mb-2" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Clique no título de uma coluna para detalhar as subetapas.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center text-blue-400 mb-4 font-medium">
                            <LayoutDashboard size={14} className="mr-2" />
                            {selectedStage.stage_category}
                        </div>

                        <div className="space-y-1">
                            {substages.map(sub => {
                                const isActive = activeSubstage?.id === sub.id;
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => onSubstageSelect(sub)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all
                                ${isActive
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        <span className="flex items-center truncate">
                                            <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-white' : 'bg-slate-600'}`}></span>
                                            {sub.stage_name}
                                        </span>
                                        {isActive && <ChevronRight size={12} />}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => onSubstageSelect(null)}
                            className="mt-4 w-full py-2 text-xs text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 rounded hover:border-slate-500 transition-colors"
                        >
                            Limpar Filtro
                        </button>
                    </div>
                )}
            </div>

            {/* Footer / User */}
            <div className="mt-auto p-4 border-t border-slate-800">
                <div className="flex items-center p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mr-3">
                        OS
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Otto Silva</p>
                        <p className="text-xs text-slate-500 truncate">Admin</p>
                    </div>
                    <Settings size={14} className="text-slate-500" />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

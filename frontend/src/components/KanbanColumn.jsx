import React from 'react';
import ProjectCard from './ProjectCard';
import { Plus, MoreHorizontal } from 'lucide-react';

const KanbanColumn = ({ stage, projects, onHeaderClick, isSelected }) => {
    return (
        <div className="flex-shrink-0 w-[320px] flex flex-col h-full max-h-full mx-2 first:ml-0 last:mr-0">

            {/* Header da Coluna */}
            <div
                onClick={() => onHeaderClick(stage)}
                className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-all border
        ${isSelected
                        ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                        : 'bg-transparent border-transparent hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${projects.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className={`font-semibold text-sm ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        {stage.category}
                    </span>
                    <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                        {projects.length}
                    </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                        <Plus size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-500 ml-1">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Área dos Cards */}
            <div className="flex-1 overflow-y-auto px-1 pb-2 custom-scrollbar">
                {/* Espaço de drop visual (futuro dnd) */}
                <div className="bg-gray-50/50 rounded-xl p-2 min-h-[150px] border border-dashed border-gray-200">
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}

                    {projects.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10 opacity-70">
                            <span className="text-sm">Vazio</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanColumn;

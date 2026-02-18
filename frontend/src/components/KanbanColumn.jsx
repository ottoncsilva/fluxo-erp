import React from 'react';
import ProjectCard from './ProjectCard';
import { MoreHorizontal } from 'lucide-react';

const KanbanColumn = ({ stage, projects, onHeaderClick, isSelected }) => {
    return (
        <div className="flex-shrink-0 w-80 bg-gray-50 h-full flex flex-col rounded-lg ml-3 first:ml-0 border border-gray-200">
            {/* Header */}
            <div
                onClick={() => onHeaderClick(stage)}
                className={`p-3 border-b flex justify-between items-center cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
            >
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-700 text-sm whitespace-nowrap">{stage.category}</span>
                    <span className="bg-gray-300 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
                        {projects.length}
                    </span>
                </div>
                <MoreHorizontal size={16} className="text-gray-400" />
            </div>

            {/* Cards Area */}
            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {projects.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs italic">
                        Nenhum projeto
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;

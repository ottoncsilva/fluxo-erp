import React from 'react';
import { Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';

const ProjectCard = ({ project }) => {
  // Lógica simples de SLA (pode ser melhorada com datas reais)
  const isLate = false; 

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-sm">{project.name}</h4>
        {isLate && <AlertTriangle size={14} className="text-red-500" />}
      </div>
      
      <p className="text-xs text-gray-500 mb-3">{project.client_name}</p>
      
      <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-100">
        <div className="flex items-center space-x-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
              Em Andamento
            </span>
        </div>
        
        {/* Avatar do Responsável (Placeholder) */}
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <User size={12} />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

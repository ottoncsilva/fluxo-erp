import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const ProjectCard = ({ project, onUpdate }) => {
    const currentStage = project.stages.length > 0
        ? project.stages[project.stages.length - 1]
        : null;

    const handleAdvance = async () => {
        if (!confirm(`Avançar "${project.client.name}" para a próxima etapa?`)) return;
        try {
            await api.post(`/projects/${project.id}/advance`);
            onUpdate();
        } catch (error) {
            console.error("Erro ao avançar etapa:", error);
            alert("Erro ao avançar etapa.");
        }
    };

    return (
        <div className="bg-white p-3 rounded shadow mb-3 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800">{project.client.name}</h4>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">#{project.id}</span>
            </div>

            {currentStage && (
                <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold text-blue-600">{currentStage.current_sub_stage_id} {currentStage.stage_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Calendar size={12} />
                        <span>SLA: {currentStage.sla_deadline ? new Date(currentStage.sla_deadline).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            )}

            <div className="mt-3 flex justify-end">
                <button
                    onClick={handleAdvance}
                    className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 border border-green-200"
                    title="Concluir etapa e avançar"
                >
                    <span>Avançar</span>
                    <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;

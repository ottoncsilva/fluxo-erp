import React from 'react';
import { useProjects } from '../context/ProjectContext';

interface ProjectDetailsProps {
    onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ onBack }) => {
    const { currentProjectId, getProjectById } = useProjects();
    const project = currentProjectId ? getProjectById(currentProjectId) : null;

    if (!project) return <div>Projeto não encontrado</div>;

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Projeto: {project.client.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
                    <h3 className="font-bold mb-4">Ambientes</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {project.environments.map(e => (
                            <div key={e.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold">{e.name}</h4>
                                <p className="text-sm text-slate-500">{e.area_sqm} m² - {e.urgency_level}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold mb-4">Detalhes do Cliente</h3>
                    <div className="space-y-3 text-sm">
                        <p><span className="text-slate-500">Email:</span> {project.client.email}</p>
                        <p><span className="text-slate-500">Telefone:</span> {project.client.phone}</p>
                        <p><span className="text-slate-500">Origem:</span> {project.client.origin}</p>
                        <p><span className="text-slate-500">Investimento:</span> R$ {project.client.budget_expectation}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;

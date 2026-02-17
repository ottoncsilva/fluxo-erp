import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ProjectCard from './ProjectCard';
import { Plus } from 'lucide-react';

const KanbanBoard = ({ openNewProjectModal }) => {
    const [workflow, setWorkflow] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Group generic stages (1, 2, 3...) for columns
    // We need to fetch workflow config to know the names of Stage 1, Stage 2
    // Or we can just group by "stage_number"

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wfRes, projRes] = await Promise.all([
                api.get('/workflow'),
                api.get('/projects/')
            ]);
            setWorkflow(wfRes.data);
            setProjects(projRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Organize columns by Stage Number (1, 2, 3)
    // We need a map of stage_number -> stage_name (General name like "Pré-Venda")
    // The SPEC has "1. Pré-Venda", "2. Venda". 
    // Let's deduce header from the first substage of that group or hardcode?
    // Hardcoding based on SPEC for better visuals as Workflow table stores individual steps
    const columns = [
        { id: 1, title: '1. Pré-Venda' },
        { id: 2, title: '2. Venda' },
        { id: 3, title: '3. Medição' },
        { id: 4, title: '4. Executivo' },
        { id: 5, title: '5. Fabricação' },
        { id: 6, title: '6. Entrega' },
        { id: 7, title: '7. Montagem' },
        { id: 8, title: '8. Pós-Montagem' },
        { id: 10, title: '10. Assistência' }, // Skip 9 Concluido for now or add it
    ];

    const getProjectsForColumn = (stageId) => {
        return projects.filter(p => {
            if (p.status === "Concluído") return false;
            // Find current active stage
            const currentHook = p.stages[p.stages.length - 1]; // Last one added
            if (!currentHook) return stageId === 1; // New ones default to 1? Or should have stage.

            // We need to map sub_stage "1.1" to stage_id 1.
            // The first char of sub_stage_id usually. 
            const hookStageNum = parseInt(currentHook.current_sub_stage_id.split('.')[0]);
            return hookStageNum === stageId;
        });
    };

    if (loading) return <div className="p-10 text-center">Carregando...</div>;

    return (
        <div className="flex h-full overflow-x-auto pb-4 gap-4 px-4 min-w-max">
            {columns.map(col => (
                <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-100 rounded-lg max-h-full">
                    <div className="p-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-200 rounded-t-lg flex justify-between">
                        <span>{col.title}</span>
                        <span className="bg-gray-300 text-xs px-2 py-1 rounded-full text-gray-700">
                            {getProjectsForColumn(col.id).length}
                        </span>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto">
                        {getProjectsForColumn(col.id).map(proj => (
                            <ProjectCard key={proj.id} project={proj} onUpdate={fetchData} />
                        ))}
                    </div>
                </div>
            ))}

            {/* Coluna Concluídos opcional */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-green-50 rounded-lg max-h-full">
                <div className="p-3 font-bold text-green-800 border-b border-green-200 bg-green-100 rounded-t-lg">
                    <span>9. Concluídos</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto">
                    {projects.filter(p => p.status === "Concluído").map(proj => (
                        <div key={proj.id} className="bg-white p-3 rounded shadow mb-3 opacity-75">
                            <h4 className="font-bold text-gray-800">{proj.client.name}</h4>
                            <div className="text-xs text-green-600 font-bold mt-1">FINALIZADO</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;

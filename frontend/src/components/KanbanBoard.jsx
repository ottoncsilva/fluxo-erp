import React, { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import Sidebar from './Sidebar';
import api from '../api/axios';

const KanbanBoard = () => {
    const [workflow, setWorkflow] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedStage, setSelectedStage] = useState(null);
    const [activeSubstage, setActiveSubstage] = useState(null);

    // Categorias únicas para as colunas (Ex: "1. Pré-Venda", "2. Venda")
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wfRes, projRes] = await Promise.all([
                api.get('/workflow'),
                api.get('/projects')
            ]);

            const wf = wfRes.data;
            setWorkflow(wf);
            setProjects(projRes.data);

            // Extrair categorias únicas ordenadas
            const cats = [];
            const seen = new Set();
            wf.forEach(stage => {
                if (!seen.has(stage.stage_category)) {
                    seen.add(stage.stage_category);
                    cats.push(stage);
                }
            });
            setCategories(cats);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    const handleHeaderClick = (categoryStage) => {
        setSelectedStage(categoryStage);
        setActiveSubstage(null); // Reseta filtro específico ao trocar de coluna
    };

    const handleSubstageSelect = (substage) => {
        setActiveSubstage(substage);
    };

    // Filtragem de Projetos
    const getProjectsForCategory = (categoryName) => {
        // Pega todas as etapas que pertencem a essa categoria
        const stageIds = workflow
            .filter(s => s.stage_category === categoryName)
            .map(s => s.id);

        // Se tiver subetapa ativa, filtra só ela
        if (selectedStage?.stage_category === categoryName && activeSubstage) {
            return projects.filter(p =>
                // Lógica simplificada: Verifica se algum room está nessa subetapa
                // Para o MVP, vamos assumir que o projeto está na etapa do primeiro room ou algo global
                // Ajuste conforme o modelo real de "current_global_stage" ou similar
                p.rooms.some(r => r.current_stage_id === activeSubstage.id)
            );
        }

        // Senão, retorna todos da categoria (visão macro)
        return projects.filter(p =>
            p.rooms.some(r => stageIds.includes(r.current_stage_id))
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar Lateral */}
            <Sidebar
                selectedStage={selectedStage}
                allStages={workflow}
                onSubstageSelect={handleSubstageSelect}
                activeSubstage={activeSubstage}
            />

            {/* Área do Kanban */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 p-4 shadow-sm z-0">
                    <h1 className="text-xl font-bold text-gray-800">Quadro de Projetos</h1>
                    <p className="text-xs text-gray-500">Visão Geral do Fluxo de Produção</p>
                </header>

                <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                    <div className="flex h-full pb-2">
                        {categories.map(cat => (
                            <KanbanColumn
                                key={cat.id}
                                stage={cat}
                                projects={getProjectsForCategory(cat.stage_category)}
                                onHeaderClick={handleHeaderClick}
                                isSelected={selectedStage?.stage_category === cat.stage_category}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default KanbanBoard;

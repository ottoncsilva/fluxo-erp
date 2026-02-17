import { useState } from 'react';
import NewProjectModal from './components/NewProjectModal';
import KanbanBoard from './components/KanbanBoard';
import { Plus } from 'lucide-react';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Hack to force refresh board

    const handleProjectCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">F</div>
                    <h1 className="text-xl font-bold text-gray-800">Fluxo Planejados ERP</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Novo Projeto
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden pt-4">
                <KanbanBoard key={refreshKey} />
            </main>

            {/* Modal */}
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
}

export default App;

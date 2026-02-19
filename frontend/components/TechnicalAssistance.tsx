import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { AssistanceTicket, AssistanceStatus, AssistanceItem } from '../types';

const ASSISTANCE_COLUMNS_DEF: { id: AssistanceStatus, title: string }[] = [
    { id: 'VISITA', title: 'Visita de Levantamento' },
    { id: '10.1', title: '10.1 - Solicitação de Peças' },
    { id: '10.2', title: '10.2 - Fabricação' },
    { id: '10.3', title: '10.3 - Transporte e Entrega' },
    { id: '10.4', title: '10.4 - Montagem Assistência' },
    { id: '10.6', title: '10.6 - Checklist Finalização' },
    { id: 'CONCLUIDO', title: 'Concluído' },
];

const TechnicalAssistance: React.FC = () => {
    const { assistanceTickets, updateAssistanceTicket, addAssistanceTicket, projects, assistanceWorkflow } = useProjects();
    
    // Filters
    const [hideCompleted, setHideCompleted] = useState(false);
    const [filterClient, setFilterClient] = useState('');
    const [filterAssembler, setFilterAssembler] = useState('');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isInspectionOpen, setIsInspectionOpen] = useState(false);
    const [activeTicket, setActiveTicket] = useState<AssistanceTicket | null>(null);
    
    // New Ticket State
    const [selectedClient, setSelectedClient] = useState('');
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketPriority, setTicketPriority] = useState<'Normal'|'Urgente'>('Normal');
    
    // New Item State (for Ticket Creation)
    const [newItems, setNewItems] = useState<Partial<AssistanceItem>[]>([]);
    
    // Temp Item Fields
    const [tempEnv, setTempEnv] = useState('');
    const [tempProb, setTempProb] = useState('');
    const [tempCostType, setTempCostType] = useState<'Custo Fábrica' | 'Custo Loja'>('Custo Loja');
    const [tempItemType, setTempItemType] = useState<'Compra' | 'Fabricação'>('Fabricação');
    const [tempSupplier, setTempSupplier] = useState('');
    const [tempDeadline, setTempDeadline] = useState('');

    const handleAddItemToDraft = () => {
        if(!tempEnv || !tempProb) {
            alert("Ambiente e Problema são obrigatórios para adicionar o item.");
            return;
        }
        setNewItems(prev => [...prev, {
            id: `item-${Date.now()}`,
            environmentName: tempEnv,
            problemDescription: tempProb,
            costType: tempCostType,
            itemType: tempItemType,
            supplier: tempSupplier,
            supplierDeadline: tempDeadline
        }]);
        // Reset temp fields
        setTempEnv('');
        setTempProb('');
        setTempCostType('Custo Loja');
        setTempItemType('Fabricação');
        setTempSupplier('');
        setTempDeadline('');
    };

    const handleCreateTicket = () => {
        if(!selectedClient || !ticketTitle || newItems.length === 0) {
            alert("Preencha o cliente, título e adicione pelo menos um item.");
            return;
        }
        const clientName = projects.find(p => p.client.id === selectedClient)?.client.name || 'Cliente';
        
        addAssistanceTicket({
            clientId: selectedClient,
            clientName: clientName,
            title: ticketTitle,
            status: 'VISITA',
            priority: ticketPriority,
            items: newItems as AssistanceItem[],
            assemblerName: '' // Can be assigned later
        });

        setIsCreateOpen(false);
        setTicketTitle('');
        setNewItems([]);
        setSelectedClient('');
    };

    const handleCardClick = (ticket: AssistanceTicket) => {
        setActiveTicket(ticket);
        setIsInspectionOpen(true);
    }

    // Inspection Modal State (Adding new items)
    const [inspectEnv, setInspectEnv] = useState('');
    const [inspectProb, setInspectProb] = useState('');
    const [inspectPart, setInspectPart] = useState('');
    const [inspectMeasure, setInspectMeasure] = useState('');
    const [inspectCostType, setInspectCostType] = useState<'Custo Fábrica' | 'Custo Loja'>('Custo Loja');
    const [inspectItemType, setInspectItemType] = useState<'Compra' | 'Fabricação'>('Fabricação');
    const [inspectSupplier, setInspectSupplier] = useState('');
    const [inspectDeadline, setInspectDeadline] = useState('');

    const handleAddInspectionItem = () => {
        if(!activeTicket || !inspectEnv || !inspectProb) return;
        const newItem: AssistanceItem = {
            id: `item-${Date.now()}`,
            environmentName: inspectEnv,
            problemDescription: inspectProb,
            partNeeded: inspectPart,
            measurements: inspectMeasure,
            costType: inspectCostType,
            itemType: inspectItemType,
            supplier: inspectSupplier,
            supplierDeadline: inspectDeadline
        };
        const updatedTicket = {
            ...activeTicket,
            items: [...activeTicket.items, newItem]
        };
        updateAssistanceTicket(updatedTicket);
        setActiveTicket(updatedTicket); // Update local state immediately
        
        // Reset
        setInspectEnv('');
        setInspectProb('');
        setInspectPart('');
        setInspectMeasure('');
        setInspectCostType('Custo Loja');
        setInspectItemType('Fabricação');
        setInspectSupplier('');
        setInspectDeadline('');
    };
    
    const handleAdvanceTicket = () => {
        if(!activeTicket) return;
        const currentIdx = ASSISTANCE_COLUMNS_DEF.findIndex(c => c.id === activeTicket.status);
        if (currentIdx < ASSISTANCE_COLUMNS_DEF.length - 1) {
             const nextStatus = ASSISTANCE_COLUMNS_DEF[currentIdx + 1].id;
             updateAssistanceTicket({ ...activeTicket, status: nextStatus });
             setIsInspectionOpen(false);
             setActiveTicket(null);
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#101922] overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] flex flex-col px-6 py-4 shrink-0 z-20 gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined">handyman</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Assistência Técnica</h1>
                            <p className="text-xs text-slate-500">Fluxo de resolução de não-conformidades.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Novo Chamado
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 flex-1 min-w-[200px]">
                        <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                        <input 
                            type="text" 
                            placeholder="Filtrar por Cliente..." 
                            value={filterClient}
                            onChange={(e) => setFilterClient(e.target.value)}
                            className="bg-transparent border-none text-sm w-full focus:ring-0 p-0 text-slate-700 dark:text-slate-200"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 flex-1 min-w-[200px]">
                        <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                        <input 
                            type="text" 
                            placeholder="Filtrar por Montador..." 
                            value={filterAssembler}
                            onChange={(e) => setFilterAssembler(e.target.value)}
                            className="bg-transparent border-none text-sm w-full focus:ring-0 p-0 text-slate-700 dark:text-slate-200"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none px-2">
                        <input 
                            type="checkbox" 
                            checked={hideCompleted} 
                            onChange={(e) => setHideCompleted(e.target.checked)}
                            className="rounded text-orange-600 focus:ring-orange-600 border-slate-300 dark:border-slate-600"
                        />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Ocultar Concluídos</span>
                    </label>
                </div>
            </div>

            {/* Kanban */}
            <div className="flex-1 overflow-x-auto p-6 custom-scrollbar">
                <div className="flex h-full gap-4 w-max">
                    {ASSISTANCE_COLUMNS_DEF.map(col => {
                        if (hideCompleted && col.id === 'CONCLUIDO') return null;
                        
                        // Filter logic
                        const columnTickets = assistanceTickets.filter(t => {
                            if (t.status !== col.id) return false;
                            const matchClient = t.clientName.toLowerCase().includes(filterClient.toLowerCase());
                            const matchAssembler = filterAssembler ? t.assemblerName?.toLowerCase().includes(filterAssembler.toLowerCase()) : true;
                            return matchClient && matchAssembler;
                        });

                        return (
                            <div key={col.id} className="flex flex-col w-80 h-full shrink-0">
                                <div className="flex items-center justify-between mb-3 px-3 py-2 bg-slate-100 dark:bg-[#15202b] rounded-lg border border-slate-200 dark:border-slate-800">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{col.title}</h3>
                                    <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                                        {columnTickets.length}
                                    </span>
                                </div>
                                
                                <div className="flex-1 bg-slate-100/30 dark:bg-[#15202b]/50 rounded-xl p-2 border border-slate-200/50 dark:border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                                    {columnTickets.map(ticket => {
                                        const slaDays = assistanceWorkflow.find(s => s.id === ticket.status)?.sla || 0;
                                        return (
                                            <div 
                                                key={ticket.id} 
                                                onClick={() => handleCardClick(ticket)}
                                                className="bg-white dark:bg-[#1e2936] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ticket.priority === 'Urgente' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {ticket.priority}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">SLA: {slaDays} dias</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 dark:text-white mb-1 truncate">{ticket.clientName}</h4>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 truncate">{ticket.title}</p>
                                                
                                                {ticket.assemblerName && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                                                        <span className="text-xs text-slate-500">{ticket.assemblerName}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                     <span className="material-symbols-outlined text-sm text-slate-400">format_list_bulleted</span>
                                                     <span className="text-xs text-slate-500">{ticket.items.length} itens</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isCreateOpen && (
                <div 
                    className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setIsCreateOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                             <h2 className="text-xl font-bold text-slate-900 dark:text-white">Abertura de Chamado</h2>
                             <p className="text-sm text-slate-500">Inicia na etapa: <span className="font-bold text-orange-600">Visita de Levantamento</span></p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cliente</label>
                                    <select 
                                        value={selectedClient} 
                                        onChange={e => setSelectedClient(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm"
                                    >
                                        <option value="">Selecione...</option>
                                        {projects.map(p => <option key={p.client.id} value={p.client.id}>{p.client.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prioridade</label>
                                    <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value as any)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm">
                                        <option>Normal</option>
                                        <option>Urgente</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Título do Chamado</label>
                                    <input type="text" value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder="Ex: Ajuste de Portas e Gavetas" />
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#101922] p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-700 dark:text-white mb-3 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                    Adicionar Item ao Chamado
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ambiente</label>
                                        <input type="text" value={tempEnv} onChange={e => setTempEnv(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Problema</label>
                                        <input type="text" value={tempProb} onChange={e => setTempProb(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Custo</label>
                                        <select value={tempCostType} onChange={e => setTempCostType(e.target.value as any)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm">
                                            <option>Custo Loja</option>
                                            <option>Custo Fábrica</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resolução</label>
                                        <select value={tempItemType} onChange={e => setTempItemType(e.target.value as any)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm">
                                            <option>Fabricação</option>
                                            <option>Compra</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fornecedor</label>
                                        <input type="text" value={tempSupplier} onChange={e => setTempSupplier(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prazo</label>
                                            <input type="date" value={tempDeadline} onChange={e => setTempDeadline(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                        </div>
                                        <button onClick={handleAddItemToDraft} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 rounded font-bold hover:bg-slate-300 self-end h-[38px]">Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="p-3">Ambiente</th>
                                            <th className="p-3">Problema</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Custo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newItems.map((item, i) => (
                                            <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                                                <td className="p-3 font-medium">{item.environmentName}</td>
                                                <td className="p-3 text-slate-500">{item.problemDescription}</td>
                                                <td className="p-3 text-slate-500 text-xs">{item.itemType}</td>
                                                <td className="p-3 text-slate-500 text-xs">{item.costType}</td>
                                            </tr>
                                        ))}
                                        {newItems.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400 italic">Nenhum item adicionado.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
                            <button onClick={() => setIsCreateOpen(false)} className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm">Cancelar</button>
                            <button onClick={handleCreateTicket} className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-bold text-sm hover:bg-orange-700">Abrir Chamado</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inspection / Detail Modal */}
            {isInspectionOpen && activeTicket && (
                <div 
                    className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => { setIsInspectionOpen(false); setActiveTicket(null); }}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                         Etapa: {ASSISTANCE_COLUMNS_DEF.find(c => c.id === activeTicket.status)?.title}
                                     </span>
                                     {activeTicket.priority === 'Urgente' && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[10px] font-bold uppercase">URGENTE</span>}
                                 </div>
                                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeTicket.clientName} - {activeTicket.title}</h2>
                             </div>
                             <button onClick={() => { setIsInspectionOpen(false); setActiveTicket(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                 <span className="material-symbols-outlined">close</span>
                             </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#101922]">
                            
                            {/* Items List */}
                            <div className="space-y-4">
                                {activeTicket.items.map((item, idx) => (
                                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{item.environmentName}</span>
                                                <div className="flex gap-2">
                                                    {item.costType && <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 text-slate-500">{item.costType}</span>}
                                                    {item.itemType && <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 text-slate-500">{item.itemType}</span>}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 font-medium mb-3">{item.problemDescription}</p>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                                                {item.supplier && <p>Fornecedor: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.supplier}</span></p>}
                                                {item.supplierDeadline && <p>Prazo Forn.: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.supplierDeadline}</span></p>}
                                                {item.partNeeded && <p>Peça: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.partNeeded}</span></p>}
                                                {item.measurements && <p>Medidas: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.measurements}</span></p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add New Item Form (Only visible in VISITA or by Admin) */}
                            {activeTicket.status === 'VISITA' && (
                                <div className="mt-8 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl">
                                    <h3 className="font-bold text-orange-800 dark:text-orange-400 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined">add_circle</span>
                                        Adicionar Item (Vistoria)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ambiente</label>
                                            <input type="text" value={inspectEnv} onChange={e => setInspectEnv(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Problema</label>
                                            <input type="text" value={inspectProb} onChange={e => setInspectProb(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Custo</label>
                                            <select value={inspectCostType} onChange={e => setInspectCostType(e.target.value as any)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm">
                                                <option>Custo Loja</option>
                                                <option>Custo Fábrica</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resolução</label>
                                            <select value={inspectItemType} onChange={e => setInspectItemType(e.target.value as any)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm">
                                                <option>Fabricação</option>
                                                <option>Compra</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fornecedor</label>
                                            <input type="text" value={inspectSupplier} onChange={e => setInspectSupplier(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prazo Forn.</label>
                                            <input type="date" value={inspectDeadline} onChange={e => setInspectDeadline(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peça (Opcional)</label>
                                            <input type="text" value={inspectPart} onChange={e => setInspectPart(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medidas / Obs</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={inspectMeasure} onChange={e => setInspectMeasure(e.target.value)} className="w-full rounded border-slate-200 dark:bg-slate-800 text-sm" placeholder="Ex: 500x300mm" />
                                                <button onClick={handleAddInspectionItem} className="bg-orange-600 text-white font-bold py-1 px-4 rounded text-sm hover:bg-orange-700">Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                            <p className="text-xs text-slate-500">
                                {activeTicket.items.length} itens registrados.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => { setIsInspectionOpen(false); setActiveTicket(null); }} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 font-bold text-sm">Fechar</button>
                                {activeTicket.status !== 'CONCLUIDO' && (
                                    <button 
                                        onClick={handleAdvanceTicket}
                                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20"
                                    >
                                        <span>Concluir Etapa</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicalAssistance;
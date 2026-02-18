import React, { useState } from 'react';
import { User, Home, Plus, Trash, Save, X } from 'lucide-react';
import { createFullProject } from '../services/api';

export function NewProjectWizard({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Estado Unificado
    const [formData, setFormData] = useState({
        client: { name: '', phone: '', email: '', cpf: '', origin: 'Instagram' },
        project: { property_type: 'Apartamento', budget_expectation: 0 },
        rooms: []
    });

    const [newRoom, setNewRoom] = useState({ name: 'Cozinha', area: 0, urgency: 'Normal', observations: '' });

    const handleAddRoom = () => {
        setFormData({ ...formData, rooms: [...formData.rooms, newRoom] });
        setNewRoom({ name: 'Cozinha', area: 0, urgency: 'Normal', observations: '' });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createFullProject(formData); // Envia tudo pro Python
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar projeto. Verifique o console ou a conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header Igual ao HTML */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Novo Projeto</h2>
                        <p className="text-slate-500 text-sm">Passo {step} de 2</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="text-slate-400" /></button>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

                    {/* PASSO 1: DADOS DO CLIENTE (Baseado no HTML Cadastro de Cliente) */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-blue-600">
                                    <User size={24} />
                                    <h3 className="text-lg font-bold text-slate-900">1. Dados Pessoais</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
                                        <input className="w-full rounded-lg border-slate-200 p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.client.name}
                                            onChange={e => setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp</label>
                                        <input className="w-full rounded-lg border-slate-200 p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.client.phone}
                                            onChange={e => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Origem</label>
                                        <select className="w-full rounded-lg border-slate-200 p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            onChange={e => setFormData({ ...formData, client: { ...formData.client, origin: e.target.value } })}>
                                            <option>Instagram</option>
                                            <option>Indicação</option>
                                            <option>Porta de Loja</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* PASSO 2: AMBIENTES (Baseado no HTML Detalhes dos Ambientes) */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                {/* Form de Adicionar */}
                                <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                                    <h3 className="font-bold text-slate-900 mb-4">Adicionar Ambiente</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <select className="border p-2 rounded bg-slate-50" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}>
                                            <option>Cozinha</option>
                                            <option>Dormitório</option>
                                            <option>Banheiro</option>
                                            <option>Sala</option>
                                        </select>
                                        <input type="number" placeholder="m²" className="border p-2 rounded bg-slate-50" value={newRoom.area} onChange={e => setNewRoom({ ...newRoom, area: Number(e.target.value) })} />
                                        <select className="border p-2 rounded bg-slate-50" value={newRoom.urgency} onChange={e => setNewRoom({ ...newRoom, urgency: e.target.value })}>
                                            <option>Normal</option>
                                            <option>Alta</option>
                                        </select>
                                    </div>
                                    <textarea placeholder="Observações..." className="w-full border p-2 rounded mb-4 bg-slate-50 h-24" value={newRoom.observations} onChange={e => setNewRoom({ ...newRoom, observations: e.target.value })} />
                                    <button onClick={handleAddRoom} className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors flex justify-center gap-2">
                                        <Plus size={20} /> Adicionar à Lista
                                    </button>
                                </div>

                                {/* Lista Visual (Cards do HTML) */}
                                <div className="flex-1 space-y-3">
                                    {formData.rooms.map((room, idx) => (
                                        <article key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-start animate-fade-in-up">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Home size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{room.name}</h4>
                                                    <p className="text-xs text-slate-500">{room.area}m² • {room.urgency}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => {
                                                const newRooms = formData.rooms.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, rooms: newRooms });
                                            }} className="text-slate-400 hover:text-red-500"><Trash size={18} /></button>
                                        </article>
                                    ))}
                                    {formData.rooms.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-xl">
                                            Nenhum ambiente adicionado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-2xl flex justify-between">
                    {step === 2 ? (
                        <button onClick={() => setStep(1)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-lg">Voltar</button>
                    ) : <div></div>}

                    {step === 1 ? (
                        <button onClick={() => setStep(2)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                            Próximo: Ambientes
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                            <Save size={20} /> {loading ? 'Salvando...' : 'Finalizar Projeto'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

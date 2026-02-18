import React, { useState } from 'react';
import { User, Home, Plus, Trash, Save, X, Building, Calendar, Wallet } from 'lucide-react';
import { createFullProject } from '../services/api';

export function NewProjectWizard({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado Unificado
    const [formData, setFormData] = useState({
        client: { name: '', phone: '', email: '', origin: 'Instagram' },
        project: {
            property_type: 'Apartamento',
            property_status: 'Pronto/Entregue', // Novo
            purchase_moment: 'Imediata',        // Novo
            budget_expectation: 0
        },
        rooms: []
    });

    const [newRoom, setNewRoom] = useState({ name: 'Cozinha', area: 0, urgency: 'Normal', observations: '' });

    const handleAddRoom = () => {
        setFormData({ ...formData, rooms: [...formData.rooms, newRoom] });
        setNewRoom({ name: 'Cozinha', area: 0, urgency: 'Normal', observations: '' });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Enviando payload:", formData); // Debug
            await createFullProject(formData);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (e) {
            console.error(e);
            setError("Erro ao salvar! Verifique se o Backend está rodando.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Novo Projeto</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                            <span className="text-xs text-slate-500 ml-2">Passo {step} de 2</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400" size={20} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                            <span className="font-bold">Erro:</span> {error}
                        </div>
                    )}

                    {/* PASSO 1: DADOS CLIENTE + IMÓVEL */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Seção Cliente */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <User size={20} />
                                    <h3 className="font-bold text-slate-800">Dados do Cliente</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label>
                                        <input className="w-full rounded-lg border-slate-200 p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={formData.client.name}
                                            onChange={e => setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })}
                                            placeholder="Ex: Ana Silva"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">WhatsApp</label>
                                        <input className="w-full rounded-lg border-slate-200 p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={formData.client.phone}
                                            onChange={e => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Seção Imóvel (NOVA) */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-orange-500">
                                    <Building size={20} />
                                    <h3 className="font-bold text-slate-800">Sobre o Imóvel</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Tipo de Imóvel */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">Tipo</label>
                                        <div className="flex gap-2">
                                            {['Apartamento', 'Casa', 'Comercial'].map(type => (
                                                <button key={type}
                                                    onClick={() => setFormData({ ...formData, project: { ...formData.project, property_type: type } })}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${formData.project.property_type === type ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status da Obra */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">Status</label>
                                        <select
                                            className="w-full rounded-lg border-slate-200 p-2 text-sm bg-white"
                                            value={formData.project.property_status}
                                            onChange={e => setFormData({ ...formData, project: { ...formData.project, property_status: e.target.value } })}
                                        >
                                            <option value="Pronto/Entregue">Pronto / Entregue</option>
                                            <option value="Na Planta/Obra">Na Planta / Em Obras</option>
                                            <option value="Reforma">Em Reforma</option>
                                        </select>
                                    </div>

                                    {/* Momento de Compra */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">Previsão de Compra</label>
                                        <select
                                            className="w-full rounded-lg border-slate-200 p-2 text-sm bg-white"
                                            value={formData.project.purchase_moment}
                                            onChange={e => setFormData({ ...formData, project: { ...formData.project, purchase_moment: e.target.value } })}
                                        >
                                            <option value="Imediata">Imediata (Agora)</option>
                                            <option value="30 Dias">Próximos 30 dias</option>
                                            <option value="Futura">Futura (+3 meses)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* PASSO 2: AMBIENTES */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Form de Adicionar */}
                                <div className="w-full md:w-1/3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
                                    <h3 className="font-bold text-slate-800 mb-4 text-sm">Adicionar Ambiente</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">Nome</label>
                                            <select className="w-full border-slate-200 p-2 rounded-lg text-sm bg-slate-50" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}>
                                                <option>Cozinha</option>
                                                <option>Dormitório Casal</option>
                                                <option>Dormitório Solteiro</option>
                                                <option>Banheiro</option>
                                                <option>Sala de Estar</option>
                                                <option>Área Gourmet</option>
                                                <option>Lavanderia</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Área (m²)</label>
                                                <input type="number" className="w-full border-slate-200 p-2 rounded-lg text-sm bg-slate-50" value={newRoom.area} onChange={e => setNewRoom({ ...newRoom, area: Number(e.target.value) })} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Prioridade</label>
                                                <select className="w-full border-slate-200 p-2 rounded-lg text-sm bg-slate-50" value={newRoom.urgency} onChange={e => setNewRoom({ ...newRoom, urgency: e.target.value })}>
                                                    <option>Normal</option>
                                                    <option>Alta</option>
                                                    <option>Baixa</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">Obs.</label>
                                            <textarea className="w-full border-slate-200 p-2 rounded-lg text-sm bg-slate-50 h-20 resize-none" value={newRoom.observations} onChange={e => setNewRoom({ ...newRoom, observations: e.target.value })} />
                                        </div>

                                        <button onClick={handleAddRoom} className="w-full py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors flex justify-center gap-2 text-sm mt-2">
                                            <Plus size={16} /> Adicionar
                                        </button>
                                    </div>
                                </div>

                                {/* Lista Visual */}
                                <div className="flex-1 space-y-3">
                                    <h3 className="font-bold text-slate-800 text-sm mb-2">Ambientes do Projeto ({formData.rooms.length})</h3>

                                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                        {formData.rooms.map((room, idx) => (
                                            <article key={idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex justify-between items-center group hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-primary ${room.urgency === 'Alta' ? 'bg-red-50 text-red-600' : 'bg-blue-50'}`}>
                                                        <Home size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{room.name}</h4>
                                                        <p className="text-xs text-slate-500">{room.area}m² • <span className={room.urgency === 'Alta' ? 'text-red-500 font-bold' : ''}>{room.urgency}</span></p>
                                                    </div>
                                                </div>
                                                <button onClick={() => {
                                                    const newRooms = formData.rooms.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, rooms: newRooms });
                                                }} className="p-2 text-slate-300 hover:text-red-500 rounded-full hover:bg-slate-50"><Trash size={16} /></button>
                                            </article>
                                        ))}
                                    </div>

                                    {formData.rooms.length === 0 && (
                                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                            <Home size={32} className="opacity-20 mb-2" />
                                            <p className="text-sm font-medium">Nenhum ambiente adicionado</p>
                                            <p className="text-xs">Use o formulário ao lado</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-white rounded-b-2xl flex justify-between items-center">
                    {step === 2 ? (
                        <button onClick={() => setStep(1)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">Voltar</button>
                    ) : <div></div>}

                    {step === 1 ? (
                        <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 shadow-lg shadow-primary/25 text-sm transition-all transform active:scale-95">
                            Continuar para Ambientes
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading || formData.rooms.length === 0} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all transform active:scale-95">
                            <Save size={18} /> {loading ? 'Finalizando...' : 'Criar Projeto'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

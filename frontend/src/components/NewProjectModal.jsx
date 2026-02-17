import React, { useState } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

const NewProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        total_value: '',
        origin: '',
        architect_contact: '',
        pain_points: '',
        budget_expectation: '',
        move_in_date: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                client: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    itpp_data: {
                        origin: formData.origin,
                        architect_contact: formData.architect_contact,
                        pain_points: formData.pain_points,
                        budget_expectation: formData.budget_expectation,
                        move_in_date: formData.move_in_date
                    }
                },
                project: {
                    total_value: parseFloat(formData.total_value) || 0,
                    status: "Em Andamento"
                }
            };

            await api.post('/projects/', payload);
            onProjectCreated();
            onClose();
        } catch (error) {
            console.error("Erro ao criar projeto:", error);
            alert("Erro ao criar projeto. Verifique o console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Novo Projeto</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
                            <input name="name" required className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Telefone</label>
                            <input name="phone" required className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Endereço</label>
                            <input name="address" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Valor Total (R$)</label>
                            <input name="total_value" type="number" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-4" />
                    <h3 className="font-semibold text-gray-700">Dados ITPP</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Origem</label>
                            <input name="origin" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contato Arquiteto</label>
                            <input name="architect_contact" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Dores do Cliente</label>
                            <textarea name="pain_points" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expectativa de Orçamento</label>
                            <input name="budget_expectation" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Data de Mudança</label>
                            <input name="move_in_date" type="date" className="w-full border p-2 rounded" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {loading ? 'Salvando...' : 'Criar Projeto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectModal;

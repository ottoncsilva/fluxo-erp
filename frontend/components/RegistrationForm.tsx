import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';

interface RegistrationFormProps {
    onComplete: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete }) => {
    const { addProject } = useProjects();
    const [step, setStep] = useState(1);
    const [client, setClient] = useState({ name: '', phone: '', email: '', origin: 'Instagram', budget_expectation: 0, move_in_date: '' });
    const [rooms, setRooms] = useState<{ name: string, area_sqm: number, urgency_level: 'Média' }[]>([]);

    // Temp room state
    const [roomName, setRoomName] = useState('');
    const [roomArea, setRoomArea] = useState(0);

    const handleAddRoom = () => {
        if (roomName) {
            setRooms([...rooms, { name: roomName, area_sqm: roomArea, urgency_level: 'Média' }]);
            setRoomName('');
            setRoomArea(0);
        }
    };

    const handleSubmit = async () => {
        await addProject(client as any, rooms as any);
        onComplete();
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Novo Cadastro</h2>

            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {step === 1 ? (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-4">Dados do Cliente</h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                            <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                                <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={client.phone} onChange={e => setClient({ ...client, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expectativa de Investimento</label>
                                <input type="number" className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={client.budget_expectation} onChange={e => setClient({ ...client, budget_expectation: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Mudança</label>
                                <input type="date" className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={client.move_in_date} onChange={e => setClient({ ...client, move_in_date: e.target.value })} />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-4">Próximo: Ambientes</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-4">Ambientes do Projeto</h3>

                        <div className="flex gap-2">
                            <input className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Nome do Ambiente (ex: Cozinha)" value={roomName} onChange={e => setRoomName(e.target.value)} />
                            <input type="number" className="w-24 p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="m²" value={roomArea || ''} onChange={e => setRoomArea(parseFloat(e.target.value))} />
                            <button onClick={handleAddRoom} className="bg-emerald-500 text-white px-4 rounded-lg">+</button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg min-h-[100px]">
                            {rooms.map((r, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b dark:border-slate-700 last:border-0">
                                    <span>{r.name}</span>
                                    <span className="text-slate-500 text-sm">{r.area_sqm} m²</span>
                                </div>
                            ))}
                            {rooms.length === 0 && <p className="text-center text-slate-400 text-sm italic py-4">Nenhum ambiente adicionado</p>}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(1)} className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-3 rounded-lg font-bold">Voltar</button>
                            <button onClick={handleSubmit} className="flex-1 bg-primary text-white py-3 rounded-lg font-bold">Finalizar Cadastro</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;

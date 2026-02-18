import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || 'Erro desconhecido. Verifique o console.';
            setError(`Login falhou: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#101922]">
            <div className="bg-white dark:bg-[#1a2632] p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col items-center mb-8">
                    <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-primary/20">
                        F
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">FluxoPlanejados</h1>
                    <p className="text-slate-500 text-sm">Entre para acessar o sistema ERP</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Senha</label>
                        <input
                            type="password"
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-600 hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Entrando...' : 'Acessar Sistema'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Acesso restrito a colaboradores autorizados.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

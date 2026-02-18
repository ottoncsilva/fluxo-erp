import React from 'react';

const MobileInspection: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4">smartphone</span>
            <h2 className="text-xl font-bold">Vistoria Mobile</h2>
            <p className="max-w-xs text-center mt-2">Acesse pelo celular para realizar vistorias e medições in loco.</p>
        </div>
    );
};

export default MobileInspection;

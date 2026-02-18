import React from 'react';
import { Calendar, User, AlertTriangle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function ProjectCard({ clientName, stage, owner, daysLeft, urgency, area }) {
  // Lógica Visual de Prazo
  const isLate = daysLeft < 0;
  const slaColor = isLate
    ? "bg-red-50 text-red-700 border-red-200"
    : daysLeft <= 2
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer mb-3 relative overflow-hidden">
      {/* Indicador de Urgência Lateral */}
      <div className={clsx(
        "absolute left-0 top-0 bottom-0 w-1",
        urgency === 'Alta' ? 'bg-red-500' : urgency === 'Média' ? 'bg-yellow-500' : 'bg-blue-300'
      )} />

      <div className="pl-2">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-800 text-sm leading-tight">{clientName}</h3>
          {area && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{area}m²</span>}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {stage}
          </span>
        </div>

        <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-2">
          {/* Avatar e Dono */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <User size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Responsável</span>
              <span className="text-xs font-medium text-slate-700">{owner}</span>
            </div>
          </div>

          {/* Badge de SLA */}
          <div className={twMerge("flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold border", slaColor)}>
            {isLate ? <AlertTriangle size={12} /> : <Clock size={12} />}
            {isLate ? `${Math.abs(daysLeft)} dias atrasado` : `${daysLeft} dias restam`}
          </div>
        </div>
      </div>
    </div>
  );
}

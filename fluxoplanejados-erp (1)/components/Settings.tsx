import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Role, User, PermissionConfig, AssistanceStatus } from '../types';

const Settings: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, permissions, updatePermissions, workflowConfig, updateWorkflowSla, origins, updateOrigins, companySettings, updateCompanySettings, assistanceWorkflow, updateAssistanceSla } = useProjects();
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'USERS' | 'PERMISSIONS' | 'SLA' | 'SLA_ASSISTANCE' | 'ORIGINS'>('COMPANY');
  
  // User Management Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPass, setUPass] = useState('');
  const [uRole, setURole] = useState<Role>('Vendedor');
  const [uAvatar, setUAvatar] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uCpf, setUCpf] = useState('');
  const [uRg, setURg] = useState('');
  const [uAddress, setUAddress] = useState('');
  const [uContract, setUContract] = useState<'CLT'|'PJ'>('CLT');
  const [uIsSystemUser, setUIsSystemUser] = useState(true);
  
  // Origin State
  const [newOrigin, setNewOrigin] = useState('');

  // Company State
  const [companyName, setCompanyName] = useState(companySettings.name);
  const [companyCnpj, setCompanyCnpj] = useState(companySettings.cnpj);
  const [companyAddress, setCompanyAddress] = useState(companySettings.address);
  const [companyPhone, setCompanyPhone] = useState(companySettings.phone);
  const [companyLogo, setCompanyLogo] = useState(companySettings.logoUrl || '');
  const [companySocial, setCompanySocial] = useState(companySettings.socialMedia || '');

  const openUserModal = (user?: User) => {
      if(user) {
          setEditingUser(user);
          setUName(user.name);
          setUEmail(user.email || '');
          setUPass(user.password || '');
          setURole(user.role);
          setUAvatar(user.avatar || '');
          setUPhone(user.phone || '');
          setUCpf(user.cpf || '');
          setURg(user.rg || '');
          setUAddress(user.address || '');
          setUContract(user.contractType || 'CLT');
          setUIsSystemUser(user.isSystemUser);
      } else {
          setEditingUser(null);
          setUName('');
          setUEmail('');
          setUPass('');
          setURole('Vendedor');
          setUAvatar('');
          setUPhone('');
          setUCpf('');
          setURg('');
          setUAddress('');
          setUContract('CLT');
          setUIsSystemUser(true);
      }
      setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
      if(!uName) {
          alert("Nome é obrigatório");
          return;
      }
      if(uIsSystemUser && (!uEmail || (!editingUser && !uPass))) {
          alert("Para usuários do sistema, Email e Senha são obrigatórios.");
          return;
      }

      const userData: User = {
          id: editingUser ? editingUser.id : `u-${Date.now()}`,
          name: uName,
          email: uEmail,
          password: uPass,
          role: uRole,
          avatar: uAvatar || `https://i.pravatar.cc/150?u=${uName}`,
          phone: uPhone,
          cpf: uCpf,
          rg: uRg,
          address: uAddress,
          contractType: uContract,
          isSystemUser: uIsSystemUser
      };

      if(editingUser) {
          updateUser(userData);
      } else {
          addUser(userData);
      }
      setIsUserModalOpen(false);
  };
  
  const handleSaveCompany = () => {
      updateCompanySettings({
          ...companySettings,
          name: companyName,
          cnpj: companyCnpj,
          address: companyAddress,
          phone: companyPhone,
          logoUrl: companyLogo,
          socialMedia: companySocial
      });
      alert("Dados da empresa salvos com sucesso!");
  };

  const handleAddOrigin = () => {
      if(!newOrigin || origins.includes(newOrigin)) return;
      updateOrigins([...origins, newOrigin]);
      setNewOrigin('');
  };
  
  const handleRemoveOrigin = (orig: string) => {
      updateOrigins(origins.filter(o => o !== orig));
  }

  const handlePermissionChange = (role: Role, field: keyof PermissionConfig, value: boolean) => {
      const updated = permissions.map(p => {
          if (p.role === role) {
              return { ...p, [field]: value };
          }
          return p;
      });
      updatePermissions(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#101922] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full p-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Configurações do Sistema</h2>
        
        {/* Tab Header */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
             <button 
                onClick={() => setActiveTab('COMPANY')}
                className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'COMPANY' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
                Dados da Empresa
            </button>
            <button 
                onClick={() => setActiveTab('USERS')}
                className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'USERS' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
                Gestão de Usuários
            </button>
            <button 
                onClick={() => setActiveTab('PERMISSIONS')}
                className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'PERMISSIONS' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
                Cargos e Permissões
            </button>
            <button 
                onClick={() => setActiveTab('SLA')}
                className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'SLA' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
                SLA (Produção)
            </button>
            <button 
                onClick={() => setActiveTab('SLA_ASSISTANCE')}
                className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'SLA_ASSISTANCE' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
                SLA (Assistência)
            </button>
            <button 
                onClick={() => setActiveTab('ORIGINS')}
                className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ORIGINS' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
                Origem do Cliente
            </button>
        </div>

        {/* COMPANY TAB */}
        {activeTab === 'COMPANY' && (
            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in space-y-6">
                <div className="flex gap-6 items-start">
                    <div className="w-32 h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden relative">
                         {companyLogo ? <img src={companyLogo} className="w-full h-full object-cover" /> : <span className="text-slate-400 font-bold text-4xl">{companyName.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL da Logo</label>
                             <input type="text" value={companyLogo} onChange={e => setCompanyLogo(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder="https://..." />
                             <p className="text-xs text-slate-400 mt-1">Cole o link direto da imagem.</p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Fantasia</label>
                         <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CNPJ</label>
                         <input type="text" value={companyCnpj} onChange={e => setCompanyCnpj(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                     </div>
                     <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço Completo</label>
                         <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Telefone Comercial</label>
                         <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Redes Sociais</label>
                         <input type="text" value={companySocial} onChange={e => setCompanySocial(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder="@instagram, facebook..." />
                     </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={handleSaveCompany} className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-primary-600">Salvar Alterações</button>
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'USERS' && (
            <div className="space-y-8 animate-fade-in">
                {/* Header Action */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Colaboradores</h3>
                    <button 
                        onClick={() => openUserModal()}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-600 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Novo Colaborador
                    </button>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Função</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acesso Sistema</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map(u => (
                                <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="size-8 rounded-full overflow-hidden bg-slate-200">
                                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white leading-none">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email || u.phone || 'Sem contato'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {u.role} <span className="text-xs text-slate-400">({u.contractType})</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.isSystemUser ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Sim</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded">Não</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => openUserModal(u)} className="p-1 text-slate-400 hover:text-primary transition-colors" title="Editar">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => { if(window.confirm('Excluir usuário?')) deleteUser(u.id); }} className="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Excluir">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Other Tabs (Permissions, SLA, Origins) */}
        
        {activeTab === 'PERMISSIONS' && (
            <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Cargo</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Dashboard</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Kanban</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Clientes</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Avançar Etapa</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Configurações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {permissions.map(p => (
                            <tr key={p.role} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{p.role}</td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={p.canViewDashboard} onChange={e => handlePermissionChange(p.role, 'canViewDashboard', e.target.checked)} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={p.canViewKanban} onChange={e => handlePermissionChange(p.role, 'canViewKanban', e.target.checked)} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={p.canViewClients} onChange={e => handlePermissionChange(p.role, 'canViewClients', e.target.checked)} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={p.canAdvanceStep} onChange={e => handlePermissionChange(p.role, 'canAdvanceStep', e.target.checked)} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={p.canViewSettings} onChange={e => handlePermissionChange(p.role, 'canViewSettings', e.target.checked)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'SLA' && (
             <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Etapa</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Responsável</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">SLA (Dias Úteis)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {Object.values(workflowConfig).sort((a,b) => a.id.localeCompare(b.id, undefined, {numeric: true})).map(step => (
                            <tr key={step.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-3 text-sm font-mono text-slate-400">{step.id}</td>
                                <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{step.label}</td>
                                <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">{step.ownerRole}</td>
                                <td className="px-6 py-3">
                                    <input 
                                        type="number" 
                                        value={step.sla} 
                                        onChange={(e) => updateWorkflowSla(step.id, Number(e.target.value))}
                                        className="w-20 rounded border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-sm py-1"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'SLA_ASSISTANCE' && (
             <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Código</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Etapa do Fluxo</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">SLA (Dias Úteis)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {assistanceWorkflow.map(step => (
                            <tr key={step.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-3 text-sm font-mono text-slate-400">{step.id}</td>
                                <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{step.label}</td>
                                <td className="px-6 py-3">
                                    <input 
                                        type="number" 
                                        value={step.sla} 
                                        onChange={(e) => updateAssistanceSla(step.id as AssistanceStatus, Number(e.target.value))}
                                        className="w-20 rounded border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-sm py-1"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        
        {activeTab === 'ORIGINS' && (
            <div className="space-y-6 animate-fade-in">
                 <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Adicionar Nova Origem</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição</label>
                            <input type="text" value={newOrigin} onChange={e => setNewOrigin(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder="Ex: Feira de Imóveis 2024" />
                        </div>
                        <button onClick={handleAddOrigin} className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-primary-600">Adicionar</button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Origens Cadastradas</h3>
                    <div className="flex flex-wrap gap-3">
                        {origins.map(orig => (
                            <div key={orig} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                {orig}
                                <button onClick={() => handleRemoveOrigin(orig)} className="text-slate-400 hover:text-rose-500">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* User Edit Modal */}
      {isUserModalOpen && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setIsUserModalOpen(false)}
          >
              <div 
                className="bg-white dark:bg-[#1a2632] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a2632] shrink-0">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
                      <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Dados Pessoais</h3>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Completo</label>
                              <input type="text" value={uName} onChange={e => setUName(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CPF</label>
                              <input type="text" value={uCpf} onChange={e => setUCpf(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder="000.000.000-00" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">RG</label>
                              <input type="text" value={uRg} onChange={e => setURg(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Telefone / WhatsApp</label>
                              <input type="text" value={uPhone} onChange={e => setUPhone(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                          </div>
                          <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço Completo</label>
                              <input type="text" value={uAddress} onChange={e => setUAddress(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                          </div>

                          <div className="md:col-span-2 mt-4">
                              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Dados Corporativos</h3>
                          </div>
                          
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cargo / Função</label>
                              <select value={uRole} onChange={e => setURole(e.target.value as Role)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm">
                                  <option>Vendedor</option>
                                  <option>Projetista</option>
                                  <option>Medidor</option>
                                  <option>Liberador</option>
                                  <option>Financeiro</option>
                                  <option>Industria</option>
                                  <option>Coordenador de Montagem</option>
                                  <option>Montador</option>
                                  <option>Logistica</option>
                                  <option>Gerente</option>
                                  <option>Proprietario</option>
                                  <option>Admin</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Contrato</label>
                              <select value={uContract} onChange={e => setUContract(e.target.value as any)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm">
                                  <option>CLT</option>
                                  <option>PJ</option>
                              </select>
                          </div>
                          <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Foto (URL)</label>
                               <input type="text" value={uAvatar} onChange={e => setUAvatar(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder="https://..." />
                          </div>

                          <div className="md:col-span-2 mt-4">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Acesso ao Sistema</h3>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={uIsSystemUser} onChange={e => setUIsSystemUser(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Este funcionário utiliza o ERP?</span>
                                  </label>
                              </div>
                          </div>

                          {uIsSystemUser && (
                              <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email de Login</label>
                                    <input type="email" value={uEmail} onChange={e => setUEmail(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Senha</label>
                                    <input type="password" value={uPass} onChange={e => setUPass(e.target.value)} className="w-full rounded-lg border-slate-200 dark:bg-slate-800 text-sm" placeholder={editingUser ? "Deixe em branco para manter" : "Senha inicial"} />
                                </div>
                              </>
                          )}
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                      <button onClick={() => setIsUserModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 font-bold text-sm hover:bg-slate-100">Cancelar</button>
                      <button onClick={handleSaveUser} className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-600 shadow-lg shadow-primary/20">Salvar Colaborador</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Settings;
import React, { useState, useEffect } from 'react';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavLink: React.FC<{
  label: string;
  view: View;
  activeView: View;
  setActiveView: (view: View) => void;
  icon: React.ReactNode;
}> = ({ label, view, activeView, setActiveView, icon }) => (
  <button
    onClick={() => setActiveView(view)}
    className={`w-full text-left flex items-center px-4 py-2 text-sm rounded-md transition-colors duration-150 ${
      activeView === view
        ? 'bg-brand-secondary text-white font-semibold shadow-sm'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
    }`}
  >
    <span className="mr-3 w-5">{icon}</span>
    {label}
  </button>
);

const SubMenu: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  activePaths: View[];
  activeView: View;
}> = ({ label, icon, children, activePaths, activeView }) => {
    const [isOpen, setIsOpen] = useState(activePaths.includes(activeView));

    useEffect(() => {
        if (activePaths.includes(activeView)) {
            setIsOpen(true);
        }
    }, [activeView, activePaths]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-md"
            >
                <div className="flex items-center">
                    <span className="mr-3 w-5">{icon}</span>
                    {label}
                </div>
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="pl-8 pt-1 space-y-1">{children}</div>}
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-brand-primary">Syndic 46FSM</h1>
      </div>
      <nav className="p-4 space-y-2">
        <NavLink label="Tableau de bord" view="dashboard" activeView={activeView} setActiveView={setActiveView} icon={<span>📊</span>} />
        
        <SubMenu label="Copropriété" icon={<span>🏢</span>} activeView={activeView} activePaths={['co-owners-list', 'co-owner-detail', 'lots', 'comptes', 'ventes']}>
            <NavLink label="Copropriétaires" view="co-owners-list" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Lots" view="lots" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Compteurs" view="comptes" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Ventes" view="ventes" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
        </SubMenu>

        <SubMenu label="Finances" icon={<span>💰</span>} activeView={activeView} activePaths={['finances', 'finance-detail', 'finance-factures', 'finance-facture-detail', 'finance-appels', 'finance-appel-detail', 'finance-budget']}>
            <NavLink label="Mouvements" view="finances" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Factures" view="finance-factures" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Appels de fonds" view="finance-appels" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Budget & Dépenses" view="finance-budget" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
        </SubMenu>

        <NavLink label="Fournisseurs" view="suppliers" activeView={activeView} setActiveView={setActiveView} icon={<span>🚚</span>} />

        <SubMenu label="Assemblées" icon={<span>🗳️</span>} activeView={activeView} activePaths={['assemblees', 'cloture']}>
            <NavLink label="Assemblées" view="assemblees" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
            <NavLink label="Clôture exercice" view="cloture" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
        </SubMenu>

        <NavLink label="Incidents" view="incidents" activeView={activeView} setActiveView={setActiveView} icon={<span>⚠️</span>} />
        <NavLink label="Documents" view="documents" activeView={activeView} setActiveView={setActiveView} icon={<span>📁</span>} />
        <NavLink label="Communication" view="communication" activeView={activeView} setActiveView={setActiveView} icon={<span>📣</span>} />
        
        <SubMenu label="Impressions" icon={<span>🖨️</span>} activeView={activeView} activePaths={['print-co-owners', 'print-lots', 'print-milliemes', 'print-co-owner-account', 'print-fund-calls', 'print-individual-fund-call']}>
             <NavLink label="Liste Copropriétaires" view="print-co-owners" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
             <NavLink label="Liste des lots" view="print-lots" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
             <NavLink label="Répartition millièmes" view="print-milliemes" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
             <NavLink label="Compte copropriétaire" view="print-co-owner-account" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
             <NavLink label="Appels de fonds" view="print-fund-calls" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
             <NavLink label="Appels de fonds (Individuel)" view="print-individual-fund-call" activeView={activeView} setActiveView={setActiveView} icon={<span></span>} />
        </SubMenu>

        <div className="pt-4">
          <NavLink label="Paramètres" view="settings" activeView={activeView} setActiveView={setActiveView} icon={<span>⚙️</span>} />
        </div>
      </nav>
    </aside>
  );
};
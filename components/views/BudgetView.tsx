import React, { useState, useMemo } from 'react';
import type { Building, Transaction, ChargeAccount, CurrentBudget, WorksBudget, BudgetLine, MillesimeLabel, Supplier } from '../../types';

// Reusable Modal Component
const Modal: React.FC<{ children: React.ReactNode, title: string, onClose: () => void }> = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    </div>
);


const CreateCurrentBudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addCurrentBudget: (budget: Omit<CurrentBudget, 'id'>) => void;
    chargeAccounts: ChargeAccount[];
    buildingId: string;
}> = ({ isOpen, onClose, addCurrentBudget, chargeAccounts, buildingId }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [lines, setLines] = useState<BudgetLine[]>(chargeAccounts.map(ca => ({ chargeAccountId: ca.id, budgetedAmount: 0 })));

    const handleAmountChange = (chargeAccountId: string, amount: string) => {
        const numAmount = parseFloat(amount) || 0;
        setLines(prev => prev.map(line => line.chargeAccountId === chargeAccountId ? { ...line, budgetedAmount: numAmount } : line));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addCurrentBudget({ year, buildingId, lines });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal title={`Créer un budget courant pour ${year}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Année</label>
                    <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="max-h-96 overflow-y-auto pr-2">
                {lines.map(line => {
                    const account = chargeAccounts.find(ca => ca.id === line.chargeAccountId);
                    return (
                        <div key={line.chargeAccountId} className="grid grid-cols-2 gap-4 items-center mb-2">
                             <label className="text-sm font-medium text-gray-700">{account?.name}</label>
                             <input 
                                type="number" 
                                step="0.01" 
                                value={line.budgetedAmount}
                                onChange={e => handleAmountChange(line.chargeAccountId, e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Montant budgetisé"
                             />
                        </div>
                    );
                })}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                     <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md">Annuler</button>
                     <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md">Sauvegarder</button>
                </div>
            </form>
        </Modal>
    );
};

const CreateWorksBudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addWorksBudget: (budget: Omit<WorksBudget, 'id'>) => void;
    millesimeLabels: MillesimeLabel[];
    buildingId: string;
}> = ({ isOpen, onClose, addWorksBudget, millesimeLabels, buildingId }) => {
    
    const [title, setTitle] = useState('');
    const [chargeKey, setChargeKey] = useState('');
    const [totalBudget, setTotalBudget] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numBudget = parseFloat(totalBudget);
        if(!title || !chargeKey || isNaN(numBudget) || buildingId === 'all') return;
        
        addWorksBudget({
            title,
            buildingId,
            chargeKey,
            totalBudget: numBudget,
            amountCalled: 0,
            status: 'Not Started'
        });
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <Modal title="Créer un budget travaux" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label>Intitulé des travaux</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" required/></div>
                <div><label>Clé de charge</label>
                    <select value={chargeKey} onChange={e => setChargeKey(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" required>
                        <option value="">Sélectionner...</option>
                        {millesimeLabels.map(ml => <option key={ml.key} value={ml.key}>{ml.label}</option>)}
                    </select>
                </div>
                <div><label>Budget Total (€)</label><input type="number" step="0.01" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" required/></div>
                <div className="flex justify-end space-x-2 pt-2">
                     <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md">Annuler</button>
                     <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md">Créer</button>
                </div>
            </form>
        </Modal>
    );
};


interface BudgetViewProps {
    building: Building | { id: string, name: string };
    isGlobalView: boolean;
    transactions: Transaction[];
    chargeAccounts: ChargeAccount[];
    millesimeLabels: MillesimeLabel[];
    currentBudgets: CurrentBudget[];
    addCurrentBudget: (b: Omit<CurrentBudget, 'id'>) => void;
    updateCurrentBudget: (b: CurrentBudget) => void;
    worksBudgets: WorksBudget[];
    addWorksBudget: (b: Omit<WorksBudget, 'id'>) => void;
    updateWorksBudget: (b: WorksBudget) => void;
    suppliers: Supplier[];
}

export const BudgetView: React.FC<BudgetViewProps> = (props) => {
    const { building, isGlobalView, transactions, chargeAccounts, currentBudgets, addCurrentBudget, worksBudgets, addWorksBudget, millesimeLabels, suppliers } = props;
    const [activeTab, setActiveTab] = useState<'current' | 'works'>('current');
    const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'detail'>('expenses');
    
    const [isCurrentBudgetModalOpen, setIsCurrentBudgetModalOpen] = useState(false);
    const [isWorksBudgetModalOpen, setIsWorksBudgetModalOpen] = useState(false);

    const expenses = useMemo(() => transactions.filter(t => t.amount < 0), [transactions]);
    // FIX: Handle null or undefined supplierId.
    const getSupplierName = (id: string | null | undefined) => {
        if (!id) return 'N/A';
        return suppliers.find(s => s.id === id)?.name || 'N/A';
    };
    
    const budgetDetails = useMemo(() => {
        const budget = currentBudgets.find(b => b.year === new Date().getFullYear()); // Simple find for current year
        if (!budget) return [];
        return budget.lines.map(line => {
            const spent = expenses
                .filter(e => e.chargeAccountId === line.chargeAccountId)
                .reduce((sum, e) => sum + Math.abs(e.amount), 0);
            const variation = line.budgetedAmount > 0 ? ((spent - line.budgetedAmount) / line.budgetedAmount) * 100 : 0;
            return {
                ...line,
                accountName: chargeAccounts.find(ca => ca.id === line.chargeAccountId)?.name || 'Inconnu',
                spent,
                variation
            };
        });
    }, [currentBudgets, expenses, chargeAccounts]);


    const renderCurrentBudget = () => (
        <>
            <div className="border-b mb-4">
                <nav className="-mb-px flex space-x-4">
                    <button onClick={() => setActiveSubTab('expenses')} className={`py-2 px-1 ${activeSubTab === 'expenses' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Dépenses</button>
                    <button onClick={() => setActiveSubTab('detail')} className={`py-2 px-1 ${activeSubTab === 'detail' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Détail du budget</button>
                </nav>
            </div>
            {activeSubTab === 'expenses' && (
                <table className="w-full text-sm text-left">
                    {/* Expenses table */}
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Fournisseur</th><th className="px-6 py-3">Libellé</th><th className="px-6 py-3">Compte de charge</th><th className="px-6 py-3 text-right">Montant</th></tr></thead>
                    <tbody>
                        {expenses.map(e => (
                             <tr key={e.id} className="bg-white border-b">
                                <td className="px-6 py-4">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-4">{getSupplierName(e.supplierId)}</td>
                                <td className="px-6 py-4">{e.description}</td>
                                <td className="px-6 py-4">{chargeAccounts.find(ca => ca.id === e.chargeAccountId)?.name || '-'}</td>
                                <td className="px-6 py-4 text-right">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(e.amount)}</td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {activeSubTab === 'detail' && (
                <div>
                     <div className="flex justify-end mb-4">
                        <button onClick={() => setIsCurrentBudgetModalOpen(true)} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">
                            + Créer un budget
                        </button>
                    </div>
                    <table className="w-full text-sm text-left">
                        {/* Budget detail table */}
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Compte de charge</th><th className="px-6 py-3 text-right">Budgétisé</th><th className="px-6 py-3 text-right">Dépensé</th><th className="px-6 py-3 text-right">Variation (%)</th></tr></thead>
                         <tbody>
                            {budgetDetails.map(line => (
                                <tr key={line.chargeAccountId} className="bg-white border-b">
                                    <td className="px-6 py-4">{line.accountName}</td>
                                    <td className="px-6 py-4 text-right">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(line.budgetedAmount)}</td>
                                    <td className="px-6 py-4 text-right">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(line.spent)}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${line.variation > 0 ? 'text-red-500' : 'text-green-500'}`}>{line.variation.toFixed(2)}%</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            )}
        </>
    );

    const renderWorksBudget = () => (
         <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsWorksBudgetModalOpen(true)} disabled={isGlobalView} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark disabled:bg-gray-400">
                    + Créer un budget travaux
                </button>
            </div>
            <table className="w-full text-sm text-left">
                {/* Works budget table */}
                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Intitulé</th><th className="px-6 py-3">Clé de charge</th><th className="px-6 py-3 text-right">Budget Total</th><th className="px-6 py-3 text-right">Montant Appelé</th><th className="px-6 py-3 text-right">Montant Dépensé</th><th className="px-6 py-3">Statut</th></tr></thead>
                <tbody>
                    {worksBudgets.map(wb => (
                        <tr key={wb.id} className="bg-white border-b">
                             <td className="px-6 py-4">{wb.title}</td>
                             <td className="px-6 py-4">{millesimeLabels.find(ml => ml.key === wb.chargeKey)?.label || wb.chargeKey}</td>
                             <td className="px-6 py-4 text-right">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(wb.totalBudget)}</td>
                             <td className="px-6 py-4 text-right">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(wb.amountCalled)}</td>
                             <td className="px-6 py-4 text-right">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(expenses.filter(e => e.worksBudgetId === wb.id).reduce((sum, e) => sum + Math.abs(e.amount), 0))}</td>
                             <td className="px-6 py-4">{wb.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );


    return (
        <div className="space-y-6">
            <CreateCurrentBudgetModal isOpen={isCurrentBudgetModalOpen} onClose={() => setIsCurrentBudgetModalOpen(false)} addCurrentBudget={addCurrentBudget} chargeAccounts={chargeAccounts} buildingId={building.id} />
            <CreateWorksBudgetModal isOpen={isWorksBudgetModalOpen} onClose={() => setIsWorksBudgetModalOpen(false)} addWorksBudget={addWorksBudget} millesimeLabels={millesimeLabels} buildingId={building.id} />

            <h2 className="text-2xl font-bold text-gray-800">Budget et Dépenses - {building.name}</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="border-b mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('current')} className={`py-2 px-1 text-lg font-semibold ${activeTab === 'current' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Budget courant</button>
                        <button onClick={() => setActiveTab('works')} className={`py-2 px-1 text-lg font-semibold ${activeTab === 'works' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Budget travaux</button>
                    </nav>
                </div>
                {activeTab === 'current' ? renderCurrentBudget() : renderWorksBudget()}
            </div>
        </div>
    );
};
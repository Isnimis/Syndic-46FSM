import React, { useState, useMemo, useEffect } from 'react';
import type { FundCall, CurrentBudget, WorksBudget, CoOwner, Lot, CoOwnerLedgerEntry, View } from '../../types';

interface FundCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBudgets: CurrentBudget[];
    worksBudgets: WorksBudget[];
    coOwners: CoOwner[];
    lots: Lot[];
    createFundCall: (call: Omit<FundCall, 'id' | 'status'>, entries: Omit<CoOwnerLedgerEntry, 'id'>[]) => void;
}

const FundCallModal: React.FC<FundCallModalProps> = ({ isOpen, onClose, currentBudgets, worksBudgets, coOwners, lots, createFundCall }) => {
    const [selectedBudgetId, setSelectedBudgetId] = useState('');
    const [amountToCall, setAmountToCall] = useState('');
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [distribution, setDistribution] = useState<{coOwner: CoOwner, amount: number, millesimes: number}[]>([]);

    const allBudgets = useMemo(() => [
        // FIX: Add `as const` to create a discriminated union, allowing TypeScript to infer types correctly.
        ...currentBudgets.map(b => ({ ...b, type: 'current' as const, name: `Budget Courant ${b.year}` })),
        ...worksBudgets.map(b => ({ ...b, type: 'works' as const, name: `Travaux: ${b.title}` }))
    ], [currentBudgets, worksBudgets]);

    useEffect(() => {
        if (!selectedBudgetId || !amountToCall) {
            setDistribution([]);
            return;
        }

        const budget = allBudgets.find(b => b.id === selectedBudgetId);
        const amount = parseFloat(amountToCall);

        if (!budget || isNaN(amount) || amount <= 0) {
            setDistribution([]);
            return;
        }

        const chargeKey = budget.type === 'works' ? budget.chargeKey : 'charges_generales';
        const applicableLots = lots.filter(l => {
            if (budget.buildingId === 'all') return l.coOwnerId !== null;
            return l.buildingId === budget.buildingId && l.coOwnerId !== null;
        });

        const totalMillesimes = applicableLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
        if (totalMillesimes === 0) {
            setDistribution([]);
            return;
        }

        const coOwnerDistribution = coOwners.map(coOwner => {
            const ownerLots = applicableLots.filter(l => l.coOwnerId === coOwner.id);
            const ownerMillesimes = ownerLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
            const ownerAmount = (ownerMillesimes / totalMillesimes) * amount;
            return { coOwner, amount: ownerAmount, millesimes: ownerMillesimes };
        }).filter(d => d.amount > 0);

        setDistribution(coOwnerDistribution);

    }, [selectedBudgetId, amountToCall, allBudgets, lots, coOwners]);
    
    useEffect(() => {
        if(selectedBudgetId) {
            const budget = allBudgets.find(b => b.id === selectedBudgetId);
            if(budget) setTitle(`Appel de fonds - ${budget.name}`);
        } else {
            setTitle('');
        }
    }, [selectedBudgetId, allBudgets]);


    const handleSubmit = () => {
        const budget = allBudgets.find(b => b.id === selectedBudgetId);
        if (!budget || distribution.length === 0 || !title || !dueDate) {
            alert("Veuillez remplir tous les champs et vérifier la distribution.");
            return;
        }

        const newFundCall: Omit<FundCall, 'id' | 'status'> = {
            title,
            creationDate: new Date().toISOString().split('T')[0],
            dueDate,
            budgetId: budget.id,
            budgetType: budget.type as 'current' | 'works',
            totalAmount: parseFloat(amountToCall),
        };

        const newLedgerEntries: Omit<CoOwnerLedgerEntry, 'id'>[] = distribution.map(dist => ({
            coOwnerId: dist.coOwner.id,
            date: newFundCall.creationDate,
            description: title,
            amount: -Math.abs(dist.amount), // Charge is negative
            accountType: budget.type === 'works' ? 'travaux' : 'charges'
        }));

        createFundCall(newFundCall, newLedgerEntries);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Créer un Appel de Fonds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Panel: Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Budget de référence</label>
                            <select value={selectedBudgetId} onChange={e => setSelectedBudgetId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                <option value="">Sélectionner un budget</option>
                                {allBudgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Titre de l'appel</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">Montant à appeler (€)</label>
                                <input type="number" step="0.01" value={amountToCall} onChange={e => setAmountToCall(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Date d'échéance</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                        </div>
                    </div>
                    {/* Right Panel: Preview */}
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-2">Prévisualisation de la répartition</h4>
                        <div className="max-h-64 overflow-y-auto">
                           {distribution.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-gray-700 uppercase"><tr><th>Copropriétaire</th><th className="text-right">Montant</th></tr></thead>
                                    <tbody>
                                    {distribution.map(d => (
                                        <tr key={d.coOwner.id} className="border-b">
                                            <td className="py-1">{d.coOwner.type === 'sci' ? d.coOwner.companyName : `${d.coOwner.firstName} ${d.coOwner.lastName}`}</td>
                                            <td className="py-1 text-right font-mono">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(d.amount)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                           ) : (
                                <p className="text-xs text-gray-500 italic text-center py-4">Saisissez un budget et un montant pour voir la répartition.</p>
                           )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md">Annuler</button>
                    <button type="button" onClick={handleSubmit} disabled={distribution.length === 0} className="bg-brand-secondary text-white py-2 px-4 rounded-md disabled:bg-gray-400">Générer l'appel de fonds</button>
                </div>
            </div>
        </div>
    );
};

interface AppelsDeFondViewProps {
    fundCalls: FundCall[];
    currentBudgets: CurrentBudget[];
    worksBudgets: WorksBudget[];
    coOwners: CoOwner[];
    lots: Lot[];
    createFundCall: (call: Omit<FundCall, 'id' | 'status'>, entries: Omit<CoOwnerLedgerEntry, 'id'>[]) => void;
    setActiveView: (view: View) => void;
    setSelectedFundCallId: (id: string) => void;
}

export const AppelsDeFondView: React.FC<AppelsDeFondViewProps> = (props) => {
    const { fundCalls, setActiveView, setSelectedFundCallId } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (callId: string) => {
        setSelectedFundCallId(callId);
        setActiveView('finance-appel-detail');
    };

    return (
        <div className="space-y-6">
            <FundCallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} {...props} />
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-800">Appels de Fond</h2>
                 <button onClick={() => setIsModalOpen(true)} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">
                    + Créer un Appel de Fonds
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des appels de fonds</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Date Création</th>
                                <th className="px-6 py-3">Titre</th>
                                <th className="px-6 py-3">Date Échéance</th>
                                <th className="px-6 py-3 text-right">Montant Total</th>
                                <th className="px-6 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fundCalls.map(call => (
                                <tr key={call.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(call.id)}>
                                    <td className="px-6 py-4">{new Date(call.creationDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{call.title}</td>
                                    <td className="px-6 py-4">{new Date(call.dueDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(call.totalAmount)}</td>
                                    <td className="px-6 py-4">{call.status}</td>
                                </tr>
                            ))}
                             {fundCalls.length === 0 && (
                                <tr>
                                   <td colSpan={5} className="text-center italic text-gray-500 py-4">Aucun appel de fonds créé.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
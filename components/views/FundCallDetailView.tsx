import React, { useState, useMemo } from 'react';
import type { FundCall, CurrentBudget, WorksBudget, CoOwner, Lot } from '../../types';

interface FundCallDetailViewProps {
    fundCall: FundCall;
    updateFundCall: (fundCall: FundCall) => void;
    onBack: () => void;
    currentBudgets: CurrentBudget[];
    worksBudgets: WorksBudget[];
    coOwners: CoOwner[];
    lots: Lot[];
}

export const FundCallDetailView: React.FC<FundCallDetailViewProps> = ({ fundCall, updateFundCall, onBack, currentBudgets, worksBudgets, coOwners, lots }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedFundCall, setEditedFundCall] = useState<FundCall>(fundCall);

    const allBudgets = useMemo(() => [
        ...currentBudgets.map(b => ({ ...b, type: 'current' as const, name: `Budget Courant ${b.year}` })),
        ...worksBudgets.map(b => ({ ...b, type: 'works' as const, name: `Travaux: ${b.title}` }))
    ], [currentBudgets, worksBudgets]);
    
    const budget = useMemo(() => {
        return allBudgets.find(b => b.id === fundCall.budgetId);
    }, [fundCall.budgetId, allBudgets]);

    const distribution = useMemo(() => {
        if (!budget) return [];
        
        const chargeKey = budget.type === 'works' ? budget.chargeKey : 'charges_generales';
        const applicableLots = lots.filter(l => {
            if (budget.buildingId === 'all') return l.coOwnerId !== null;
            return l.buildingId === budget.buildingId && l.coOwnerId !== null;
        });

        const totalMillesimes = applicableLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
        if (totalMillesimes === 0) return [];

        return coOwners.map(coOwner => {
            const ownerLots = applicableLots.filter(l => l.coOwnerId === coOwner.id);
            const ownerMillesimes = ownerLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
            const ownerAmount = (ownerMillesimes / totalMillesimes) * fundCall.totalAmount;
            return { coOwner, amount: ownerAmount };
        }).filter(d => d.amount > 0);
    }, [fundCall, budget, lots, coOwners]);
    
    const handleSave = () => {
        updateFundCall(editedFundCall);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedFundCall(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Détail de l'appel de fonds</h2>
                    <p className="text-sm text-gray-500">{fundCall.title}</p>
                </div>
                <button onClick={onBack} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                    &larr; Retour à la liste
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <div className="flex justify-between items-start mb-4 border-b pb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Informations Générales</h3>
                            <p className="text-sm text-gray-500">Statut: <span className="font-semibold">{fundCall.status}</span></p>
                        </div>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700">
                                Modifier
                            </button>
                        )}
                     </div>
                     
                     {isEditing ? (
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Titre</label>
                                <input type="text" name="title" value={editedFundCall.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Date d'échéance</label>
                                <input type="date" name="dueDate" value={editedFundCall.dueDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300"/>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm">Annuler</button>
                                <button onClick={handleSave} className="bg-brand-secondary text-white py-2 px-3 rounded-md text-sm">Sauvegarder</button>
                            </div>
                         </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-gray-500">Titre</p><p className="font-semibold">{fundCall.title}</p></div>
                            <div><p className="text-gray-500">Montant Total</p><p className="font-semibold">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(fundCall.totalAmount)}</p></div>
                            <div><p className="text-gray-500">Date de création</p><p className="font-semibold">{new Date(fundCall.creationDate).toLocaleDateString('fr-FR')}</p></div>
                            <div><p className="text-gray-500">Date d'échéance</p><p className="font-semibold">{new Date(fundCall.dueDate).toLocaleDateString('fr-FR')}</p></div>
                            <div className="col-span-2"><p className="text-gray-500">Budget de référence</p><p className="font-semibold">{budget?.name || 'Inconnu'}</p></div>
                        </div>
                     )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Copropriétaire</h3>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <tbody>
                            {distribution.map(d => (
                                <tr key={d.coOwner.id} className="border-b">
                                    <td className="py-2">{d.coOwner.type === 'sci' ? d.coOwner.companyName : `${d.coOwner.firstName} ${d.coOwner.lastName}`}</td>
                                    <td className="py-2 text-right font-mono">{new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(d.amount)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {distribution.length === 0 && <p className="text-xs text-gray-500 italic">Aucune répartition à afficher.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

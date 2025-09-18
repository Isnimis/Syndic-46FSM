import React, { useState, useMemo } from 'react';
import type { FundCall, CoOwner, Lot, CurrentBudget, WorksBudget } from '../../types';
import { exportFundCallSummaryToPDF } from '../../utils/pdfExporter';

interface PrintFundCallsViewProps {
  fundCalls: FundCall[];
  coOwners: CoOwner[];
  lots: Lot[];
  currentBudgets: CurrentBudget[];
  worksBudgets: WorksBudget[];
}

export const PrintFundCallsView: React.FC<PrintFundCallsViewProps> = ({ fundCalls, coOwners, lots, currentBudgets, worksBudgets }) => {
    const [selectedFundCallId, setSelectedFundCallId] = useState<string>('');

    const getCoOwnerName = (coOwner: CoOwner) => {
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };

    const { selectedFundCall, distribution } = useMemo(() => {
        if (!selectedFundCallId) return { selectedFundCall: null, distribution: [] };

        const fundCall = fundCalls.find(fc => fc.id === selectedFundCallId);
        if (!fundCall) return { selectedFundCall: null, distribution: [] };

        const allBudgets = [
            ...currentBudgets.map(b => ({ ...b, type: 'current' as const })),
            ...worksBudgets.map(b => ({ ...b, type: 'works' as const }))
        ];
        const budget = allBudgets.find(b => b.id === fundCall.budgetId);
        if (!budget) return { selectedFundCall: fundCall, distribution: [] };

        const chargeKey = budget.type === 'works' ? budget.chargeKey : 'charges_generales';
        const applicableLots = lots.filter(l => {
            if (budget.buildingId === 'all') return l.coOwnerId !== null;
            return l.buildingId === budget.buildingId && l.coOwnerId !== null;
        });

        const totalMillesimes = applicableLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
        if (totalMillesimes === 0) return { selectedFundCall: fundCall, distribution: [] };

        const calculatedDistribution = coOwners.map(coOwner => {
            const ownerLots = applicableLots.filter(l => l.coOwnerId === coOwner.id);
            const ownerMillesimes = ownerLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
            const ownerAmount = (ownerMillesimes / totalMillesimes) * fundCall.totalAmount;
            return { coOwner, amount: ownerAmount };
        }).filter(d => d.amount > 0);

        return { selectedFundCall: fundCall, distribution: calculatedDistribution };
    }, [selectedFundCallId, fundCalls, coOwners, lots, currentBudgets, worksBudgets]);
    
    const handleDownload = () => {
        if (selectedFundCall) {
            exportFundCallSummaryToPDF(selectedFundCall, distribution);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Impression des Appels de Fonds</h2>
                <button 
                    onClick={handleDownload}
                    disabled={!selectedFundCall}
                    className="flex items-center gap-2 bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark disabled:bg-gray-400"
                >
                    <span>📄</span>
                    Télécharger la synthèse (PDF)
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                    <label htmlFor="fundcall-select" className="block text-sm font-medium text-gray-700">Sélectionner un appel de fonds :</label>
                    <select id="fundcall-select" value={selectedFundCallId} onChange={e => setSelectedFundCallId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md">
                        <option value="">-- Choisir un appel de fonds --</option>
                        {fundCalls.map(fc => (
                            <option key={fc.id} value={fc.id}>{fc.title}</option>
                        ))}
                    </select>
                </div>

                {selectedFundCall ? (
                    <div>
                        <div className="mb-4 text-center">
                            <h3 className="font-bold text-xl">{selectedFundCall.title}</h3>
                            <p>Montant total : <span className="font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedFundCall.totalAmount)}</span></p>
                            <p>Date d'échéance : <span className="font-semibold">{new Date(selectedFundCall.dueDate).toLocaleDateString('fr-FR')}</span></p>
                        </div>
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-3 border">Copropriétaire</th>
                                    <th scope="col" className="px-4 py-3 border text-right">Montant à payer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {distribution.map(item => (
                                    <tr key={item.coOwner.id} className="bg-white border-b">
                                        <td className="px-4 py-2 border font-medium">{getCoOwnerName(item.coOwner)}</td>
                                        <td className="px-4 py-2 border text-right font-semibold">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 italic">Veuillez sélectionner un appel de fonds pour afficher le détail.</p>
                )}
            </div>
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import type { FundCall, CoOwner, Lot, CurrentBudget, WorksBudget, MillesimeLabel, Building } from '../../types';
import { exportIndividualFundCallsToPDF } from '../../utils/pdfExporter';

interface PrintIndividualFundCallViewProps {
  fundCalls: FundCall[];
  coOwners: CoOwner[];
  lots: Lot[];
  currentBudgets: CurrentBudget[];
  worksBudgets: WorksBudget[];
  millesimeLabels: MillesimeLabel[];
  buildings: Building[];
}

export const PrintIndividualFundCallView: React.FC<PrintIndividualFundCallViewProps> = ({ fundCalls, coOwners, lots, currentBudgets, worksBudgets, millesimeLabels, buildings }) => {
    const [selectedFundCallId, setSelectedFundCallId] = useState<string>('');

    const getCoOwnerName = (coOwner: CoOwner) => {
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };
    
    const getBuildingName = (buildingId: string) => {
        return buildings.find(b => b.id === buildingId)?.name || 'N/A';
    };

    const { selectedFundCall, distribution, budget } = useMemo(() => {
        if (!selectedFundCallId) return { selectedFundCall: null, distribution: [], budget: null };

        const fundCall = fundCalls.find(fc => fc.id === selectedFundCallId);
        if (!fundCall) return { selectedFundCall: null, distribution: [], budget: null };

        const allBudgets = [
            ...currentBudgets.map(b => ({ ...b, type: 'current' as const, name: `Budget Courant ${b.year}` })),
            ...worksBudgets.map(b => ({ ...b, type: 'works' as const, name: `Travaux: ${b.title}` }))
        ];
        const foundBudget = allBudgets.find(b => b.id === fundCall.budgetId);
        if (!foundBudget) return { selectedFundCall: fundCall, distribution: [], budget: null };

        const chargeKey = foundBudget.type === 'works' ? foundBudget.chargeKey : 'charges_generales';
        const applicableLots = lots.filter(l => {
            if (foundBudget.buildingId === 'all') return l.coOwnerId !== null;
            return l.buildingId === foundBudget.buildingId && l.coOwnerId !== null;
        });

        const totalMillesimes = applicableLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
        if (totalMillesimes === 0) return { selectedFundCall: fundCall, distribution: [], budget: foundBudget };

        const calculatedDistribution = coOwners.map(coOwner => {
            const ownerLots = applicableLots.filter(l => l.coOwnerId === coOwner.id);
            if (ownerLots.length === 0) return null;
            
            const ownerMillesimes = ownerLots.reduce((sum, lot) => sum + (lot.millesimes[chargeKey] || 0), 0);
            const ownerAmount = (ownerMillesimes / totalMillesimes) * fundCall.totalAmount;

            const lotsDetails = ownerLots.map(lot => ({
                lotNumber: lot.lotNumber,
                buildingName: getBuildingName(lot.buildingId),
                millesimes: lot.millesimes[chargeKey] || 0
            }));
            
            return { coOwner, amount: ownerAmount, lotsDetails, ownerMillesimes };
        }).filter((d): d is { coOwner: CoOwner; amount: number; lotsDetails: { lotNumber: string; buildingName: string; millesimes: number; }[]; ownerMillesimes: number; } => d !== null && d.amount > 0);

        return { selectedFundCall: fundCall, distribution: calculatedDistribution, budget: foundBudget };
    }, [selectedFundCallId, fundCalls, coOwners, lots, currentBudgets, worksBudgets, buildings]);
    
    const handleDownload = () => {
        if (selectedFundCall && budget) {
            exportIndividualFundCallsToPDF(selectedFundCall, distribution, budget, millesimeLabels);
        }
    }

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Appels de fonds individuels</h2>
                 <button 
                    onClick={handleDownload}
                    disabled={!selectedFundCall}
                    className="flex items-center gap-2 bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark disabled:bg-gray-400"
                >
                    <span>📄</span>
                    Télécharger les documents (PDF)
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

                {selectedFundCall && distribution.length > 0 && budget ? (
                    <div className="space-y-4">
                        {distribution.map((item) => (
                            <div key={item.coOwner.id} className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-bold text-lg">{selectedFundCall.title}</h3>
                                <div className="grid grid-cols-2 gap-4 my-4">
                                    <div>
                                        <p className="text-sm font-semibold">{getCoOwnerName(item.coOwner)}</p>
                                        <p className="text-sm">{item.coOwner.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">Date : {new Date(selectedFundCall.creationDate).toLocaleDateString('fr-FR')}</p>
                                        <p className="text-sm">Échéance : {new Date(selectedFundCall.dueDate).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                                
                                <p className="mb-4">Détail du calcul :</p>
                                <table className="w-full text-sm mb-4">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Lot</th>
                                            <th className="p-2 text-left">Bâtiment</th>
                                            <th className="p-2 text-right">Tantièmes ({millesimeLabels.find(ml => ml.key === (budget?.type === 'works' ? budget.chargeKey : 'charges_generales'))?.label})</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.lotsDetails.map((lot, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2">{lot.lotNumber}</td>
                                                <td className="p-2">{lot.buildingName}</td>
                                                <td className="p-2 text-right">{lot.millesimes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="font-semibold">
                                        <tr>
                                            <td colSpan={2} className="p-2 text-right">Total tantièmes</td>
                                            <td className="p-2 text-right">{item.ownerMillesimes}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className="text-right mt-4 bg-gray-50 p-4 rounded">
                                    <p className="text-lg font-bold">Montant à régler : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.amount)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 italic">Veuillez sélectionner un appel de fonds pour générer les documents.</p>
                )}
            </div>
        </div>
    );
};

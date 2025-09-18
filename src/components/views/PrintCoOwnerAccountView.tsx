import React, { useState, useMemo } from 'react';
import type { CoOwner, CoOwnerLedgerEntry } from '../../types';
import { exportCoOwnerAccountToPDF } from '../../utils/pdfExporter';

interface PrintCoOwnerAccountViewProps {
  coOwners: CoOwner[];
  coOwnerLedgerEntries: CoOwnerLedgerEntry[];
}

export const PrintCoOwnerAccountView: React.FC<PrintCoOwnerAccountViewProps> = ({ coOwners, coOwnerLedgerEntries }) => {
    const [selectedCoOwnerId, setSelectedCoOwnerId] = useState<string>('');
    const [activeAccount, setActiveAccount] = useState<'charges' | 'travaux'>('charges');

    const getCoOwnerName = (coOwner: CoOwner) => {
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };

    const { accountBalance, filteredLedger, selectedCoOwner, totalDebit, totalCredit } = useMemo(() => {
        if (!selectedCoOwnerId) return { accountBalance: 0, filteredLedger: [], selectedCoOwner: null, totalDebit: 0, totalCredit: 0 };

        const coOwner = coOwners.find(c => c.id === selectedCoOwnerId);
        const filtered = coOwnerLedgerEntries
            .filter(e => e.coOwnerId === selectedCoOwnerId && e.accountType === activeAccount)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const balance = filtered.reduce((acc, entry) => acc + entry.amount, 0);
        const totalDebit = filtered.reduce((acc, entry) => entry.amount < 0 ? acc + Math.abs(entry.amount) : acc, 0);
        const totalCredit = filtered.reduce((acc, entry) => entry.amount > 0 ? acc + entry.amount : acc, 0);

        return { accountBalance: balance, filteredLedger: filtered, selectedCoOwner: coOwner, totalDebit, totalCredit };
    }, [selectedCoOwnerId, activeAccount, coOwners, coOwnerLedgerEntries]);
    
    const handleDownload = () => {
        if(selectedCoOwner) {
            exportCoOwnerAccountToPDF(selectedCoOwner, filteredLedger, activeAccount);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Consultation de compte du copropriétaire</h2>
                <button 
                    onClick={handleDownload}
                    disabled={!selectedCoOwner}
                    className="flex items-center gap-2 bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark disabled:bg-gray-400"
                >
                    <span>📄</span>
                    Télécharger le relevé (PDF)
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="mb-6 space-y-2">
                    <div>
                        <label htmlFor="coowner-select" className="block text-sm font-medium text-gray-700">Sélectionner un copropriétaire :</label>
                        <select id="coowner-select" value={selectedCoOwnerId} onChange={e => setSelectedCoOwnerId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md">
                            <option value="">-- Choisir --</option>
                            {coOwners.map(c => (
                                <option key={c.id} value={c.id}>{getCoOwnerName(c)}</option>
                            ))}
                        </select>
                    </div>
                    {selectedCoOwnerId && (
                        <div className="flex border-b">
                            <button onClick={() => setActiveAccount('charges')} className={`px-3 py-1 text-sm ${activeAccount === 'charges' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>
                                Compte Charges
                            </button>
                            <button onClick={() => setActiveAccount('travaux')} className={`px-3 py-1 text-sm ${activeAccount === 'travaux' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>
                                Compte Travaux
                            </button>
                        </div>
                    )}
                </div>

                {selectedCoOwner ? (
                    <div>
                        <div className="mb-4">
                            <h3 className="font-bold text-lg">{getCoOwnerName(selectedCoOwner)}</h3>
                            <p className="text-md">Relevé du compte : <span className="font-semibold">{activeAccount === 'charges' ? 'Charges Générales' : 'Fonds de Travaux'}</span></p>
                        </div>
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-3 border">Date</th>
                                    <th scope="col" className="px-4 py-3 border">Libellé</th>
                                    <th scope="col" className="px-4 py-3 border text-right">Débit</th>
                                    <th scope="col" className="px-4 py-3 border text-right">Crédit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLedger.map(entry => (
                                    <tr key={entry.id} className="bg-white border-b">
                                        <td className="px-4 py-2 border">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-2 border">{entry.description}</td>
                                        <td className="px-4 py-2 border text-right font-semibold text-red-700">
                                            {entry.amount < 0 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.abs(entry.amount)) : ''}
                                        </td>
                                        <td className="px-4 py-2 border text-right font-semibold text-green-700">
                                            {entry.amount > 0 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.amount) : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-semibold bg-gray-50">
                                    <td colSpan={2} className="px-4 py-2 border text-right">Totaux</td>
                                    <td className="px-4 py-2 border text-right text-red-700">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalDebit)}
                                    </td>
                                    <td className="px-4 py-2 border text-right text-green-700">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalCredit)}
                                    </td>
                                </tr>
                                <tr className="font-bold bg-gray-100">
                                    <td colSpan={3} className="px-4 py-2 border text-right">Solde du compte</td>
                                    <td className={`px-4 py-2 border text-right ${accountBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(accountBalance)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 italic">Veuillez sélectionner un copropriétaire pour afficher son relevé de compte.</p>
                )}
            </div>
        </div>
    );
};

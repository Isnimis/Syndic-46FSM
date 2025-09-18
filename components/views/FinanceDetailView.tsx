import React from 'react';
import type { Transaction, CoOwner, Building, Supplier } from '../../types';

interface FinanceDetailViewProps {
    transaction: Transaction;
    coOwners: CoOwner[];
    suppliers: Supplier[];
    buildings: Building[];
    onBack: () => void;
}

export const FinanceDetailView: React.FC<FinanceDetailViewProps> = ({ transaction, coOwners, suppliers, buildings, onBack }) => {

    const getCoOwnerName = (id: string) => {
        const coOwner = coOwners.find(c => c.id === id);
        if (!coOwner) return 'N/A';
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };

    // FIX: Add a function to get supplier name from the suppliers list.
    const getSupplierName = (id: string) => {
        const supplier = suppliers.find(s => s.id === id);
        return supplier ? supplier.name : 'Non spécifié';
    };

    const getBuildingName = (id: string) => {
        return buildings.find(b => b.id === id)?.name || 'N/A';
    };

    const isExpense = transaction.amount < 0;
    const borderColor = isExpense ? 'border-red-500' : 'border-green-500';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Détail du mouvement financier</h2>
                <button
                    onClick={onBack}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                    &larr; Retour au suivi des comptes
                </button>
            </div>
            
            <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${borderColor}`}>
                {/* Résumé */}
                <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Résumé</h3>
                    <div className="flex justify-between items-center text-xl">
                        <span className="font-medium text-gray-700">{transaction.description}</span>
                        <span className={`font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.amount)}
                        </span>
                    </div>
                     <p className="text-sm text-gray-500 mt-1">Date du mouvement : {new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                </div>

                {/* Mouvement détaillé */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Mouvement détaillé</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-500">Type de mouvement</span>
                            <span className="font-semibold text-gray-800">{isExpense ? 'Dépense' : 'Encaissement'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-500">{isExpense ? 'Fournisseur' : 'Copropriétaire'}</span>
                            <span className="font-semibold text-gray-800">
                                {/* FIX: Use supplierId to get the supplier name. */}
                                {isExpense ? (transaction.supplierId ? getSupplierName(transaction.supplierId) : 'Non spécifié') : (transaction.coOwnerId ? getCoOwnerName(transaction.coOwnerId) : 'Non spécifié')}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-500">Libellé</span>
                            <span className="font-semibold text-gray-800">{transaction.description}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-500">Montant</span>
                            <span className="font-semibold text-gray-800">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.amount)}</span>
                        </div>
                         <div className="flex flex-col">
                            {/* FIX: Clarified the label for consistency. */}
                            <span className="font-medium text-gray-500">Compte</span>
                            <span className="font-semibold text-gray-800">{getBuildingName(transaction.buildingId)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-500">Clé de répartition</span>
                            <span className="font-semibold text-gray-800">{transaction.category || 'Non spécifiée'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
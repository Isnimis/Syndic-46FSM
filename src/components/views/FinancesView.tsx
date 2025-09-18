import React, { useState, useRef } from 'react';
import type { Building, Transaction, View, Supplier, CoOwner, ChargeAccount } from '../../types';

const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    buildings: Building[];
    suppliers: Supplier[];
    coOwners: CoOwner[];
    chargeAccounts: ChargeAccount[];
    isGlobalView: boolean;
    initialBuildingId: string;
}> = ({ isOpen, onClose, addTransaction, buildings, suppliers, coOwners, chargeAccounts, isGlobalView, initialBuildingId }) => {
    
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [tierId, setTierId] = useState(''); // supplier or coOwner ID
    const [buildingId, setBuildingId] = useState(isGlobalView ? '' : initialBuildingId);
    const [chargeAccountId, setChargeAccountId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || !description || !date || (isGlobalView && !buildingId)) {
            alert("Veuillez remplir tous les champs obligatoires et sélectionner un compte valide.");
            return;
        };

        const finalBuildingId = isGlobalView ? buildingId : initialBuildingId;
        if (finalBuildingId === 'all') {
            alert("Veuillez sélectionner un compte valide.");
            return;
        }

        const transaction: Omit<Transaction, 'id'> = {
            buildingId: finalBuildingId,
            date,
            description,
            amount: type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
            category: type === 'expense' ? 'Dépense Manuelle' : 'Encaissement Manuel',
            supplierId: type === 'expense' ? tierId || null : null,
            coOwnerId: type === 'income' ? tierId || null : null,
            chargeAccountId: type === 'expense' ? chargeAccountId || undefined : undefined,
        };
        addTransaction(transaction);
        onClose();
        // Reset form
        setDescription(''); setAmount(''); setTierId(''); setChargeAccountId(''); setBuildingId(isGlobalView ? '' : initialBuildingId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un Mouvement Bancaire</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type de Mouvement</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="expense">Dépense</option>
                            <option value="income">Encaissement</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Libellé</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Montant (€)</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{type === 'expense' ? 'Fournisseur' : 'Copropriétaire'}</label>
                        <select value={tierId} onChange={e => setTierId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Sélectionner...</option>
                            {(type === 'expense' ? suppliers : coOwners).map(tier => (
                                <option key={tier.id} value={tier.id}>
                                    {'name' in tier ? tier.name : `${tier.firstName} ${tier.lastName}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {type === 'expense' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Compte de Charge</label>
                            <select value={chargeAccountId} onChange={e => setChargeAccountId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="">Aucun</option>
                                {chargeAccounts.map(ca => <option key={ca.id} value={ca.id}>{ca.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    {isGlobalView && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Compte</label>
                            <select value={buildingId} onChange={e => setBuildingId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                <option value="" disabled>Sélectionner un compte...</option>
                                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">Annuler</button>
                        <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CSVImport: React.FC<{
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
    buildings: Building[];
    suppliers: Supplier[];
    coOwners: CoOwner[];
}> = ({ addTransactions, buildings, suppliers, coOwners }) => {
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        const text = await file.text();
        const lines = text.split('\n').slice(1); // Skip header
        const newTransactions: Omit<Transaction, 'id'>[] = [];
        const buildingMap = new Map(buildings.map(b => [b.name.trim().toLowerCase(), b.id]));

        for (const line of lines) {
            if (!line.trim()) continue;
            const [dateStr, libelle, montantStr, type, tiers, batimentName] = line.split(',');
            
            if (!dateStr || !libelle || !montantStr || !type || !tiers || !batimentName) {
                console.warn("Ligne CSV incomplète ignorée :", line);
                continue;
            }

            // Parse date in JJ/MM/AAAA format
            const [day, month, year] = dateStr.trim().split('/');
            const date = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
            const amount = parseFloat(montantStr.trim());
            
            const buildingId = buildingMap.get(batimentName.trim().toLowerCase());

            if (!date || isNaN(new Date(date).getTime()) || !libelle || isNaN(amount) || !type.trim() || !tiers.trim() || !buildingId) {
                setError(`Ligne invalide ignorée (vérifiez le format de la date JJ/MM/AAAA) : ${line}`);
                continue;
            }

            const isExpense = type.trim().toLowerCase() === 'depense';
            const tierName = tiers.trim().toLowerCase();
            const tierId = isExpense 
                ? suppliers.find(s => s.name.toLowerCase() === tierName)?.id
                : coOwners.find(c => `${c.firstName} ${c.lastName}`.toLowerCase() === tierName || c.companyName?.toLowerCase() === tierName)?.id;

            newTransactions.push({
                buildingId,
                date,
                description: libelle.trim(),
                amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
                category: 'Import CSV',
                supplierId: isExpense ? tierId : undefined,
                coOwnerId: !isExpense ? tierId : undefined,
            });
        }
        if(newTransactions.length > 0) {
            addTransactions(newTransactions);
            alert(`${newTransactions.length} transactions importées avec succès.`);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadCSVTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date (JJ/MM/AAAA),Libelle,Montant,Type,Tiers,Batiment\n"
            + "15/08/2024,Facture Electricien,250.00,Depense,PropreTout Nettoyage,BAT A\n"
            + "16/08/2024,Paiement charges T3,350.50,Encaissement,Jean Dupont,BAT A\n"
            + "20/08/2024,Assurance,1250.00,Depense,AssureTout,Toute la copro\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modele_import.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-gray-50 p-3 rounded-lg border">
            <h4 className="font-semibold text-gray-700 text-sm">Importer des mouvements</h4>
            <div className="flex items-center space-x-2 mt-2">
                <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="text-xs w-full"/>
            </div>
            <button onClick={downloadCSVTemplate} className="text-xs text-blue-600 hover:underline mt-1">Télécharger le modèle</button>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
};

interface FinancesViewProps {
    building: Building | { id: string, name: string };
    transactions: Transaction[];
    setActiveView: (view: View) => void;
    setSelectedTransactionId: (transactionId: string) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
    suppliers: Supplier[];
    coOwners: CoOwner[];
    buildings: Building[];
    chargeAccounts: ChargeAccount[];
    isGlobalView: boolean;
}

export const FinancesView: React.FC<FinancesViewProps> = (props) => {
    const { building, transactions, setActiveView, setSelectedTransactionId, suppliers, coOwners } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (transaction: Transaction) => {
        setSelectedTransactionId(transaction.id);
        setActiveView('finance-detail');
    };

    const getTierName = (tx: Transaction): string => {
        if (tx.supplierId) {
            const supplier = suppliers.find(s => s.id === tx.supplierId);
            return supplier?.name || 'N/A';
        }
        if (tx.coOwnerId) {
            const coOwner = coOwners.find(c => c.id === tx.coOwnerId);
            if (!coOwner) return 'N/A';
            return coOwner.type === 'sci' 
                ? coOwner.companyName || 'SCI Inconnue' 
                : `${coOwner.firstName} ${coOwner.lastName}`;
        }
        return '';
    };

    return (
        <div className="space-y-6">
            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} {...props} initialBuildingId={building.id} />
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-2xl font-bold text-gray-800">Suivi des Comptes - {building.name}</h2>
                 <div className="flex items-center gap-4 shrink-0">
                    <div className="w-full sm:w-auto max-w-sm">
                        <CSVImport 
                            addTransactions={props.addTransactions}
                            buildings={props.buildings}
                            suppliers={props.suppliers}
                            coOwners={props.coOwners}
                        />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark whitespace-nowrap h-full">
                        + Ajouter un mouvement
                    </button>
                 </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Derniers Mouvements</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Fournisseur / Tiers</th>
                                {props.isGlobalView && <th scope="col" className="px-6 py-3">Compte</th>}
                                <th scope="col" className="px-6 py-3 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(tx)}>
                                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{tx.description}</td>
                                    <td className="px-6 py-4">{getTierName(tx)}</td>
                                    {props.isGlobalView && <td className="px-6 py-4">{props.buildings.find(b => b.id === tx.buildingId)?.name || ''}</td>}
                                    <td className={`px-6 py-4 text-right font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                             {transactions.length === 0 && (
                                <tr>
                                   <td colSpan={props.isGlobalView ? 5 : 4} className="text-center italic text-gray-500 py-4">Aucune transaction à afficher.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
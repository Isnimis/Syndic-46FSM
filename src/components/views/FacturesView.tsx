import React, { useState, useMemo } from 'react';
import type { Building, Invoice, Supplier, View } from '../../types';
import { InvoiceStatus } from '../../types';

interface FacturesViewProps {
    invoices: Invoice[];
    suppliers: Supplier[];
    buildings: Building[];
    isGlobalView: boolean;
    building: Building | { id: string; name: string };
    addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
    updateInvoice: (invoice: Invoice) => void;
    payInvoice: (invoice: Invoice) => void;
    setActiveView: (view: View) => void;
    setSelectedInvoiceId: (id: string) => void;
}

const InvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
    buildings: Building[];
    suppliers: Supplier[];
    isGlobalView: boolean;
    initialBuildingId: string;
}> = ({ isOpen, onClose, addInvoice, buildings, suppliers, isGlobalView, initialBuildingId }) => {
    
    const [supplierId, setSupplierId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [buildingId, setBuildingId] = useState(isGlobalView ? '' : initialBuildingId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        const finalBuildingId = isGlobalView ? buildingId : initialBuildingId;

        if (isNaN(numAmount) || !supplierId || !invoiceNumber || !issueDate || !dueDate || !finalBuildingId || finalBuildingId === 'all') {
             alert("Veuillez remplir tous les champs et sélectionner un bâtiment valide.");
             return;
        }

        addInvoice({
            buildingId: finalBuildingId,
            supplierId,
            invoiceNumber,
            amount: Math.abs(numAmount),
            issueDate,
            dueDate,
            status: InvoiceStatus.ToPay,
        });
        onClose();
        // Reset form
        setSupplierId(''); setInvoiceNumber(''); setAmount(''); setDueDate(''); setBuildingId(isGlobalView ? '' : initialBuildingId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une facture</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                        <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                            <option value="">Sélectionner un fournisseur...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Numéro de facture</label>
                            <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Montant (€)</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Date d'émission</label>
                            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                    </div>
                     {isGlobalView && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Bâtiment</label>
                            <select value={buildingId} onChange={e => setBuildingId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                <option value="" disabled>Sélectionner un bâtiment</option>
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


export const FacturesView: React.FC<FacturesViewProps> = ({ invoices, suppliers, buildings, isGlobalView, building, addInvoice, updateInvoice, payInvoice, setActiveView, setSelectedInvoiceId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterSupplier, setFilterSupplier] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || 'Inconnu';
    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'N/A';
    
    const handleViewDetails = (invoiceId: string) => {
        setSelectedInvoiceId(invoiceId);
        setActiveView('finance-facture-detail');
    };

    const StatusBadge: React.FC<{status: InvoiceStatus}> = ({status}) => {
        const colorClasses = {
            [InvoiceStatus.Paid]: 'bg-green-100 text-green-800',
            [InvoiceStatus.ToPay]: 'bg-yellow-100 text-yellow-800',
            [InvoiceStatus.Overdue]: 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>{status}</span>
    }
    
    const handlePayInvoice = (invoice: Invoice, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Voulez-vous vraiment payer la facture n°${invoice.invoiceNumber} d'un montant de ${invoice.amount}€ ? Une transaction sera créée.`)) {
            payInvoice(invoice);
        }
    }

    const filteredAndSortedInvoices = useMemo(() => {
        let filtered = [...invoices];

        if (filterSupplier !== 'all') {
            filtered = filtered.filter(inv => inv.supplierId === filterSupplier);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(inv => inv.status === filterStatus);
        }

        return filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }, [invoices, filterSupplier, filterStatus]);

    return (
        <div className="space-y-6">
            <InvoiceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                addInvoice={addInvoice}
                buildings={buildings}
                suppliers={suppliers}
                isGlobalView={isGlobalView}
                initialBuildingId={building.id}
            />
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-800">Suivi des Factures - {building.name}</h2>
                 <button onClick={() => setIsModalOpen(true)} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">
                    + Ajouter une facture
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b">
                    <div>
                        <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700">Filtrer par fournisseur</label>
                        <select
                            id="supplier-filter"
                            value={filterSupplier}
                            onChange={e => setFilterSupplier(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                        >
                            <option value="all">Tous les fournisseurs</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Filtrer par statut</label>
                        <select
                            id="status-filter"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                        >
                            <option value="all">Tous les statuts</option>
                            {Object.values(InvoiceStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Liste des factures</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {isGlobalView && <th scope="col" className="px-6 py-3">Bâtiment</th>}
                                <th scope="col" className="px-6 py-3">Fournisseur</th>
                                <th scope="col" className="px-6 py-3">N° Facture</th>
                                <th scope="col" className="px-6 py-3">Date d'échéance</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3 text-right">Montant</th>
                                <th scope="col" className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedInvoices.map(invoice => (
                                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(invoice.id)}>
                                    {isGlobalView && <td className="px-6 py-4">{getBuildingName(invoice.buildingId)}</td>}
                                    <td className="px-6 py-4 font-medium text-gray-900">{getSupplierName(invoice.supplierId)}</td>
                                    <td className="px-6 py-4">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        {editingInvoiceId === invoice.id ? (
                                            <select
                                                value={invoice.status}
                                                onChange={(e) => {
                                                    updateInvoice({ ...invoice, status: e.target.value as InvoiceStatus });
                                                    setEditingInvoiceId(null);
                                                }}
                                                onBlur={() => setEditingInvoiceId(null)}
                                                autoFocus
                                                className="block w-full rounded-md border-gray-300 shadow-sm py-1"
                                            >
                                                {Object.values(InvoiceStatus).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <button 
                                                onClick={() => setEditingInvoiceId(invoice.id)} 
                                                className="w-full text-left p-1 -m-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                                                aria-label={`Changer le statut de la facture ${invoice.invoiceNumber}`}
                                            >
                                                <StatusBadge status={invoice.status} />
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-800">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {invoice.status !== InvoiceStatus.Paid && (
                                            <button onClick={(e) => handlePayInvoice(invoice, e)} className="font-medium text-blue-600 hover:underline">
                                                Payer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredAndSortedInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={isGlobalView ? 7 : 6} className="text-center italic text-gray-500 py-4">Aucune facture à afficher pour les filtres sélectionnés.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
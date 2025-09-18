import React, { useState } from 'react';
import type { Invoice, Supplier, Building } from '../../types';
import { InvoiceStatus } from '../../types';

interface FactureDetailViewProps {
    invoice: Invoice;
    suppliers: Supplier[];
    buildings: Building[];
    updateInvoice: (invoice: Invoice) => void;
    onBack: () => void;
}

export const FactureDetailView: React.FC<FactureDetailViewProps> = ({ invoice, suppliers, buildings, updateInvoice, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedInvoice, setEditedInvoice] = useState<Invoice>(invoice);

    const handleSave = () => {
        updateInvoice(editedInvoice);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedInvoice(invoice);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedInvoice(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };
    
    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || 'N/A';
    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'N/A';
    
    const borderColor = {
        [InvoiceStatus.Paid]: 'border-green-500',
        [InvoiceStatus.ToPay]: 'border-yellow-500',
        [InvoiceStatus.Overdue]: 'border-red-500',
    }[invoice.status];

    const renderField = (label: string, value: React.ReactNode) => (
         <div className="flex flex-col">
            <span className="font-medium text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </div>
    );
    
    const renderEditField = (label: string, name: keyof Invoice, type: string, options?: any[]) => {
        const commonProps = "mt-1 block w-full rounded-md border-gray-300 shadow-sm";
        if (type === 'select') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <select name={name} value={editedInvoice[name] as string} onChange={handleChange} className={commonProps}>
                        {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            )
        }
        return (
             <div>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input type={type} name={name} value={editedInvoice[name] as any} onChange={handleChange} className={commonProps} step={type === 'number' ? '0.01' : undefined} />
            </div>
        )
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Détail d'une facture</h2>
                    <p className="text-sm text-gray-500">Facture n°{invoice.invoiceNumber}</p>
                </div>
                <button onClick={onBack} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                    &larr; Retour aux factures
                </button>
            </div>
            
            <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${borderColor}`}>
                 <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{getSupplierName(invoice.supplierId)}</h3>
                        <p className="text-gray-600">{getBuildingName(invoice.buildingId)}</p>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                            Modifier
                        </button>
                    )}
                 </div>

                {isEditing ? (
                    <div className="space-y-4">
                        {renderEditField('Fournisseur', 'supplierId', 'select', suppliers.map(s => ({ value: s.id, label: s.name })))}
                        {renderEditField('Bâtiment', 'buildingId', 'select', buildings.map(b => ({ value: b.id, label: b.name })))}
                        <div className="grid grid-cols-2 gap-4">
                            {renderEditField('Numéro de facture', 'invoiceNumber', 'text')}
                            {renderEditField('Montant', 'amount', 'number')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {renderEditField("Date d'émission", 'issueDate', 'date')}
                            {renderEditField("Date d'échéance", 'dueDate', 'date')}
                        </div>
                        {renderEditField('Statut', 'status', 'select', Object.values(InvoiceStatus).map(s => ({ value: s, label: s })))}

                        <div className="flex justify-end space-x-2 pt-4">
                            <button onClick={handleCancel} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md">Annuler</button>
                            <button onClick={handleSave} className="bg-brand-secondary text-white py-2 px-4 rounded-md">Sauvegarder</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        {renderField('Montant', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.amount))}
                        {renderField('Statut', invoice.status)}
                        {renderField("Date d'émission", new Date(invoice.issueDate).toLocaleDateString('fr-FR'))}
                        {renderField("Date d'échéance", new Date(invoice.dueDate).toLocaleDateString('fr-FR'))}
                        {renderField('Fournisseur', getSupplierName(invoice.supplierId))}
                        {renderField('Bâtiment', getBuildingName(invoice.buildingId))}
                    </div>
                )}
            </div>
        </div>
    );
};
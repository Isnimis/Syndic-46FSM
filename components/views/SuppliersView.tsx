import React, { useState } from 'react';
import type { Supplier } from '../../types';

const Modal: React.FC<{ children: React.ReactNode, title: string, onClose: () => void }> = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    </div>
);

interface SuppliersViewProps {
    suppliers: Supplier[];
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ suppliers, addSupplier, updateSupplier, deleteSupplier }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Omit<Supplier, 'id'> | Supplier | null>(null);

    const openModal = (s: Omit<Supplier, 'id'> | Supplier | null = null) => {
        setEditingSupplier(s || { name: '', contact: '', phone: '', email: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSupplier) return;
        if ('id' in editingSupplier) {
            updateSupplier(editingSupplier);
        } else {
            addSupplier(editingSupplier);
        }
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.")) {
            deleteSupplier(id);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h2>
            
            {isModalOpen && editingSupplier && (
                <Modal title={'id' in editingSupplier ? 'Modifier Fournisseur' : 'Ajouter Fournisseur'} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-medium">Nom</label><input type="text" value={editingSupplier.name} onChange={e => setEditingSupplier({...editingSupplier, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className="block text-sm font-medium">Contact</label><input type="text" value={editingSupplier.contact} onChange={e => setEditingSupplier({...editingSupplier, contact: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                           <div><label className="block text-sm font-medium">Téléphone</label><input type="text" value={editingSupplier.phone} onChange={e => setEditingSupplier({...editingSupplier, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                        </div>
                        <div><label className="block text-sm font-medium">Email</label><input type="email" value={editingSupplier.email} onChange={e => setEditingSupplier({...editingSupplier, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                        <div className="flex justify-end space-x-2 pt-2">
                             <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md">Annuler</button>
                             <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md">Sauvegarder</button>
                        </div>
                    </form>
                </Modal>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Fournisseurs enregistrés</h3>
                    <button onClick={() => openModal()} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark transition-colors shadow-sm">
                        + Ajouter un fournisseur
                    </button>
                </div>
                <ul className="space-y-2">
                    {suppliers.map(s => (
                        <li key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium text-gray-800">{s.name}</p>
                                <p className="text-sm text-gray-500">{s.email}</p>
                            </div>
                            <div className="space-x-4">
                                <button onClick={() => openModal(s)} className="font-medium text-blue-600 hover:underline">Modifier</button>
                                <button onClick={() => handleDelete(s.id)} className="font-medium text-red-600 hover:underline">Supprimer</button>
                            </div>
                        </li>
                    ))}
                    {suppliers.length === 0 && <p className="text-sm text-gray-500 italic">Aucun fournisseur enregistré.</p>}
                </ul>
            </div>
        </div>
    );
};
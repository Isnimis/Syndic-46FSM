import React, { useState } from 'react';
import type { Building, CoOwner, View, CoOwnerLedgerEntry } from '../../types';

const CoOwnerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addCoOwner: (coOwner: Omit<CoOwner, 'id'>) => void;
    updateCoOwner: (coOwner: CoOwner) => void;
    coOwnerToEdit: Omit<CoOwner, 'id'> | CoOwner | null;
}> = ({ isOpen, onClose, addCoOwner, updateCoOwner, coOwnerToEdit }) => {
    
    const [formData, setFormData] = useState(coOwnerToEdit);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (formData) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        if ('id' in formData) {
            updateCoOwner(formData);
        } else {
            addCoOwner(formData);
        }
        onClose();
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{'id' in formData ? 'Modifier' : 'Ajouter'} un co-propriétaire</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="person">Personne Physique</option>
                            <option value="sci">SCI</option>
                        </select>
                    </div>
                    {formData.type === 'person' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Prénom</label><input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            <div><label className="block text-sm font-medium">Nom</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Raison Sociale</label><input type="text" name="companyName" value={formData.companyName || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            <div><label className="block text-sm font-medium">Représentant</label><input type="text" name="representativeName" value={formData.representativeName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium">Téléphone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Adresse postale</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">Annuler</button>
                        <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CoOwnersViewProps {
  building: Building | { id: string, name: string };
  coOwners: CoOwner[];
  coOwnerLedgerEntries: CoOwnerLedgerEntry[];
  setActiveView: (view: View) => void;
  setSelectedCoOwnerId: (id: string) => void;
  addCoOwner: (coOwner: Omit<CoOwner, 'id'>) => void;
  updateCoOwner: (coOwner: CoOwner) => void;
  deleteCoOwner: (coOwnerId: string) => void;
}

export const CoOwnersView: React.FC<CoOwnersViewProps> = ({ building, coOwners, coOwnerLedgerEntries, setActiveView, setSelectedCoOwnerId, addCoOwner, updateCoOwner, deleteCoOwner }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoOwner, setEditingCoOwner] = useState<Omit<CoOwner, 'id'> | CoOwner | null>(null);
  
  const handleViewDetails = (coOwnerId: string) => {
    setSelectedCoOwnerId(coOwnerId);
    setActiveView('co-owner-detail');
  };

  const handleOpenAddModal = () => {
    setEditingCoOwner({ type: 'person', firstName: '', lastName: '', companyName: '', representativeName: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (coOwner: CoOwner) => {
    setEditingCoOwner(coOwner);
    setIsModalOpen(true);
  };

  const getCoOwnerBalance = (coOwnerId: string) => {
    return coOwnerLedgerEntries
      .filter(entry => entry.coOwnerId === coOwnerId)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getCoOwnerName = (coOwner: CoOwner) => {
    if (coOwner.type === 'sci') {
      return coOwner.companyName;
    }
    return `${coOwner.firstName} ${coOwner.lastName}`;
  };

  return (
    <div className="space-y-6">
       {isModalOpen && (
         <CoOwnerModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            addCoOwner={addCoOwner}
            updateCoOwner={updateCoOwner}
            coOwnerToEdit={editingCoOwner}
         />
       )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Co-propriétaires - {building.name}</h2>
        <button onClick={handleOpenAddModal} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">
          + Ajouter un copropriétaire
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nom</th>
                        <th scope="col" className="px-6 py-3">Solde Financier</th>
                        <th scope="col" className="px-6 py-3">Téléphone</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {coOwners.map(coOwner => {
                        const balance = getCoOwnerBalance(coOwner.id);
                        return (
                            <tr key={coOwner.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-800">
                                  {coOwner.type === 'sci' ? (
                                    <div>
                                      <p>{coOwner.companyName}</p>
                                      {coOwner.representativeName && <p className="text-xs text-gray-500">Rep.: {coOwner.representativeName}</p>}
                                    </div>
                                  ) : `${coOwner.firstName} ${coOwner.lastName}`}
                                </td>
                                <td className={`px-6 py-4 font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(balance)}
                                </td>
                                <td className="px-6 py-4">{coOwner.phone}</td>
                                <td className="px-6 py-4">{coOwner.email}</td>
                                <td className="px-6 py-4 space-x-2">
                                  <button onClick={() => handleViewDetails(coOwner.id)} className="font-medium text-green-600 hover:underline">Détails</button>
                                  <button onClick={() => handleOpenEditModal(coOwner)} className="font-medium text-blue-600 hover:underline">Modifier</button>
                                  <button onClick={() => {
                                      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce copropriétaire ?")) {
                                        deleteCoOwner(coOwner.id);
                                      }
                                    }} className="font-medium text-red-600 hover:underline">Supprimer</button>
                                </td>
                            </tr>
                        );
                    })}
                     {coOwners.length === 0 && (
                        <tr>
                           <td colSpan={5} className="text-center italic text-gray-500 py-4">
                                Aucun co-propriétaire à afficher pour cette sélection.
                           </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
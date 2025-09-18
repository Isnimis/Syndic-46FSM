import React, { useState, useEffect } from 'react';
import type { Building, CoOwner, Lot, MillesimeLabel } from '../../types';

interface LotsViewProps {
  building: Building | { id: string; name: string };
  lots: Lot[];
  coOwners: CoOwner[];
  updateLot: (lot: Lot) => void;
  addLot: (lot: Omit<Lot, 'id'>) => void;
  deleteLot: (lotId: string) => void;
  millesimeLabels: MillesimeLabel[];
  isGlobalView: boolean;
  buildings: Building[];
}

const LotModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addLot: (lot: Omit<Lot, 'id'>) => void;
    updateLot: (lot: Lot) => void;
    lotToEdit: Lot | null;
    buildings: Building[];
    coOwners: CoOwner[];
    millesimeLabels: MillesimeLabel[];
    isGlobalView: boolean;
    initialBuildingId: string;
}> = ({ isOpen, onClose, addLot, updateLot, lotToEdit, buildings, coOwners, millesimeLabels, isGlobalView, initialBuildingId }) => {
    
    const isEditMode = !!lotToEdit;
    const [lotNumber, setLotNumber] = useState('');
    const [buildingId, setBuildingId] = useState('');
    const [coOwnerId, setCoOwnerId] = useState<string | null>(null);
    const [millesimes, setMillesimes] = useState<{[key: string]: number}>({});

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && lotToEdit) {
                setLotNumber(lotToEdit.lotNumber);
                setBuildingId(lotToEdit.buildingId);
                setCoOwnerId(lotToEdit.coOwnerId);
                setMillesimes(lotToEdit.millesimes || {});
            } else {
                setLotNumber('');
                setBuildingId(isGlobalView ? '' : initialBuildingId);
                setCoOwnerId(null);
                const initialMillesimes = millesimeLabels.reduce((acc, label) => ({...acc, [label.key]: 0}), {});
                setMillesimes(initialMillesimes);
            }
        }
    }, [isOpen, lotToEdit, isEditMode, isGlobalView, initialBuildingId, millesimeLabels]);

    const handleMillesimeChange = (key: string, value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setMillesimes(prev => ({...prev, [key]: numValue}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lotNumber || !buildingId || buildingId === 'all') {
            alert("Veuillez remplir le numéro de lot et sélectionner un bâtiment valide.");
            return;
        }

        if (isEditMode && lotToEdit) {
            updateLot({
                ...lotToEdit,
                lotNumber,
                buildingId,
                coOwnerId,
                millesimes,
            });
        } else {
            addLot({
                lotNumber,
                buildingId,
                coOwnerId,
                millesimes,
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{isEditMode ? `Modifier le lot ${lotToEdit.lotNumber}` : 'Ajouter un lot'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isGlobalView && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Bâtiment</label>
                            <select value={buildingId} onChange={e => setBuildingId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required disabled={isEditMode}>
                                <option value="" disabled>Sélectionner un bâtiment</option>
                                {buildings.filter(b => b.id !== 'b-general').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Numéro de Lot</label>
                        <input type="text" value={lotNumber} onChange={e => setLotNumber(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Co-propriétaire</label>
                        <select value={coOwnerId || ''} onChange={e => setCoOwnerId(e.target.value || null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Non attribué</option>
                            {coOwners.map(c => <option key={c.id} value={c.id}>{c.type === 'sci' ? c.companyName : `${c.firstName} ${c.lastName}`}</option>)}
                        </select>
                    </div>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Tantièmes</legend>
                        <div className="grid grid-cols-2 gap-4 mt-2 max-h-48 overflow-y-auto">
                        {millesimeLabels.map(ml => (
                            <div key={ml.key}>
                                <label className="block text-xs font-medium text-gray-600">{ml.label}</label>
                                <input
                                    type="number"
                                    value={millesimes[ml.key] || 0}
                                    onChange={e => handleMillesimeChange(ml.key, e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                        ))}
                        </div>
                    </fieldset>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">Annuler</button>
                        <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const LotsView: React.FC<LotsViewProps> = ({ building, lots, coOwners, updateLot, addLot, deleteLot, millesimeLabels, isGlobalView, buildings }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || 'Inconnu';
    const getCoOwnerName = (id: string | null) => {
        if (!id) return 'Non attribué';
        const coOwner = coOwners.find(c => c.id === id);
        if (!coOwner) return 'Inconnu';
        return coOwner.type === 'sci' ? coOwner.companyName || 'SCI sans nom' : `${coOwner.firstName || ''} ${coOwner.lastName || ''}`.trim();
    };

    const handleOpenAddModal = () => {
        setSelectedLot(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (lot: Lot) => {
        setSelectedLot(lot);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLot(null);
    };

    return (
        <div className="space-y-6">
            <LotModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addLot={addLot}
                updateLot={updateLot}
                lotToEdit={selectedLot}
                buildings={buildings}
                coOwners={coOwners}
                millesimeLabels={millesimeLabels}
                isGlobalView={isGlobalView}
                initialBuildingId={building.id}
            />
            <h2 className="text-2xl font-bold text-gray-800">Gestion des Lots - {building.name}</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Liste des lots</h3>
                    <button onClick={handleOpenAddModal} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">
                        + Ajouter un lot
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {isGlobalView && <th scope="col" className="px-6 py-3">Bâtiment</th>}
                                <th scope="col" className="px-6 py-3">Numéro de Lot</th>
                                <th scope="col" className="px-6 py-3">Co-propriétaire</th>
                                {millesimeLabels.map(ml => <th key={ml.key} scope="col" className="px-6 py-3">{ml.label}</th>)}
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lots.map(lot => (
                                <tr key={lot.id} className="bg-white border-b">
                                    {isGlobalView && <td className="px-6 py-4">{getBuildingName(lot.buildingId)}</td>}
                                    <td className="px-6 py-4 font-medium">
                                        <button onClick={() => handleOpenEditModal(lot)} className="text-blue-600 hover:underline">
                                            {lot.lotNumber}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getCoOwnerName(lot.coOwnerId)}
                                    </td>
                                    {millesimeLabels.map(ml => <td key={ml.key} className="px-6 py-4">{lot.millesimes[ml.key] || 0}</td>)}
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer le lot n°${lot.lotNumber} ?`)) {
                                                    deleteLot(lot.id);
                                                }
                                            }} 
                                            className="font-medium text-red-600 hover:underline"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {lots.length === 0 && (
                                <tr>
                                   <td colSpan={isGlobalView ? 5 + millesimeLabels.length : 4 + millesimeLabels.length} className="text-center italic text-gray-500 py-4">
                                        Aucun lot à afficher pour cette sélection.
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
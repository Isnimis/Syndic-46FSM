import React, { useState, useEffect } from 'react';
import type { Building, Document } from '../../types';

const DocumentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (doc: Omit<Document, 'id'> | Document) => void;
    documentToEdit: Omit<Document, 'id'> | Document | null;
    buildings: Building[];
    isGlobalView: boolean;
    initialBuildingId: string;
}> = ({ isOpen, onClose, onSave, documentToEdit, buildings, isGlobalView, initialBuildingId }) => {

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [buildingId, setBuildingId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (documentToEdit && 'id' in documentToEdit) {
                setName(documentToEdit.name);
                setUrl(documentToEdit.url);
                setBuildingId(documentToEdit.buildingId);
            } else {
                setName('');
                setUrl('');
                setBuildingId(isGlobalView ? '' : initialBuildingId);
            }
        }
    }, [isOpen, documentToEdit, isGlobalView, initialBuildingId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url || (isGlobalView && !buildingId) || buildingId === 'all') {
            alert("Veuillez remplir tous les champs et sélectionner un bâtiment valide.");
            return;
        }

        const finalBuildingId = isGlobalView ? buildingId : initialBuildingId;

        onSave({
            ...(documentToEdit || {}),
            name,
            url,
            buildingId: finalBuildingId,
            uploadDate: documentToEdit && 'uploadDate' in documentToEdit ? documentToEdit.uploadDate : new Date().toISOString().split('T')[0],
            fileType: 'link', // Store as link type
        });
        onClose();
    };
    
    if(!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{documentToEdit && 'id' in documentToEdit ? 'Modifier' : 'Ajouter'} un document</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     {isGlobalView && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Bâtiment</label>
                            <select value={buildingId} onChange={e => setBuildingId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                <option value="" disabled>Sélectionner un bâtiment</option>
                                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du document</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required placeholder="Ex: Facture Ascenseur - Jan 2024" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">URL du document</label>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required placeholder="https://docs.google.com/..." />
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


interface DocumentsViewProps {
  building: Building | { id: string, name: string };
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id'>) => void;
  updateDocument: (doc: Document) => void;
  deleteDocument: (docId: string) => void;
  isGlobalView: boolean;
  buildings: Building[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ building, documents, addDocument, updateDocument, deleteDocument, isGlobalView, buildings }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Omit<Document, 'id'> | Document | null>(null);

    const handleOpenAddModal = () => {
        setEditingDocument(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (doc: Document) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
    };

    const handleSave = (doc: Omit<Document, 'id'> | Document) => {
        if ('id' in doc) {
            updateDocument(doc);
        } else {
            addDocument(doc);
        }
        setIsModalOpen(false);
    };

    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || 'Inconnu';
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR');
    
    return (
        <div className="space-y-6">
            <DocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                documentToEdit={editingDocument}
                buildings={buildings}
                isGlobalView={isGlobalView}
                initialBuildingId={building.id}
            />

            <h2 className="text-2xl font-bold text-gray-800">Documents - {building.name}</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Gérer les documents</h3>
                    <button onClick={handleOpenAddModal} className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark">
                        + Ajouter un document
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nom du document</th>
                                {isGlobalView && <th scope="col" className="px-6 py-3">Bâtiment</th>}
                                <th scope="col" className="px-6 py-3">Date d'ajout</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                                    {isGlobalView && <td className="px-6 py-4">{getBuildingName(doc.buildingId)}</td>}
                                    <td className="px-6 py-4">{formatDate(doc.uploadDate)}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">Ouvrir</a>
                                        <button onClick={() => handleOpenEditModal(doc)} className="font-medium text-indigo-600 hover:underline">Modifier</button>
                                        <button onClick={() => {
                                            if(window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
                                                deleteDocument(doc.id);
                                            }
                                        }} className="font-medium text-red-600 hover:underline">Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                            {documents.length === 0 && (
                                <tr>
                                    <td colSpan={isGlobalView ? 4 : 3} className="text-center italic text-gray-500 py-4">
                                        Aucun document pour cette sélection.
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
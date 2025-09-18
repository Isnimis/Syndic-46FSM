import React, { useState, useRef } from 'react';
import type { SyndicDataState, MillesimeLabel, ChargeAccount } from '../../types';

interface SettingsViewProps extends SyndicDataState {
    loadAllData: (data: SyndicDataState) => void;
    addMillesimeLabel: (label: Omit<MillesimeLabel, 'key'>) => void;
    deleteMillesimeLabel: (key: string) => void;
    addChargeAccount: (account: Omit<ChargeAccount, 'id'>) => void;
    updateChargeAccount: (account: ChargeAccount) => void;
    deleteChargeAccount: (id: string) => void;
}

const ManageMillesimes: React.FC<{
    millesimeLabels: MillesimeLabel[];
    addMillesimeLabel: (label: Omit<MillesimeLabel, 'key'>) => void;
    deleteMillesimeLabel: (key: string) => void;
}> = ({ millesimeLabels, addMillesimeLabel, deleteMillesimeLabel }) => {
    const [newMillesimeLabel, setNewMillesimeLabel] = useState('');

    const handleAddMillesime = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMillesimeLabel.trim()) {
            addMillesimeLabel({ label: newMillesimeLabel.trim() });
            setNewMillesimeLabel('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gérer les clés de répartition (Tantièmes)</h3>
            <ul className="space-y-2 mb-4">
                {millesimeLabels.map(label => (
                    <li key={label.key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{label.label} <em className="text-gray-500 text-sm">({label.key})</em></span>
                        <button onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer la clé de répartition "${label.label}" ?`)) {
                                deleteMillesimeLabel(label.key)
                            }
                        }} className="text-red-500 hover:text-red-700 font-semibold">Supprimer</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddMillesime} className="flex space-x-2">
                <input
                    type="text"
                    value={newMillesimeLabel}
                    onChange={(e) => setNewMillesimeLabel(e.target.value)}
                    placeholder="Nouvelle clé (ex: Charges Bâtiment C)"
                    className="flex-grow rounded-md border-gray-300 shadow-sm"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Ajouter</button>
            </form>
        </div>
    );
};

const ManageChargeAccounts: React.FC<{
    chargeAccounts: ChargeAccount[];
    addChargeAccount: (account: Omit<ChargeAccount, 'id'>) => void;
    deleteChargeAccount: (id: string) => void;
}> = ({ chargeAccounts, addChargeAccount, deleteChargeAccount }) => {
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAccountName.trim()) {
            addChargeAccount({ name: newAccountName.trim(), accountNumber: newAccountNumber.trim() });
            setNewAccountName('');
            setNewAccountNumber('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gérer les comptes de charges</h3>
             <ul className="space-y-2 mb-4">
                {chargeAccounts.map(acc => (
                    <li key={acc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{acc.accountNumber} - {acc.name}</span>
                        <button onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte de charge "${acc.name}" ?`)) {
                                deleteChargeAccount(acc.id)
                            }
                        }} className="text-red-500 hover:text-red-700 font-semibold">Supprimer</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddAccount} className="flex space-x-2 items-end">
                <div className="flex-grow"><label className="text-sm">Nom du compte</label><input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="Ex: Entretien espaces verts" className="w-full rounded-md border-gray-300 shadow-sm" /></div>
                <div><label className="text-sm">N° de compte</label><input type="text" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} placeholder="Ex: 615" className="w-full rounded-md border-gray-300 shadow-sm" /></div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 self-end">Ajouter</button>
            </form>
        </div>
    );
};

const DataManagement: React.FC<{
    currentData: SyndicDataState;
    loadAllData: (data: SyndicDataState) => void;
}> = ({ currentData, loadAllData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(currentData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `syndic46fsm_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const importedData = JSON.parse(text);
                    if (window.confirm("Êtes-vous sûr de vouloir remplacer toutes les données actuelles par celles du fichier importé ? Cette action est irréversible.")) {
                         loadAllData(importedData);
                         alert("Données importées avec succès !");
                    }
                }
            } catch (error) {
                alert("Erreur lors de l'importation du fichier. Assurez-vous que le fichier est un JSON valide exporté depuis cette application.");
                console.error("Import error:", error);
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestion des données</h3>
            <div className="flex space-x-4">
                <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Exporter les données (.json)</button>
                <div>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" ref={fileInputRef} id="import-file" />
                    <label htmlFor="import-file" className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Importer des données (.json)</label>
                </div>
            </div>
             <p className="text-sm text-gray-500 mt-2">L'importation remplacera toutes les données existantes.</p>
        </div>
    );
};


export const SettingsView: React.FC<SettingsViewProps> = (props) => {
    const { millesimeLabels, addMillesimeLabel, deleteMillesimeLabel, chargeAccounts, addChargeAccount, deleteChargeAccount, loadAllData } = props;
    
    // Create a plain SyndicDataState object from props
    const currentData: SyndicDataState = {
        buildings: props.buildings,
        coOwners: props.coOwners,
        lots: props.lots,
        incidents: props.incidents,
        transactions: props.transactions,
        documents: props.documents,
        suppliers: props.suppliers,
        invoices: props.invoices,
        coOwnerLedgerEntries: props.coOwnerLedgerEntries,
        millesimeLabels: props.millesimeLabels,
        chargeAccounts: props.chargeAccounts,
        currentBudgets: props.currentBudgets,
        worksBudgets: props.worksBudgets,
        fundCalls: props.fundCalls,
    };
    
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
      
      <DataManagement currentData={currentData} loadAllData={loadAllData} />
      <ManageMillesimes millesimeLabels={millesimeLabels} addMillesimeLabel={addMillesimeLabel} deleteMillesimeLabel={deleteMillesimeLabel} />
      <ManageChargeAccounts chargeAccounts={chargeAccounts} addChargeAccount={addChargeAccount} deleteChargeAccount={deleteChargeAccount} />
    </div>
  );
};
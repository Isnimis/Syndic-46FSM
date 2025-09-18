import React, { useState, useMemo } from 'react';
import type { Building, CoOwner, Lot, CoOwnerLedgerEntry, View, MillesimeLabel } from '../../types';

interface CoOwnerDetailViewProps {
  coOwner: CoOwner;
  coOwnerLots: Lot[];
  coOwnerLedgerEntries: CoOwnerLedgerEntry[];
  buildings: Building[];
  setActiveView: (view: View) => void;
  millesimeLabels: MillesimeLabel[];
}

export const CoOwnerDetailView: React.FC<CoOwnerDetailViewProps> = ({
  coOwner,
  coOwnerLots,
  coOwnerLedgerEntries,
  buildings,
  setActiveView,
  millesimeLabels,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'info' | 'docs' | 'water'>('history');
  const [activeAccount, setActiveAccount] = useState<'charges' | 'travaux'>('charges');

  const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || 'Inconnu';

  const { accountBalance, filteredLedger } = useMemo(() => {
    const filtered = coOwnerLedgerEntries.filter(e => e.accountType === activeAccount);
    const balance = filtered.reduce((acc, entry) => acc + entry.amount, 0);
    return { accountBalance: balance, filteredLedger: filtered };
  }, [coOwnerLedgerEntries, activeAccount]);


  const renderCoOwnerName = () => {
    if (coOwner.type === 'sci') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{coOwner.companyName}</h2>
          {coOwner.representativeName && <p className="text-md text-gray-600">Représenté par : {coOwner.representativeName}</p>}
        </div>
      );
    }
    return <h2 className="text-2xl font-bold text-gray-800">{`${coOwner.firstName} ${coOwner.lastName}`}</h2>;
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'history':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex border-b">
                      <button 
                          onClick={() => setActiveAccount('charges')}
                          className={`px-4 py-2 text-sm font-medium ${activeAccount === 'charges' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          Compte Charges Générales
                      </button>
                      <button 
                          onClick={() => setActiveAccount('travaux')}
                          className={`px-4 py-2 text-sm font-medium ${activeAccount === 'travaux' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          Compte Fonds de Travaux
                      </button>
                  </div>
                  <div className="text-right">
                      <p className="text-sm text-gray-500">Solde du compte</p>
                      <p className={`text-xl font-bold ${accountBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(accountBalance)}
                      </p>
                  </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Libellé</th>
                            <th scope="col" className="px-6 py-3 text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLedger.map(entry => (
                            <tr key={entry.id} className="bg-white border-b">
                                <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{entry.description}</td>
                                <td className={`px-6 py-4 text-right font-semibold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                   {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.amount)}
                                </td>
                            </tr>
                        ))}
                        {filteredLedger.length === 0 && (
                          <tr>
                              <td colSpan={3} className="text-center italic text-gray-500 py-4">Aucune transaction pour ce compte.</td>
                          </tr>
                        )}
                    </tbody>
                </table>
              </div>
         </div>
        );
      case 'info':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Informations de contact</h3>
              <div className="space-y-2 text-sm">
                <p><strong className="font-medium text-gray-600">Email :</strong> {coOwner.email}</p>
                <p><strong className="font-medium text-gray-600">Téléphone :</strong> {coOwner.phone}</p>
                <p><strong className="font-medium text-gray-600">Adresse :</strong> {coOwner.address}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
               <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Lots détenus</h3>
               {coOwnerLots.length > 0 ? (
                   <ul className="space-y-2">
                       {coOwnerLots.map(lot => (
                           <li key={lot.id} className="p-2 bg-gray-50 rounded">
                               <p className="font-semibold">Lot n°{lot.lotNumber} ({getBuildingName(lot.buildingId)})</p>
                               <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                                   {millesimeLabels
                                       .filter(ml => lot.millesimes[ml.key] && lot.millesimes[ml.key] > 0)
                                       .map(ml => (
                                           <span key={ml.key} className="bg-gray-200 px-2 py-1 rounded-full">
                                               {ml.label}: <strong className="font-semibold">{lot.millesimes[ml.key]}</strong>
                                           </span>
                                       ))
                                   }
                               </div>
                           </li>
                       ))}
                   </ul>
               ) : (
                   <p className="text-sm text-gray-500 italic">Aucun lot associé.</p>
               )}
            </div>
          </div>
        );
      case 'docs':
        return <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-800">Documents</h3><p className="text-gray-500 mt-2">Cette section affichera les documents spécifiques à ce co-propriétaire.</p></div>
      case 'water':
        return <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-800">Consommation d'eau</h3><p className="text-gray-500 mt-2">Cette section permettra de suivre les relevés de compteur d'eau.</p></div>
      default:
        return null;
    }
  };

  const TabButton: React.FC<{
    label: string;
    view: 'history' | 'info' | 'docs' | 'water';
  }> = ({ label, view }) => (
    <button
      onClick={() => setActiveTab(view)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
        activeTab === view
          ? 'bg-white border-b-0 border-gray-200 text-brand-secondary'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        {renderCoOwnerName()}
        <button
          onClick={() => setActiveView('co-owners-list')}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          &larr; Retour à la liste
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2">
            <TabButton label="Historique de compte" view="history" />
            <TabButton label="Informations personnelles" view="info" />
            <TabButton label="Documents" view="docs" />
            <TabButton label="Consommation d’eau" view="water" />
        </nav>
      </div>

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

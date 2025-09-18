import React from 'react';
import type { Building, Incident, Transaction } from '../../types';

interface DashboardViewProps {
  building: Building | { name: string, balance: number };
  incidents: Incident[];
  transactions: Transaction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ building, incidents, transactions }) => {
  const recentIncidents = incidents.slice(0, 3);
  const recentTransactions = transactions.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de bord - {building.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Solde du compte</h3>
            <p className={`text-3xl font-bold mt-2 ${building.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(building.balance)}
            </p>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Incidents en cours</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-600">
                {incidents.filter(i => i.status === 'En cours').length}
            </p>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Nouveaux incidents</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600">
                {incidents.filter(i => i.status === 'Nouveau').length}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Incidents récents</h3>
           <ul className="space-y-3">
            {recentIncidents.map(incident => (
              <li key={incident.id} className="border-b pb-2">
                <p className="font-medium text-gray-700">{incident.description}</p>
                <span className="text-sm text-gray-500">{formatDate(incident.date)} - {incident.status}</span>
              </li>
            ))}
             {recentIncidents.length === 0 && <p className="text-sm text-gray-500 italic">Aucun incident récent.</p>}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transactions récentes</h3>
          <ul className="space-y-3">
            {recentTransactions.map(tx => (
              <li key={tx.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium text-gray-700">{tx.description}</p>
                  <span className="text-sm text-gray-500">{formatDate(tx.date)}</span>
                </div>
                <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tx.amount)}
                </span>
              </li>
            ))}
             {recentTransactions.length === 0 && <p className="text-sm text-gray-500 italic">Aucune transaction récente.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};
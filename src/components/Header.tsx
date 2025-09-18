import React from 'react';
import type { Building, User } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface HeaderProps {
  user: User;
  building: Building | { id: string; name: string; address: string; postalCode: string; city: string; };
  buildings: Building[];
  selectedBuildingId: string;
  setSelectedBuildingId: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, building, buildings, selectedBuildingId, setSelectedBuildingId }) => {
  
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Erreur de déconnexion", error));
  };

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-800 truncate" title={building.name}>{building.name}</h2>
          <p className="text-sm text-gray-500 truncate" title={building.address}>{building.address}</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="w-64">
                <select
                  id="building-select"
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 rounded-md border-gray-300 shadow-sm py-2 px-3 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                  aria-label="Sélectionner un bâtiment"
                >
                  <option value="all">Toute la copropriété</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user.email}</p>
                <button onClick={handleSignOut} className="text-xs text-red-600 hover:underline">
                    Déconnexion
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};
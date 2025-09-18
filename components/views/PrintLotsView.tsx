import React from 'react';
import type { CoOwner, Lot, Building } from '../../types';
import { exportLotsToPDF } from '../../utils/pdfExporter';

interface PrintLotsViewProps {
  coOwners: CoOwner[];
  lots: Lot[];
  buildings: Building[];
}

export const PrintLotsView: React.FC<PrintLotsViewProps> = ({ coOwners, lots, buildings }) => {
    
    const getCoOwnerName = (coOwner: CoOwner) => {
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };

    const getBuildingName = (buildingId: string) => {
        return buildings.find(b => b.id === buildingId)?.name || 'N/A';
    };

    const handleDownload = () => {
        exportLotsToPDF(coOwners, lots, buildings);
    };

    return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Liste des lots par copropriétaire</h2>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark"
                >
                    <span>📄</span>
                    Télécharger la liste (PDF)
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                {coOwners.map(coOwner => {
                    const ownerLots = lots.filter(l => l.coOwnerId === coOwner.id);
                    if (ownerLots.length === 0) return null;
                    return (
                        <div key={coOwner.id}>
                            <h3 className="font-bold text-md mb-2 bg-gray-100 p-2">{getCoOwnerName(coOwner)}</h3>
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="text-xs text-gray-800 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 border">Bâtiment</th>
                                        <th scope="col" className="px-4 py-2 border">Lot n°</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownerLots.map(lot => (
                                        <tr key={lot.id} className="bg-white border-b">
                                            <td className="px-4 py-2 border">{getBuildingName(lot.buildingId)}</td>
                                            <td className="px-4 py-2 border">{lot.lotNumber}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

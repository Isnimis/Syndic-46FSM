import React from 'react';
import type { CoOwner } from '../../types';
import { exportCoOwnersToPDF } from '../../utils/pdfExporter';

interface PrintCoOwnersViewProps {
  coOwners: CoOwner[];
}

export const PrintCoOwnersView: React.FC<PrintCoOwnersViewProps> = ({ coOwners }) => {
    
    const getCoOwnerName = (coOwner: CoOwner) => {
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };

    const handleDownload = () => {
        exportCoOwnersToPDF(coOwners);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Liste des Copropriétaires</h2>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark"
                >
                    <span>📄</span>
                    Télécharger la liste (PDF)
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-4 py-3 border">Nom</th>
                            <th scope="col" className="px-4 py-3 border">Email</th>
                            <th scope="col" className="px-4 py-3 border">Téléphone</th>
                            <th scope="col" className="px-4 py-3 border">Adresse</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coOwners.map(coOwner => (
                            <tr key={coOwner.id} className="bg-white border-b">
                                <td className="px-4 py-2 border font-medium">{getCoOwnerName(coOwner)}</td>
                                <td className="px-4 py-2 border">{coOwner.email}</td>
                                <td className="px-4 py-2 border">{coOwner.phone}</td>
                                <td className="px-4 py-2 border">{coOwner.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

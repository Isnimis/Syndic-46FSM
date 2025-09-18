import React, { useMemo } from 'react';
import type { CoOwner, Lot, MillesimeLabel } from '../../types';
import { exportMilliemesToPDF } from '../../utils/pdfExporter';


interface PrintMilliemesViewProps {
  coOwners: CoOwner[];
  lots: Lot[];
  millesimeLabels: MillesimeLabel[];
}

export const PrintMilliemesView: React.FC<PrintMilliemesViewProps> = ({ coOwners, lots, millesimeLabels }) => {
    
    const getCoOwnerName = (coOwner: CoOwner) => {
        return coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    };

    const data = useMemo(() => {
        return coOwners.map(coOwner => {
            const ownerLots = lots.filter(l => l.coOwnerId === coOwner.id);
            const totals = millesimeLabels.reduce((acc, label) => {
                acc[label.key] = ownerLots.reduce((sum, lot) => sum + (lot.millesimes[label.key] || 0), 0);
                return acc;
            }, {} as {[key: string]: number});
            return {
                ...coOwner,
                totals
            };
        });
    }, [coOwners, lots, millesimeLabels]);

    const handleDownload = () => {
        exportMilliemesToPDF(coOwners, lots, millesimeLabels);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Liste des Millièmes par Copropriétaire</h2>
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
                            <th scope="col" className="px-4 py-3 border">Copropriétaire</th>
                            {millesimeLabels.map(label => (
                                <th key={label.key} scope="col" className="px-4 py-3 border text-right">{label.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(d => (
                            <tr key={d.id} className="bg-white border-b">
                                <td className="px-4 py-2 border font-medium">{getCoOwnerName(d)}</td>
                                {millesimeLabels.map(label => (
                                    <td key={label.key} className="px-4 py-2 border text-right">{d.totals[label.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

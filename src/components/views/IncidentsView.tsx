import React, { useState } from 'react';
import type { Building, Incident, IncidentAnalysis } from '../../types';
import { IncidentStatus, IncidentPriority } from '../../types';
import { analyzeIncidentDescription } from '../../services/geminiService';

interface IncidentsViewProps {
  building: Building | { id: string, name: string };
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (incident: Incident) => void;
  isGlobalView: boolean;
  buildings: Building[];
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ building, incidents, addIncident, isGlobalView, buildings }) => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);

    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || 'Inconnu';

    const handleAnalyse = async () => {
        if (!description) return;
        setIsLoading(true);
        setAnalysis(null);
        const result = await analyzeIncidentDescription(description);
        setAnalysis(result);
        setIsLoading(false);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || isGlobalView || building.id === 'all') return;
        
        addIncident({
            buildingId: building.id,
            date: new Date().toISOString().split('T')[0],
            description: description,
            status: IncidentStatus.New,
            priority: (analysis?.priority as IncidentPriority) || IncidentPriority.Medium,
            category: analysis?.category || 'Non classé',
        });
        
        setDescription('');
        setAnalysis(null);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Incidents - {building.name}</h2>
      
      {!isGlobalView && (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Signaler un nouvel incident</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description de l'incident</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              placeholder="Ex: Fuite d'eau au plafond du 2ème étage..."
              required
            ></textarea>
          </div>
          <div className="flex justify-between items-center">
            <button type="button" onClick={handleAnalyse} disabled={isLoading || !description} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors shadow-sm disabled:bg-blue-300">
              {isLoading ? 'Analyse en cours...' : 'Analyser avec l\'IA'}
            </button>
            <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark transition-colors shadow-sm">
              Créer l'incident
            </button>
          </div>
        </form>
        {analysis && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-semibold text-blue-800">Analyse de l'IA :</h4>
                <p><strong>Priorité :</strong> {analysis.priority}</p>
                <p><strong>Catégorie :</strong> {analysis.category}</p>
                <p><strong>Actions suggérées :</strong></p>
                <ul className="list-disc list-inside text-sm text-blue-700">
                    {analysis.suggestedActions.map((action, index) => <li key={index}>{action}</li>)}
                </ul>
            </div>
        )}
      </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Liste des incidents</h3>
         <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                {isGlobalView && <th scope="col" className="px-6 py-3">Bâtiment</th>}
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Catégorie</th>
                <th scope="col" className="px-6 py-3">Priorité</th>
                <th scope="col" className="px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id} className="bg-white border-b">
                  <td className="px-6 py-4">{formatDate(incident.date)}</td>
                  {isGlobalView && <td className="px-6 py-4">{getBuildingName(incident.buildingId)}</td>}
                  <td className="px-6 py-4 font-medium text-gray-900">{incident.description}</td>
                  <td className="px-6 py-4">{incident.category}</td>
                  <td className="px-6 py-4">{incident.priority}</td>
                  <td className="px-6 py-4">{incident.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
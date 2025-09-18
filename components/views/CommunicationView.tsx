

import React, { useState } from 'react';
import type { Building } from '../../types';

interface CommunicationViewProps {
  building: Building;
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({ building }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Added a check to prevent sending communications when no specific building is selected.
    if(building.id === 'all') {
        alert("Veuillez sélectionner un bâtiment spécifique pour envoyer une communication.");
        return;
    }
    console.log(`Sending message to residents of ${building.name}:`, { subject, message });
    // This is a mock-up. In a real app, this would trigger an email/notification service.
    setIsSent(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Communication</h2>
      
      {building.id === 'all' ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            Veuillez sélectionner un bâtiment spécifique pour envoyer une communication.
        </div>
      ) : (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Envoyer une annonce aux résidents de "{building.name}"</h3>
        
        {isSent && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Succès!</strong>
            <span className="block sm:inline"> Votre message a été envoyé.</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Sujet</label>
            <input 
              type="text" 
              id="subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              required 
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea 
              id="message" 
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
              placeholder="Rédigez votre annonce ici..."
              required 
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-md hover:bg-brand-dark transition-colors shadow-sm">
              Envoyer l'annonce
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};
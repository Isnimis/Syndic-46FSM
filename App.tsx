import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import type { View } from './types';
import { useSyndicData } from './hooks/useSyndicData';

import { DashboardView } from './components/views/DashboardView';
import { FinancesView } from './components/views/FinancesView';
import { FinanceDetailView } from './components/views/FinanceDetailView';
import { IncidentsView } from './components/views/IncidentsView';
import { DocumentsView } from './components/views/DocumentsView';
import { CommunicationView } from './components/views/CommunicationView';
import { CoOwnersView } from './components/views/CoOwnersView';
import { CoOwnerDetailView } from './components/views/CoOwnerDetailView';
import { LotsView } from './components/views/LotsView';
import { SettingsView } from './components/views/SettingsView';
import { CompteursView } from './components/views/CompteursView';
import { VentesView } from './components/views/VentesView';
import { FacturesView } from './components/views/FacturesView';
import { FactureDetailView } from './components/views/FactureDetailView';
import { BudgetView } from './components/views/BudgetView';
import { AppelsDeFondView } from './components/views/AppelsDeFondView';
import { FundCallDetailView } from './components/views/FundCallDetailView';
import { AssembleesView } from './components/views/AssembleesView';
import { ClotureExerciceView } from './components/views/ClotureExerciceView';
import { SuppliersView } from './components/views/SuppliersView';
import { PrintCoOwnersView } from './components/views/PrintCoOwnersView';
import { PrintLotsView } from './components/views/PrintLotsView';
import { PrintMilliemesView } from './components/views/PrintMilliemesView';
import { PrintCoOwnerAccountView } from './components/views/PrintCoOwnerAccountView';
import { PrintFundCallsView } from './components/views/PrintFundCallsView';
import { PrintIndividualFundCallView } from './components/views/PrintIndividualFundCallView';


function App() {
  const syndicProps = useSyndicData();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedCoOwnerId, setSelectedCoOwnerId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedFundCallId, setSelectedFundCallId] = useState<string | null>(null);

  const { syndicData } = syndicProps;

  const filteredData = useMemo(() => {
    if (!syndicData) return null;
    if (selectedBuildingId === 'all') {
      return {
        ...syndicData,
        transactions: [...syndicData.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        incidents: [...syndicData.incidents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    }
    return {
      ...syndicData,
      incidents: syndicData.incidents.filter(i => i.buildingId === selectedBuildingId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      transactions: syndicData.transactions.filter(t => t.buildingId === selectedBuildingId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      documents: syndicData.documents.filter(d => d.buildingId === selectedBuildingId),
      lots: syndicData.lots.filter(l => l.buildingId === selectedBuildingId),
      currentBudgets: syndicData.currentBudgets.filter(b => b.buildingId === selectedBuildingId),
      worksBudgets: syndicData.worksBudgets.filter(b => b.buildingId === selectedBuildingId),
      invoices: syndicData.invoices.filter(i => i.buildingId === selectedBuildingId),
    };
  }, [syndicData, selectedBuildingId]);

  const selectedBuilding = useMemo(() => {
    if (!syndicData) return { id: 'all', name: 'Toute la copropriété', address: '', postalCode: '', city: '', balance: 0 };
    if (selectedBuildingId === 'all') {
       const totalBalance = syndicData.buildings.reduce((acc, b) => acc + b.balance, 0);
       return { id: 'all', name: 'Toute la copropriété', address: 'Vue générale', postalCode: '', city: '', balance: totalBalance };
    }
    return syndicData.buildings.find(b => b.id === selectedBuildingId) || { id: 'all', name: 'Toute la copropriété', address: '', postalCode: '', city: '', balance: 0 };
  }, [syndicData, selectedBuildingId]);

  if (!syndicData || !filteredData) {
    return <div>Chargement...</div>;
  }
  
  const renderActiveView = () => {
    const commonViewProps = {
      building: selectedBuilding,
      isGlobalView: selectedBuildingId === 'all',
      buildings: syndicData.buildings,
      setActiveView,
    };

    switch (activeView) {
      case 'dashboard':
        return <DashboardView building={selectedBuilding} incidents={filteredData.incidents} transactions={filteredData.transactions} />;
      case 'finances':
        return <FinancesView {...commonViewProps} transactions={filteredData.transactions} setSelectedTransactionId={setSelectedTransactionId} {...syndicProps} coOwners={syndicData.coOwners} suppliers={syndicData.suppliers} chargeAccounts={syndicData.chargeAccounts} />;
      case 'finance-detail': {
        const transaction = syndicData.transactions.find(t => t.id === selectedTransactionId);
        if (!transaction) return <div>Transaction non trouvée.</div>;
        return <FinanceDetailView transaction={transaction} coOwners={syndicData.coOwners} suppliers={syndicData.suppliers} buildings={syndicData.buildings} onBack={() => setActiveView('finances')} />;
      }
      case 'incidents':
        return <IncidentsView {...commonViewProps} incidents={filteredData.incidents} addIncident={syndicProps.addIncident} updateIncident={syndicProps.updateIncident} />;
      case 'documents':
        return <DocumentsView {...commonViewProps} documents={filteredData.documents} addDocument={syndicProps.addDocument} updateDocument={syndicProps.updateDocument} deleteDocument={syndicProps.deleteDocument} />;
      case 'communication':
        return <CommunicationView building={selectedBuilding} />;
      case 'co-owners-list':
        return <CoOwnersView {...commonViewProps} coOwners={syndicData.coOwners} coOwnerLedgerEntries={syndicData.coOwnerLedgerEntries} setSelectedCoOwnerId={setSelectedCoOwnerId} addCoOwner={syndicProps.addCoOwner} updateCoOwner={syndicProps.updateCoOwner} deleteCoOwner={syndicProps.deleteCoOwner} />;
      case 'co-owner-detail': {
          const coOwner = syndicData.coOwners.find(c => c.id === selectedCoOwnerId);
          if (!coOwner) return <div>Copropriétaire non trouvé.</div>;
          return <CoOwnerDetailView coOwner={coOwner} coOwnerLots={syndicData.lots.filter(l => l.coOwnerId === selectedCoOwnerId)} coOwnerLedgerEntries={syndicData.coOwnerLedgerEntries} buildings={syndicData.buildings} setActiveView={setActiveView} millesimeLabels={syndicData.millesimeLabels} />;
      }
      case 'lots':
          return <LotsView {...commonViewProps} lots={filteredData.lots} coOwners={syndicData.coOwners} millesimeLabels={syndicData.millesimeLabels} addLot={syndicProps.addLot} updateLot={syndicProps.updateLot} deleteLot={syndicProps.deleteLot}/>;
      case 'settings':
          return <SettingsView {...syndicData} {...syndicProps} />;
      case 'comptes': return <CompteursView />;
      case 'ventes': return <VentesView />;
      case 'finance-factures':
          return <FacturesView {...commonViewProps} invoices={filteredData.invoices} suppliers={syndicData.suppliers} addInvoice={syndicProps.addInvoice} updateInvoice={syndicProps.updateInvoice} payInvoice={syndicProps.payInvoice} setSelectedInvoiceId={setSelectedInvoiceId} />
      case 'finance-facture-detail': {
          const invoice = syndicData.invoices.find(i => i.id === selectedInvoiceId);
          if (!invoice) return <div>Facture non trouvée.</div>;
          return <FactureDetailView invoice={invoice} suppliers={syndicData.suppliers} buildings={syndicData.buildings} updateInvoice={syndicProps.updateInvoice} onBack={() => setActiveView('finance-factures')} />
      }
       case 'finance-budget':
          return <BudgetView {...commonViewProps} {...syndicProps} chargeAccounts={syndicData.chargeAccounts} millesimeLabels={syndicData.millesimeLabels} currentBudgets={filteredData.currentBudgets} worksBudgets={filteredData.worksBudgets} transactions={filteredData.transactions} suppliers={syndicData.suppliers} />;
      case 'finance-appels':
          return <AppelsDeFondView {...commonViewProps} {...syndicProps} fundCalls={syndicData.fundCalls} currentBudgets={syndicData.currentBudgets} worksBudgets={syndicData.worksBudgets} coOwners={syndicData.coOwners} lots={syndicData.lots} setSelectedFundCallId={setSelectedFundCallId} />;
      case 'finance-appel-detail': {
          const fundCall = syndicData.fundCalls.find(fc => fc.id === selectedFundCallId);
          if (!fundCall) return <div>Appel de fonds non trouvé.</div>
          return <FundCallDetailView fundCall={fundCall} {...syndicProps} currentBudgets={syndicData.currentBudgets} worksBudgets={syndicData.worksBudgets} coOwners={syndicData.coOwners} lots={syndicData.lots} onBack={() => setActiveView('finance-appels')} />;
      }
      case 'assemblees': return <AssembleesView />;
      case 'cloture': return <ClotureExerciceView />;
      case 'suppliers': return <SuppliersView suppliers={syndicData.suppliers} addSupplier={syndicProps.addSupplier} updateSupplier={syndicProps.updateSupplier} deleteSupplier={syndicProps.deleteSupplier} />;
      
      case 'print-co-owners': return <PrintCoOwnersView coOwners={syndicData.coOwners} />;
      case 'print-lots': return <PrintLotsView coOwners={syndicData.coOwners} lots={syndicData.lots} buildings={syndicData.buildings} />;
      case 'print-milliemes': return <PrintMilliemesView coOwners={syndicData.coOwners} lots={syndicData.lots} millesimeLabels={syndicData.millesimeLabels} />;
      case 'print-co-owner-account': return <PrintCoOwnerAccountView coOwners={syndicData.coOwners} coOwnerLedgerEntries={syndicData.coOwnerLedgerEntries} />;
      case 'print-fund-calls': return <PrintFundCallsView {...syndicData} />;
      case 'print-individual-fund-call': return <PrintIndividualFundCallView {...syndicData} />;

      default:
        return <div>Vue non implémentée.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header building={selectedBuilding} buildings={syndicData.buildings} selectedBuildingId={selectedBuildingId} setSelectedBuildingId={setSelectedBuildingId} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
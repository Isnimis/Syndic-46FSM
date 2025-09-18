import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SyndicDataState, Building, CoOwner, Lot, Incident, Transaction, Document, Supplier, Invoice, CoOwnerLedgerEntry, MillesimeLabel, ChargeAccount, CurrentBudget, WorksBudget, FundCall } from '../types';
import { InvoiceStatus, IncidentStatus, IncidentPriority } from '../types';

// Not creating a new file for initial data as per instructions
const initialData: SyndicDataState = {
  buildings: [
    { id: 'b-general', name: 'Toute la copro', address: 'Vue générale de la copropriété', postalCode: '75010', city: 'Paris', balance: 15230.50 },
    { id: 'b-a', name: 'BAT A', address: '46 rue FSM', postalCode: '75010', city: 'Paris', balance: 8430.25 },
    { id: 'b-b', name: 'BAT B', address: '46 rue FSM', postalCode: '75010', city: 'Paris', balance: 6800.25 },
    { id: 'b-c', name: 'BAT C', address: '46 rue FSM', postalCode: '75010', city: 'Paris', balance: 0 },
    { id: 'b-d', name: 'BAT D', address: '46 rue FSM', postalCode: '75010', city: 'Paris', balance: 0 },
    { id: 'b-e', name: 'BAT E', address: '46 rue FSM', postalCode: '75010', city: 'Paris', balance: 0 },
  ],
  coOwners: [
    { id: 'co-favede-patricia', type: 'person', firstName: 'Patricia', lastName: 'FAVEDE', email: 'patricia.favede@gmail.com', phone: '0666440083', address: '9 Rue REAUMUR, 75003 Paris' },
    { id: 'co-gundogdu-kemal', type: 'person', firstName: 'Kemal', lastName: 'GUNDOGDU', email: 'kemalgundogdu@hotmail.fr', phone: '0658562840', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-martin-vincent', type: 'person', firstName: 'Vincent', lastName: 'MARTIN', email: 'mailvmartin@aol.com', phone: '0620713770', address: "8 AV DE L'ETOILE, 94340 JOINVILLE-LE-PONT" },
    { id: 'co-sci-davido', type: 'sci', companyName: 'SCI DAVIDO', representativeName: '', email: 'ronenohana@gmail.com', phone: '', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-sci-46fsm', type: 'sci', companyName: 'SCI 46FSM', representativeName: '', email: 'ronenohana@gmail.com', phone: '33609155811', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-sci-panama', type: 'sci', companyName: 'SCI PANAMA', representativeName: '', email: 'lhimmo@yahoo.fr', phone: '0616304802', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-sci-sanovet', type: 'sci', companyName: 'SCI SANOVET', representativeName: '', email: 'sanovet75@gmail.com', phone: '0685555836', address: 'CHEZ M. OVET, 183 Bld Aristide BRIAND, 93100 MONTREUIL S/BOIS' },
    { id: 'co-slyper-jean', type: 'person', firstName: 'Jean Claude', lastName: 'SLYPER', email: 'jslyper@me.com', phone: '', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-xie-shuyong', type: 'person', firstName: 'Shuyong', lastName: 'XIE', email: 'cyg0272@gmail.com', phone: '0614998493', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-marquaille-tiphaine', type: 'person', firstName: 'Tiphaine', lastName: 'MARQUAILLE', email: 'tiphaine.marquaille@edhec.com', phone: '0669726676', address: "28 RUE D'ORLEAN, 92200 NEUILLY-SUR-SEINE" },
    { id: 'co-berna-andrea', type: 'person', firstName: 'Andrea', lastName: 'BERNA', email: 'trotro03@gmail.com', phone: '0634258016', address: '53 RUE DES VINAIGRIERS, 75010 Paris' },
    { id: 'co-postic-katell', type: 'person', firstName: 'Katell', lastName: 'POSTIC', email: 'mettezdubleu@free.fr', phone: '0142330885', address: '11 RUE MONTMARTRE, 75001 Paris' },
    { id: 'co-ravel-guillaume', type: 'sci', companyName: "RAVEL D'ESTIENNE", representativeName: '', email: 'guillaumeraveldestienne@gmail.com', phone: '0660451125', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-sayo-nicolas', type: 'person', firstName: 'Nicolas', lastName: 'SAYO', email: 'n.sayo@tbs-education.org', phone: '0662393414', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-alves-ruben', type: 'person', firstName: 'Ruben', lastName: 'ALVEZ', email: 'rubenalves09@gmail.com', phone: '33622084741', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
    { id: 'co-sci-loffice', type: 'sci', companyName: "L'OFFICE", representativeName: '', email: 'gkaragul.lcp@gmail.com', phone: '0677182288', address: '9 AV IRENE ET FREDERIC JOLIOT CURIE, 91130 ORANGIS' },
    { id: 'co-alves-antunes', type: 'person', firstName: 'Alves', lastName: 'ANTUNES', email: '', phone: '0622084741', address: '46 Rue du Fbg St MARTIN, 75010 Paris' },
  ],
  lots: [
    { id: 'l-alves-31', buildingId: 'b-b', lotNumber: '31', coOwnerId: 'co-alves-ruben', millesimes: { charges_generales: 626, chg_entretien_bat_b: 674, chg_travaux_bat_b: 507 } },
    { id: 'l-berna-16', buildingId: 'b-c', lotNumber: '16', coOwnerId: 'co-berna-andrea', millesimes: { charges_generales: 72, chg_entretien_bat_c: 85, chg_travaux_bat_c: 65 } },
    { id: 'l-favede-13', buildingId: 'b-a', lotNumber: '13', coOwnerId: 'co-favede-patricia', millesimes: { charges_generales: 405, chg_entretien_bat_a: 257, chg_travaux_bat_a: 179 } },
    { id: 'l-favede-19', buildingId: 'b-e', lotNumber: '19', coOwnerId: 'co-favede-patricia', millesimes: { charges_generales: 404, chg_entretien_bat_e: 141, chg_travaux_bat_e: 94 } },
    { id: 'l-gundogdu-24', buildingId: 'b-a', lotNumber: '24', coOwnerId: 'co-gundogdu-kemal', millesimes: { charges_generales: 165, chg_entretien_bat_a: 135, chg_travaux_bat_a: 80 } },
    { id: 'l-marquaille-32', buildingId: 'b-c', lotNumber: '32', coOwnerId: 'co-marquaille-tiphaine', millesimes: { charges_generales: 285, chg_entretien_bat_c: 336, chg_travaux_bat_c: 255 } },
    { id: 'l-martin-18', buildingId: 'b-d', lotNumber: '18', coOwnerId: 'co-martin-vincent', millesimes: { charges_generales: 107, chg_entretien_bat_d: 540, chg_travaux_bat_d: 320 } },
    { id: 'l-sayo-26', buildingId: 'b-c', lotNumber: '26', coOwnerId: 'co-sayo-nicolas', millesimes: { charges_generales: 245, chg_entretien_bat_c: 291, chg_travaux_bat_c: 220 } },
    { id: 'l-postic-17', buildingId: 'b-d', lotNumber: '17', coOwnerId: 'co-postic-katell', millesimes: { charges_generales: 91, chg_entretien_bat_d: 460, chg_travaux_bat_d: 272 } },
    { id: 'l-ravel-30', buildingId: 'b-e', lotNumber: '30', coOwnerId: 'co-ravel-guillaume', millesimes: { charges_generales: 484, chg_entretien_bat_e: 205, chg_travaux_bat_e: 121 } },
    { id: 'l-46fsm-4a', buildingId: 'b-a', lotNumber: '4A', coOwnerId: 'co-sci-46fsm', millesimes: { charges_generales: 1699, chg_entretien_bat_a: 249, chg_travaux_bat_a: 488 } },
    { id: 'l-46fsm-4b', buildingId: 'b-b', lotNumber: '4B', coOwnerId: 'co-sci-46fsm', millesimes: { charges_generales: 572, chg_travaux_bat_b: 248 } },
    { id: 'l-46fsm-4c', buildingId: 'b-c', lotNumber: '4C', coOwnerId: 'co-sci-46fsm', millesimes: { charges_generales: 556, chg_travaux_bat_c: 241 } },
    { id: 'l-46fsm-4d', buildingId: 'b-d', lotNumber: '4D', coOwnerId: 'co-sci-46fsm', millesimes: { charges_generales: 450, chg_travaux_bat_d: 195 } },
    { id: 'l-46fsm-4e', buildingId: 'b-e', lotNumber: '4E', coOwnerId: 'co-sci-46fsm', millesimes: { charges_generales: 457, chg_entretien_bat_e: 118, chg_travaux_bat_e: 79 } },
    { id: 'l-davido-2d', buildingId: 'b-d', lotNumber: '2D', coOwnerId: 'co-sci-davido', millesimes: { charges_generales: 368, chg_travaux_bat_d: 213 } },
    { id: 'l-davido-2e', buildingId: 'b-e', lotNumber: '2E', coOwnerId: 'co-sci-davido', millesimes: { charges_generales: 1013, chg_entretien_bat_e: 223, chg_travaux_bat_e: 364 } },
    { id: 'l-loffice-25', buildingId: 'b-a', lotNumber: '25', coOwnerId: 'co-sci-loffice', millesimes: { charges_generales: 107, chg_entretien_bat_a: 88, chg_travaux_bat_a: 52 } },
    { id: 'l-panama-14', buildingId: 'b-b', lotNumber: '14', coOwnerId: 'co-sci-panama', millesimes: { charges_generales: 256, chg_entretien_bat_b: 326, chg_travaux_bat_b: 245 } },
    { id: 'l-sanovet-1a', buildingId: 'b-a', lotNumber: '1A', coOwnerId: 'co-sci-sanovet', millesimes: { charges_generales: 690, chg_entretien_bat_a: 271, chg_travaux_bat_a: 201 } },
    { id: 'l-sanovet-1e', buildingId: 'b-e', lotNumber: '1E', coOwnerId: 'co-sci-sanovet', millesimes: { charges_generales: 582, chg_entretien_bat_e: 159, chg_travaux_bat_e: 239 } },
    { id: 'l-slyper-21', buildingId: 'b-e', lotNumber: '21', coOwnerId: 'co-slyper-jean', millesimes: { charges_generales: 373, chg_entretien_bat_e: 154, chg_travaux_bat_e: 103 } },
    { id: 'l-xie-15', buildingId: 'b-c', lotNumber: '15', coOwnerId: 'co-xie-shuyong', millesimes: { charges_generales: 244, chg_entretien_bat_c: 288, chg_travaux_bat_c: 219 } },
  ],
  incidents: [
    { id: 'inc-1', buildingId: 'b-a', date: '2024-08-10', description: 'Fuite ascenseur', status: IncidentStatus.InProgress, priority: IncidentPriority.High, category: 'Ascenseur' },
    { id: 'inc-2', buildingId: 'b-b', date: '2024-08-12', description: 'Ampoule grillée hall', status: IncidentStatus.New, priority: IncidentPriority.Low, category: 'Parties Communes' },
  ],
  transactions: [
    { id: 'tx-1', buildingId: 'b-a', date: '2024-08-01', description: 'Paiement charges M. Dupont', amount: 350.50, category: 'Paiement charges', coOwnerId: null },
    { id: 'tx-2', buildingId: 'b-general', date: '2024-08-05', description: 'Facture nettoyage PropreTout', amount: -250.00, category: 'Nettoyage', supplierId: 's-1', chargeAccountId: 'ca-4' },
  ],
  documents: [
    { id: 'doc-1', buildingId: 'b-general', name: 'Règlement de copropriété.pdf', url: '#', uploadDate: '2024-01-15', fileType: 'pdf' },
    { id: 'doc-2', buildingId: 'b-a', name: 'PV AG 2023.pdf', url: '#', uploadDate: '2023-06-20', fileType: 'pdf' },
  ],
  suppliers: [
    { id: 's-1', name: 'PropreTout Nettoyage', contact: 'M. Propre', phone: '0198765432', email: 'contact@propretout.fr' },
    { id: 's-2', name: 'Ascenseurs Express', contact: 'Mme Secours', phone: '0123456789', email: 'sav@ascenseurs-express.com' },
  ],
  invoices: [
    { id: 'inv-1', buildingId: 'b-general', supplierId: 's-1', invoiceNumber: 'F2024-08-123', amount: 250.00, issueDate: '2024-08-05', dueDate: '2024-09-05', status: InvoiceStatus.Paid },
    { id: 'inv-2', buildingId: 'b-a', supplierId: 's-2', invoiceNumber: 'F2024-08-456', amount: 850.00, issueDate: '2024-08-10', dueDate: '2024-09-10', status: InvoiceStatus.ToPay },
  ],
  coOwnerLedgerEntries: [],
  millesimeLabels: [
    { key: 'charges_generales', label: 'Charges Générales' },
    { key: 'chg_entretien_bat_a', label: 'Chg Entretien BAT A' },
    { key: 'chg_entretien_bat_b', label: 'Chg Entretien BAT B' },
    { key: 'chg_entretien_bat_c', label: 'Chg Entretien BAT C' },
    { key: 'chg_entretien_bat_d', label: 'Chg Entretien BAT D' },
    { key: 'chg_entretien_bat_e', label: 'Chg Entretien BAT E' },
    { key: 'chg_travaux_bat_a', label: 'Chg Travaux BAT A' },
    { key: 'chg_travaux_bat_b', label: 'Chg Travaux BAT B' },
    { key: 'chg_travaux_bat_c', label: 'Chg Travaux BAT C' },
    { key: 'chg_travaux_bat_d', label: 'Chg Travaux BAT D' },
    { key: 'chg_travaux_bat_e', label: 'Chg Travaux BAT E' },
  ],
  chargeAccounts: [
    { id: 'ca-1', name: 'Eau', accountNumber: '601' },
    { id: 'ca-2', name: 'Electricité', accountNumber: '602' },
    { id: 'ca-3', name: 'Assurance', accountNumber: '616' },
    { id: 'ca-4', name: 'Nettoyage', accountNumber: '615' },
  ],
  currentBudgets: [
    { id: 'cb-1', year: new Date().getFullYear(), buildingId: 'b-general', lines: [ { chargeAccountId: 'ca-3', budgetedAmount: 5000 }, { chargeAccountId: 'ca-4', budgetedAmount: 3000 } ] }
  ],
  worksBudgets: [
    { id: 'wb-1', title: 'Ravalement façade Bat A', buildingId: 'b-a', chargeKey: 'charges_generales', totalBudget: 25000, amountCalled: 10000, status: 'In Progress' }
  ],
  fundCalls: [
    { id: 'fc-1', title: 'Appel de fonds T3 2024', creationDate: '2024-07-01', dueDate: '2024-07-15', budgetId: 'cb-1', budgetType: 'current', totalAmount: 4500, status: 'Paid' }
  ]
};

const generateId = (prefix: string) => `${prefix}-${new Date().getTime()}-${Math.random().toString(36).substring(2, 9)}`;

export const useSyndicData = () => {
  const [syndicData, setSyndicData] = useState<SyndicDataState | null>(null);

  useEffect(() => {
    try {
      const storedData = window.localStorage.getItem('syndic46FSMData');
      if (storedData && storedData !== 'undefined' && storedData !== 'null') {
        setSyndicData(JSON.parse(storedData));
      } else {
        setSyndicData(initialData);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage, resetting to initial data.", error);
      setSyndicData(initialData);
    }
  }, []);

  useEffect(() => {
    if (syndicData) {
      try {
        window.localStorage.setItem('syndic46FSMData', JSON.stringify(syndicData));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [syndicData]);

  const setStateAndPersist = useCallback((updater: (prevState: SyndicDataState) => SyndicDataState) => {
    setSyndicData(prev => prev ? updater(prev) : null);
  }, []);
  
  const loadAllData = useCallback((importedData: SyndicDataState) => setSyndicData(importedData), []);

  // Buildings
  const addBuilding = useCallback((b: Omit<Building, 'id' | 'balance'>) => setStateAndPersist(d => ({ ...d, buildings: [...d.buildings, { ...b, id: generateId('b'), balance: 0 }] })), [setStateAndPersist]);
  const updateBuilding = useCallback((b: Building) => setStateAndPersist(d => ({ ...d, buildings: d.buildings.map(ob => ob.id === b.id ? b : ob) })), [setStateAndPersist]);
  const deleteBuilding = useCallback((id: string) => setStateAndPersist(d => ({ ...d, buildings: d.buildings.filter(b => b.id !== id) })), [setStateAndPersist]);
  
  // CoOwners
  const addCoOwner = useCallback((co: Omit<CoOwner, 'id'>) => setStateAndPersist(d => ({ ...d, coOwners: [...d.coOwners, { ...co, id: generateId('co') }] })), [setStateAndPersist]);
  const updateCoOwner = useCallback((co: CoOwner) => setStateAndPersist(d => ({ ...d, coOwners: d.coOwners.map(o => o.id === co.id ? co : o) })), [setStateAndPersist]);
  const deleteCoOwner = useCallback((id: string) => setStateAndPersist(d => ({ ...d, coOwners: d.coOwners.filter(co => co.id !== id) })), [setStateAndPersist]);
  
  // Lots
  const addLot = useCallback((l: Omit<Lot, 'id'>) => setStateAndPersist(d => ({ ...d, lots: [...d.lots, { ...l, id: generateId('l') }] })), [setStateAndPersist]);
  const updateLot = useCallback((l: Lot) => setStateAndPersist(d => ({ ...d, lots: d.lots.map(ol => ol.id === l.id ? l : ol) })), [setStateAndPersist]);
  const deleteLot = useCallback((id: string) => setStateAndPersist(d => ({ ...d, lots: d.lots.filter(l => l.id !== id) })), [setStateAndPersist]);

  // Incidents
  const addIncident = useCallback((inc: Omit<Incident, 'id'>) => setStateAndPersist(d => ({ ...d, incidents: [{ ...inc, id: generateId('inc') }, ...d.incidents] })), [setStateAndPersist]);
  const updateIncident = useCallback((inc: Incident) => setStateAndPersist(d => ({ ...d, incidents: d.incidents.map(i => i.id === inc.id ? inc : i) })), [setStateAndPersist]);

  // Transactions
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => setStateAndPersist(d => ({ ...d, transactions: [{ ...tx, id: generateId('tx') }, ...d.transactions] })), [setStateAndPersist]);
  const addTransactions = useCallback((txs: Omit<Transaction, 'id'>[]) => setStateAndPersist(d => ({ ...d, transactions: [...txs.map(tx => ({ ...tx, id: generateId('tx') })), ...d.transactions] })), [setStateAndPersist]);
  
  // Documents
  const addDocument = useCallback((doc: Omit<Document, 'id'>) => setStateAndPersist(d => ({ ...d, documents: [{ ...doc, id: generateId('doc') }, ...d.documents] })), [setStateAndPersist]);
  const updateDocument = useCallback((doc: Document) => setStateAndPersist(d => ({ ...d, documents: d.documents.map(d_ => d_.id === doc.id ? doc : d_) })), [setStateAndPersist]);
  const deleteDocument = useCallback((id: string) => setStateAndPersist(d => ({ ...d, documents: d.documents.filter(doc => doc.id !== id) })), [setStateAndPersist]);

  // Suppliers
  const addSupplier = useCallback((s: Omit<Supplier, 'id'>) => setStateAndPersist(d => ({ ...d, suppliers: [...d.suppliers, { ...s, id: generateId('s') }] })), [setStateAndPersist]);
  const updateSupplier = useCallback((s: Supplier) => setStateAndPersist(d => ({ ...d, suppliers: d.suppliers.map(os => os.id === s.id ? s : os) })), [setStateAndPersist]);
  const deleteSupplier = useCallback((id: string) => setStateAndPersist(d => ({ ...d, suppliers: d.suppliers.filter(s => s.id !== id) })), [setStateAndPersist]);

  // Invoices
  const addInvoice = useCallback((inv: Omit<Invoice, 'id'>) => setStateAndPersist(d => ({ ...d, invoices: [{ ...inv, id: generateId('inv') }, ...d.invoices] })), [setStateAndPersist]);
  const updateInvoice = useCallback((inv: Invoice) => setStateAndPersist(d => ({ ...d, invoices: d.invoices.map(i => i.id === inv.id ? inv : i) })), [setStateAndPersist]);
  const payInvoice = useCallback((inv: Invoice) => setStateAndPersist(d => {
    const supplierName = d.suppliers.find(s => s.id === inv.supplierId)?.name || 'N/A';
    const newTx: Omit<Transaction, 'id'> = { buildingId: inv.buildingId, date: new Date().toISOString().split('T')[0], description: `Paiement facture ${inv.invoiceNumber} - ${supplierName}`, amount: -Math.abs(inv.amount), category: 'Paiement Fournisseur', supplierId: inv.supplierId, invoiceId: inv.id };
    return { ...d, invoices: d.invoices.map(i => i.id === inv.id ? { ...i, status: InvoiceStatus.Paid } : i), transactions: [{ ...newTx, id: generateId('tx') }, ...d.transactions] };
  }), [setStateAndPersist]);

  // Millesime Labels
  const addMillesimeLabel = useCallback((l: Omit<MillesimeLabel, 'key'>) => setStateAndPersist(d => ({ ...d, millesimeLabels: [...d.millesimeLabels, { ...l, key: l.label.toLowerCase().replace(/\\s/g, '_') }] })), [setStateAndPersist]);
  const deleteMillesimeLabel = useCallback((key: string) => setStateAndPersist(d => ({ ...d, millesimeLabels: d.millesimeLabels.filter(l => l.key !== key) })), [setStateAndPersist]);

  // Charge Accounts
  const addChargeAccount = useCallback((ca: Omit<ChargeAccount, 'id'>) => setStateAndPersist(d => ({ ...d, chargeAccounts: [...d.chargeAccounts, { ...ca, id: generateId('ca') }] })), [setStateAndPersist]);
  const updateChargeAccount = useCallback((ca: ChargeAccount) => setStateAndPersist(d => ({ ...d, chargeAccounts: d.chargeAccounts.map(o => o.id === ca.id ? ca : o) })), [setStateAndPersist]);
  const deleteChargeAccount = useCallback((id: string) => setStateAndPersist(d => ({ ...d, chargeAccounts: d.chargeAccounts.filter(ca => ca.id !== id) })), [setStateAndPersist]);

  // Budgets
  const addCurrentBudget = useCallback((b: Omit<CurrentBudget, 'id'>) => setStateAndPersist(d => ({...d, currentBudgets: [...d.currentBudgets, {...b, id: generateId('cb')}]})), [setStateAndPersist]);
  const updateCurrentBudget = useCallback((b: CurrentBudget) => setStateAndPersist(d => ({...d, currentBudgets: d.currentBudgets.map(ob => ob.id === b.id ? b : ob)})), [setStateAndPersist]);
  const addWorksBudget = useCallback((b: Omit<WorksBudget, 'id'>) => setStateAndPersist(d => ({...d, worksBudgets: [...d.worksBudgets, {...b, id: generateId('wb')}]})), [setStateAndPersist]);
  const updateWorksBudget = useCallback((b: WorksBudget) => setStateAndPersist(d => ({...d, worksBudgets: d.worksBudgets.map(ob => ob.id === b.id ? b : ob)})), [setStateAndPersist]);

  // Fund Calls
  const createFundCall = useCallback((call: Omit<FundCall, 'id'|'status'>, entries: Omit<CoOwnerLedgerEntry, 'id'>[]) => {
      setStateAndPersist(d => {
          const newCall = {...call, id: generateId('fc'), status: 'Sent'} as FundCall;
          const newEntries = entries.map(e => ({...e, id: generateId('le')}));
          
          let updatedWorksBudgets = d.worksBudgets;
          if(newCall.budgetType === 'works') {
              updatedWorksBudgets = d.worksBudgets.map(wb => {
                  if (wb.id === newCall.budgetId) {
                      return {...wb, amountCalled: wb.amountCalled + newCall.totalAmount };
                  }
                  return wb;
              });
          }

          return {
              ...d,
              fundCalls: [newCall, ...d.fundCalls],
              coOwnerLedgerEntries: [...d.coOwnerLedgerEntries, ...newEntries],
              worksBudgets: updatedWorksBudgets
          };
      });
  }, [setStateAndPersist]);
  const updateFundCall = useCallback((fc: FundCall) => setStateAndPersist(d => ({...d, fundCalls: d.fundCalls.map(ofc => ofc.id === fc.id ? fc : ofc)})), [setStateAndPersist]);

  return useMemo(() => ({
    syndicData,
    loadAllData,
    addBuilding, updateBuilding, deleteBuilding,
    addCoOwner, updateCoOwner, deleteCoOwner,
    addLot, updateLot, deleteLot,
    addIncident, updateIncident,
    addTransaction, addTransactions,
    addDocument, updateDocument, deleteDocument,
    addSupplier, updateSupplier, deleteSupplier,
    addInvoice, updateInvoice, payInvoice,
    addMillesimeLabel, deleteMillesimeLabel,
    addChargeAccount, updateChargeAccount, deleteChargeAccount,
    addCurrentBudget, updateCurrentBudget,
    addWorksBudget, updateWorksBudget,
    createFundCall, updateFundCall
  }), [syndicData, loadAllData, addBuilding, updateBuilding, deleteBuilding, addCoOwner, updateCoOwner, deleteCoOwner, addLot, updateLot, deleteLot, addIncident, updateIncident, addTransaction, addTransactions, addDocument, updateDocument, deleteDocument, addSupplier, updateSupplier, deleteSupplier, addInvoice, updateInvoice, payInvoice, addMillesimeLabel, deleteMillesimeLabel, addChargeAccount, updateChargeAccount, deleteChargeAccount, addCurrentBudget, updateCurrentBudget, addWorksBudget, updateWorksBudget, createFundCall, updateFundCall]);
};
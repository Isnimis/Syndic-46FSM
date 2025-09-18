import type { User as FirebaseUser } from 'firebase/auth';

export type User = FirebaseUser;

export type View =
  'dashboard' | 'finances' | 'finance-detail' | 'finance-factures' | 'finance-facture-detail' |
  'finance-appels' | 'finance-appel-detail' | 'finance-budget' | 'incidents' | 'documents' |
  'communication' | 'co-owners-list' | 'co-owner-detail' | 'lots' | 'settings' |
  'comptes' | 'ventes' | 'assemblees' | 'cloture' | 'print-co-owners' | 'print-lots' |
  'print-milliemes' | 'print-co-owner-account' | 'print-fund-calls' | 'print-individual-fund-call' |
  'suppliers';

export interface Building {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  balance: number;
}

export interface CoOwner {
  id: string;
  type: 'person' | 'sci';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  representativeName?: string;
  email: string;
  phone: string;
  address: string;
}

export interface Lot {
  id: string;
  buildingId: string;
  lotNumber: string;
  coOwnerId: string | null;
  millesimes: { [key: string]: number };
}

export enum IncidentStatus {
  New = 'Nouveau',
  InProgress = 'En cours',
  Resolved = 'Résolu',
}

export enum IncidentPriority {
  Low = 'Basse',
  Medium = 'Moyenne',
  High = 'Haute',
}

export interface Incident {
  id: string;
  buildingId: string;
  date: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  category: string;
}

export interface Transaction {
  id: string;
  buildingId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  coOwnerId?: string | null;
  supplierId?: string | null;
  chargeAccountId?: string;
  invoiceId?: string;
  worksBudgetId?: string;
}

export interface Document {
  id: string;
  buildingId: string;
  name: string;
  url: string;
  uploadDate: string;
  fileType: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
}

export enum InvoiceStatus {
  ToPay = 'À Payer',
  Paid = 'Payée',
  Overdue = 'En Retard',
}

export interface Invoice {
  id: string;
  buildingId: string;
  supplierId: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export interface CoOwnerLedgerEntry {
  id: string;
  coOwnerId: string;
  date: string;
  description: string;
  amount: number;
  accountType: 'charges' | 'travaux';
}

export interface MillesimeLabel {
  key: string;
  label: string;
}

export interface ChargeAccount {
  id: string;
  name: string;
  accountNumber?: string;
}

export interface BudgetLine {
  chargeAccountId: string;
  budgetedAmount: number;
}

export interface CurrentBudget {
  id: string;
  year: number;
  buildingId: string;
  lines: BudgetLine[];
}

export interface WorksBudget {
  id: string;
  title: string;
  buildingId: string;
  chargeKey: string;
  totalBudget: number;
  amountCalled: number;
  status: string;
}

export interface FundCall {
  id: string;
  title: string;
  creationDate: string;
  dueDate: string;
  budgetId: string;
  budgetType: 'current' | 'works';
  totalAmount: number;
  status: 'Sent' | 'Partially Paid' | 'Paid';
}

export interface SyndicDataState {
  buildings: Building[];
  coOwners: CoOwner[];
  lots: Lot[];
  incidents: Incident[];
  transactions: Transaction[];
  documents: Document[];
  suppliers: Supplier[];
  invoices: Invoice[];
  coOwnerLedgerEntries: CoOwnerLedgerEntry[];
  millesimeLabels: MillesimeLabel[];
  chargeAccounts: ChargeAccount[];
  currentBudgets: CurrentBudget[];
  worksBudgets: WorksBudget[];
  fundCalls: FundCall[];
}

export interface IncidentAnalysis {
  priority: string;
  category: string;
  suggestedActions: string[];
}
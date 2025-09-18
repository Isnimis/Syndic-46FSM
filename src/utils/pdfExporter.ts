import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { CoOwner, Lot, Building, MillesimeLabel, CoOwnerLedgerEntry, FundCall, CurrentBudget, WorksBudget } from '../types';

// Helper to format currency
const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

// Co-Owners list export
export const exportCoOwnersToPDF = (coOwners: CoOwner[]) => {
  const doc = new jsPDF();
  doc.text("Liste des Copropriétaires", 14, 16);
  
  const tableColumn = ["Nom", "Email", "Téléphone", "Adresse"];
  const tableRows: (string | undefined)[][] = [];

  coOwners.forEach(coOwner => {
    const coOwnerData = [
      coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`,
      coOwner.email,
      coOwner.phone,
      coOwner.address,
    ];
    tableRows.push(coOwnerData);
  });

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });
  doc.save('liste_coproprietaires.pdf');
};

// Lots list export
export const exportLotsToPDF = (coOwners: CoOwner[], lots: Lot[], buildings: Building[]) => {
    const doc = new jsPDF();
    doc.text("Liste des lots par copropriétaire", 14, 16);
    let startY = 20;

    const getBuildingName = (buildingId: string) => buildings.find(b => b.id === buildingId)?.name || 'N/A';

    coOwners.forEach(coOwner => {
        const ownerLots = lots.filter(l => l.coOwnerId === coOwner.id);
        if (ownerLots.length > 0) {
            const coOwnerName = coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
            
            if (startY > 20) startY += 5;
            if (startY > 250) { doc.addPage(); startY = 20; }
            
            doc.setFont('helvetica', 'bold');
            doc.text(coOwnerName || 'N/A', 14, startY);
            doc.setFont('helvetica', 'normal');
            startY += 6;

            const tableColumn = ["Bâtiment", "Lot n°"];
            const tableRows: string[][] = [];

            ownerLots.forEach(lot => {
                tableRows.push([
                    getBuildingName(lot.buildingId),
                    lot.lotNumber,
                ]);
            });

            (doc as any).autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: startY,
            });

            startY = (doc as any).lastAutoTable.finalY + 10;
        }
    });

    doc.save('liste_lots.pdf');
};

// Milliemes list export
export const exportMilliemesToPDF = (coOwners: CoOwner[], lots: Lot[], millesimeLabels: MillesimeLabel[]) => {
    const doc = new jsPDF();
    doc.text("Répartition des Millièmes par Copropriétaire", 14, 16);

    const tableColumn = ["Copropriétaire", ...millesimeLabels.map(l => l.label)];
    const tableRows: (string | number)[][] = [];

    coOwners.forEach(coOwner => {
        const ownerLots = lots.filter(l => l.coOwnerId === coOwner.id);
        const totals = millesimeLabels.reduce((acc, label) => {
            acc[label.key] = ownerLots.reduce((sum, lot) => sum + (lot.millesimes[label.key] || 0), 0);
            return acc;
        }, {} as {[key: string]: number});
        
        const coOwnerData = [
            coOwner.type === 'sci' ? coOwner.companyName || '' : `${coOwner.firstName} ${coOwner.lastName}`,
            ...millesimeLabels.map(l => totals[l.key])
        ];
        tableRows.push(coOwnerData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        headStyles: { halign: 'center' },
        columnStyles: { 0: { halign: 'left' } }
    });
    doc.save('repartition_milliemes.pdf');
};

// Co-owner account statement export
export const exportCoOwnerAccountToPDF = (coOwner: CoOwner, ledgerEntries: CoOwnerLedgerEntry[], accountType: 'charges' | 'travaux') => {
    const doc = new jsPDF();
    const coOwnerName = coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;
    const accountName = accountType === 'charges' ? 'Charges Générales' : 'Fonds de Travaux';
    
    doc.text(`Relevé de compte - ${coOwnerName}`, 14, 16);
    doc.setFontSize(12);
    doc.text(`Compte: ${accountName}`, 14, 22);

    const tableColumn = ["Date", "Libellé", "Débit", "Crédit"];
    const tableRows: (string | number)[][] = [];

    let balance = 0;
    let totalDebit = 0;
    let totalCredit = 0;
    
    ledgerEntries.forEach(entry => {
        balance += entry.amount;
        const debit = entry.amount < 0 ? formatCurrency(Math.abs(entry.amount)) : '';
        const credit = entry.amount > 0 ? formatCurrency(entry.amount) : '';
        if (entry.amount < 0) totalDebit += Math.abs(entry.amount);
        if (entry.amount > 0) totalCredit += entry.amount;

        tableRows.push([
            new Date(entry.date).toLocaleDateString('fr-FR'),
            entry.description,
            debit,
            credit,
        ]);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        didDrawPage: (data: any) => {
            doc.setFontSize(10);
            doc.text(`Page ${doc.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Débit: ${formatCurrency(totalDebit)}`, 14, finalY);
    doc.text(`Total Crédit: ${formatCurrency(totalCredit)}`, 100, finalY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Solde du compte: ${formatCurrency(balance)}`, 14, finalY + 8);
    
    doc.save(`releve_${coOwner.id}_${accountType}.pdf`);
};

// Fund call summary export
export const exportFundCallSummaryToPDF = (fundCall: FundCall, distribution: {coOwner: CoOwner, amount: number}[]) => {
    const doc = new jsPDF();
    doc.text(`Synthèse Appel de Fonds: ${fundCall.title}`, 14, 16);
    doc.setFontSize(12);
    doc.text(`Montant total: ${formatCurrency(fundCall.totalAmount)}`, 14, 22);
    doc.text(`Date d'échéance: ${new Date(fundCall.dueDate).toLocaleDateString('fr-FR')}`, 14, 28);
    
    const tableColumn = ["Copropriétaire", "Montant à payer"];
    const tableRows: (string | number)[][] = [];

    distribution.forEach(item => {
        const coOwnerName = item.coOwner.type === 'sci' ? item.coOwner.companyName : `${item.coOwner.firstName} ${item.coOwner.lastName}`;
        tableRows.push([
            coOwnerName || 'N/A',
            formatCurrency(item.amount)
        ]);
    });
    
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
    });
    
    doc.save(`synthese_appel_${fundCall.id}.pdf`);
};


// Individual fund calls export
export const exportIndividualFundCallsToPDF = (fundCall: FundCall, distribution: any[], budget: any, millesimeLabels: MillesimeLabel[]) => {
    const doc = new jsPDF();

    distribution.forEach((item, index) => {
        if (index > 0) doc.addPage();
        
        const coOwner = item.coOwner;
        const coOwnerName = coOwner.type === 'sci' ? coOwner.companyName : `${coOwner.firstName} ${coOwner.lastName}`;

        doc.setFontSize(18);
        doc.text("Appel de Fonds", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(coOwnerName || '', 14, 40);
        doc.text(coOwner.address, 14, 45);
        
        doc.text(`Date : ${new Date(fundCall.creationDate).toLocaleDateString('fr-FR')}`, 190, 40, { align: 'right' });
        doc.text(`Échéance : ${new Date(fundCall.dueDate).toLocaleDateString('fr-FR')}`, 190, 45, { align: 'right' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(fundCall.title, 14, 60);
        doc.setFont('helvetica', 'normal');

        const chargeKey = budget.type === 'works' ? budget.chargeKey : 'charges_generales';
        const millesimeLabel = millesimeLabels.find(ml => ml.key === chargeKey)?.label;
        const head = [["Lot", "Bâtiment", `Tantièmes (${millesimeLabel})`]];
        const body = item.lotsDetails.map((lot: any) => [lot.lotNumber, lot.buildingName, lot.millesimes]);
        body.push([{ content: 'Total tantièmes', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, { content: item.ownerMillesimes, styles: { halign: 'right', fontStyle: 'bold' } }]);
        
        (doc as any).autoTable({
            head: head,
            body: body,
            startY: 70
        });
        
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Montant à régler :", 14, finalY);
        doc.text(formatCurrency(item.amount), 190, finalY, { align: 'right' });
    });
    
    doc.save(`appel_individuel_${fundCall.id}.pdf`);
};

// Cloture export
export const exportClotureToPDF = (data: any) => {
    const doc = new jsPDF();
    doc.text(`Cloture d'exercice ${data.year}`, 14, 16);
    doc.setFontSize(10);
    doc.text("Ce document est une version simplifiée de la clôture.", 14, 22);
    doc.text("La génération complète des annexes est complexe et non implémentée ici.", 14, 30);
    doc.save(`cloture_${data.year}.pdf`);
};
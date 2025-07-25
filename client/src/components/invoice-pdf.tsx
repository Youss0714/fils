import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";

interface InvoicePDFProps {
  invoice: any; // Full invoice with items and client
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const formatCurrency = (amount: string | number) => {
    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{"currency":"XOF"}');
    const currency = userSettings.currency || 'XOF';
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (currency === 'XOF') {
      return `${numAmount.toLocaleString('fr-FR')} F CFA`;
    } else if (currency === 'GHS') {
      return `GHS ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(numAmount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // Dynamically import jsPDF and html2canvas to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Get the invoice content element
      const element = document.querySelector('.invoice-content') as HTMLElement;
      if (!element) {
        alert("Erreur: Contenu de la facture non trouvé");
        return;
      }

      // Hide print buttons temporarily
      const printButtons = document.querySelectorAll('.print\\:hidden');
      printButtons.forEach(btn => (btn as HTMLElement).style.display = 'none');
      
      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });
      
      // Show print buttons again
      printButtons.forEach(btn => (btn as HTMLElement).style.display = '');
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      pdf.save(`Facture_${invoice.number}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mb-6 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        <Button onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <Card className="print:shadow-none print:border-none invoice-content">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">FACTURE</h1>
              <p className="text-lg text-gray-600">{invoice.number}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-2">GestionPro</div>
              <div className="text-sm text-gray-600">
                <p>123 Rue de la Technologie</p>
                <p>75001 Paris, France</p>
                <p>SIRET: 12345678901234</p>
                <p>TVA: FR12345678901</p>
              </div>
            </div>
          </div>

          {/* Invoice Info and Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Facturé à :</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.client?.name}</p>
                {invoice.client?.company && <p>{invoice.client.company}</p>}
                {invoice.client?.email && <p>{invoice.client.email}</p>}
                {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                {invoice.client?.address && (
                  <p className="whitespace-pre-line">{invoice.client.address}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Détails de la facture :</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Date d'émission :</span>
                  <span>{invoice.createdAt && formatDate(invoice.createdAt)}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span>Date d'échéance :</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Statut :</span>
                  <span className={`font-medium ${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {invoice.status === 'paid' ? 'Payée' :
                     invoice.status === 'pending' ? 'En attente' :
                     'En retard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Articles</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-900">
                      Quantité
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                      Prix unitaire
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">
                        {item.productName}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                        {formatCurrency(item.priceHT)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.totalHT)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Sous-total :</span>
                <span>{formatCurrency(invoice.totalHT)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>TVA ({invoice.tvaRate}%) :</span>
                <span>{formatCurrency(invoice.totalTVA)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total :</span>
                <span>{formatCurrency(invoice.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Notes :</h3>
              <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <Separator className="mb-6" />
          <div className="text-center text-sm text-gray-500">
            <p>Merci pour votre confiance !</p>
            <p className="mt-2">
              Pour toute question concernant cette facture, contactez-nous à contact@gestionpro.fr
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

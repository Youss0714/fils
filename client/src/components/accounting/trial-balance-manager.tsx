import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, FileText, Calculator, Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { TrialBalance, ChartOfAccounts } from "@shared/schema";

interface TrialBalanceWithAccount extends TrialBalance {
  account: ChartOfAccounts;
}

export function TrialBalanceManager() {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<{start: string, end: string} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get trial balance data
  const { data: trialBalanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["/api/accounting/trial-balance", selectedPeriod],
    enabled: !!selectedPeriod,
    queryFn: () => selectedPeriod ? 
      fetch(`/api/accounting/trial-balance?periodStart=${selectedPeriod.start}&periodEnd=${selectedPeriod.end}`)
        .then(res => res.json()) : null
  });

  // Get chart of accounts for context
  const { data: chartOfAccounts } = useQuery({
    queryKey: ["/api/accounting/chart-of-accounts"],
  });

  // Generate trial balance mutation
  const generateTrialBalanceMutation = useMutation({
    mutationFn: (data: { periodStart: string; periodEnd: string }) =>
      apiRequest("POST", "/api/accounting/trial-balance/generate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/trial-balance"] });
      toast({
        title: "Balance générée",
        description: "La balance de vérification a été générée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de la génération de la balance",
      });
    },
  });

  const handleGenerateBalance = () => {
    if (!periodStart || !periodEnd) {
      toast({
        variant: "destructive",
        title: "Dates requises",
        description: "Veuillez sélectionner les dates de début et de fin.",
      });
      return;
    }

    setSelectedPeriod({ start: periodStart, end: periodEnd });
    generateTrialBalanceMutation.mutate({ periodStart, periodEnd });
  };

  const handleViewBalance = () => {
    if (!periodStart || !periodEnd) {
      toast({
        variant: "destructive",
        title: "Dates requises",
        description: "Veuillez sélectionner les dates de début et de fin.",
      });
      return;
    }

    setSelectedPeriod({ start: periodStart, end: periodEnd });
  };

  // Calculate totals
  const calculateTotals = (balanceData: TrialBalanceWithAccount[]) => {
    return balanceData.reduce(
      (totals, item) => ({
        debitTotal: totals.debitTotal + parseFloat(item.debitTotal || "0"),
        creditTotal: totals.creditTotal + parseFloat(item.creditTotal || "0"),
        openingBalance: totals.openingBalance + parseFloat(item.openingBalance || "0"),
        closingBalance: totals.closingBalance + parseFloat(item.closingBalance || "0"),
      }),
      { debitTotal: 0, creditTotal: 0, openingBalance: 0, closingBalance: 0 }
    );
  };

  // Print function
  const handlePrint = () => {
    if (!trialBalanceData || !selectedPeriod) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totals = calculateTotals(trialBalanceData);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Balance de Vérification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .period { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .number { text-align: right; }
            .total-row { background-color: #f0f9ff; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Balance de Vérification</h1>
          </div>
          <div class="period">
            Période: ${format(new Date(selectedPeriod.start), 'dd MMMM yyyy', { locale: fr })} - ${format(new Date(selectedPeriod.end), 'dd MMMM yyyy', { locale: fr })}
          </div>
          <table>
            <thead>
              <tr>
                <th>Code Compte</th>
                <th>Nom du Compte</th>
                <th>Type</th>
                <th class="number">Solde d'Ouverture</th>
                <th class="number">Débit Total</th>
                <th class="number">Crédit Total</th>
                <th class="number">Solde de Clôture</th>
              </tr>
            </thead>
            <tbody>
              ${trialBalanceData.map((item: any) => `
                <tr>
                  <td>${item.account?.accountCode || 'N/A'}</td>
                  <td>${item.account?.accountName || 'Compte inconnu'}</td>
                  <td>${item.account?.accountType || 'N/A'}</td>
                  <td class="number">${parseFloat(item.openingBalance || '0').toLocaleString('fr-FR')} FCFA</td>
                  <td class="number">${parseFloat(item.debitTotal || '0').toLocaleString('fr-FR')} FCFA</td>
                  <td class="number">${parseFloat(item.creditTotal || '0').toLocaleString('fr-FR')} FCFA</td>
                  <td class="number">${parseFloat(item.closingBalance || '0').toLocaleString('fr-FR')} FCFA</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>TOTAUX</strong></td>
                <td class="number"><strong>${totals.openingBalance.toLocaleString('fr-FR')} FCFA</strong></td>
                <td class="number"><strong>${totals.debitTotal.toLocaleString('fr-FR')} FCFA</strong></td>
                <td class="number"><strong>${totals.creditTotal.toLocaleString('fr-FR')} FCFA</strong></td>
                <td class="number"><strong>${totals.closingBalance.toLocaleString('fr-FR')} FCFA</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>Balance de vérification générée le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sélection de la Période
          </CardTitle>
          <CardDescription>
            Sélectionnez la période pour générer ou consulter la balance de vérification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Date de début</Label>
              <Input
                id="periodStart"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Date de fin</Label>
              <Input
                id="periodEnd"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateBalance}
              disabled={generateTrialBalanceMutation.isPending}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {generateTrialBalanceMutation.isPending ? "Génération..." : "Générer Balance"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleViewBalance}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Consulter Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trial Balance Results */}
      {trialBalanceData && selectedPeriod && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Balance de Vérification
                </CardTitle>
                <CardDescription>
                  Période: {format(new Date(selectedPeriod.start), 'dd MMMM yyyy', { locale: fr })} - {format(new Date(selectedPeriod.end), 'dd MMMM yyyy', { locale: fr })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : trialBalanceData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune donnée disponible pour cette période
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code Compte</TableHead>
                        <TableHead>Nom du Compte</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Solde d'Ouverture</TableHead>
                        <TableHead className="text-right">Débit Total</TableHead>
                        <TableHead className="text-right">Crédit Total</TableHead>
                        <TableHead className="text-right">Solde de Clôture</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalanceData.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">
                            {item.account?.accountCode || 'N/A'}
                          </TableCell>
                          <TableCell>{item.account?.accountName || 'Compte inconnu'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.account?.accountType || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(item.openingBalance || "0").toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(item.debitTotal || "0").toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(item.creditTotal || "0").toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(item.closingBalance || "0").toLocaleString('fr-FR')} FCFA
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Résumé des Totaux</h4>
                  {(() => {
                    const totals = calculateTotals(trialBalanceData);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {totals.debitTotal.toLocaleString('fr-FR')}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Débit FCFA</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {totals.creditTotal.toLocaleString('fr-FR')}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Crédit FCFA</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.abs(totals.debitTotal - totals.creditTotal).toLocaleString('fr-FR')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Différence {totals.debitTotal === totals.creditTotal ? "(Équilibrée)" : "(Déséquilibrée)"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${totals.debitTotal === totals.creditTotal ? 'text-green-600' : 'text-red-600'}`}>
                            {totals.debitTotal === totals.creditTotal ? '✓ Équilibrée' : '⚠ Déséquilibrée'}
                          </div>
                          <div className="text-sm text-muted-foreground">État de la Balance</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
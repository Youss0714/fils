import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, FileText, Download, Trash2, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation, formatPrice } from "@/lib/i18n";
import { useSettings } from "@/hooks/useSettings";
import { 
  insertAccountingReportSchema,
  REPORT_TYPES,
  type InsertAccountingReport 
} from "@shared/schema";

export function ReportsManager() {
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/accounting/reports"],
  });

  const { data: stats } = useQuery<{
    totalExpenses: number;
    totalRevenues: number;
    netResult: number;
    monthlyRevenues: number;
    monthlyExpensesByCategory: Array<{category: string; amount: number}>;
  }>({
    queryKey: ["/api/accounting/stats"],
  });

  // Form
  const reportForm = useForm({
    defaultValues: {
      name: "",
      type: "expense_summary",
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
    },
  });

  // Mutations
  const createReportMutation = useMutation({
    mutationFn: (data: any) => {
      // Generate report data based on type and period
      const reportData = generateReportData(data.type, data.periodStart, data.periodEnd);
      
      return apiRequest("POST", "/api/accounting/reports", {
        ...data,
        data: reportData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/reports"] });
      setIsReportDialogOpen(false);
      reportForm.reset();
      toast({ title: "Rapport généré avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la génération du rapport",
        variant: "destructive" 
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/accounting/reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/reports"] });
      toast({ title: "Rapport supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive" 
      });
    },
  });

  const generateReportData = (type: string, periodStart: string, periodEnd: string) => {
    // This would normally use actual data from the queries
    // For now, we'll use the stats data and create a basic report structure
    switch (type) {
      case 'expense_summary':
        return {
          summary: {
            totalExpenses: (stats as any)?.totalExpenses || 0,
            pendingExpenses: (stats as any)?.pendingExpenses || 0,
            approvedExpenses: (stats as any)?.approvedExpenses || 0,
          },
          expensesByCategory: (stats as any)?.monthlyExpensesByCategory || [],
          period: { start: periodStart, end: periodEnd },
        };
      case 'imprest_summary':
        return {
          summary: {
            totalFunds: stats?.totalImprestFunds || 0,
            activeFunds: stats?.activeImprestFunds || 0,
          },
          period: { start: periodStart, end: periodEnd },
        };
      case 'monthly_report':
        return {
          expenses: {
            total: stats?.totalExpenses || 0,
            byCategory: stats?.monthlyExpensesByCategory || [],
          },
          imprest: {
            totalFunds: stats?.totalImprestFunds || 0,
            activeFunds: stats?.activeImprestFunds || 0,
          },
          period: { start: periodStart, end: periodEnd },
        };
      default:
        return {
          period: { start: periodStart, end: periodEnd },
          generated: new Date().toISOString(),
        };
    }
  };

  const handleCreateReport = (data: InsertAccountingReport) => {
    createReportMutation.mutate(data);
  };

  const downloadReport = (report: any) => {
    // Generate and download report as JSON for now
    // In a real app, this would generate PDF or Excel files
    const blob = new Blob([JSON.stringify(report.data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résultat Net Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Résultat Net de l'Entreprise
          </CardTitle>
          <CardDescription>
            Différence entre les revenus totaux et les dépenses totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Revenus Totaux</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatPrice(stats?.totalRevenues || 0, settings?.currency)}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Dépenses Totales</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatPrice(stats?.totalExpenses || 0, settings?.currency)}
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${(stats?.netResult || 0) >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
              <div className={`text-sm font-medium mb-1 ${(stats?.netResult || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {(stats?.netResult || 0) >= 0 ? 'Bénéfice Net' : 'Perte Nette'}
              </div>
              <div className={`text-2xl font-bold ${(stats?.netResult || 0) >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                {formatPrice(Math.abs(stats?.netResult || 0), settings?.currency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapports comptables</h2>
          <p className="text-muted-foreground">
            Générez et consultez vos rapports financiers
          </p>
        </div>
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau rapport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer un nouveau rapport</DialogTitle>
              <DialogDescription>
                Créez un rapport comptable pour la période sélectionnée
              </DialogDescription>
            </DialogHeader>
            <Form {...reportForm}>
              <form onSubmit={reportForm.handleSubmit(handleCreateReport)} className="space-y-4">
                <FormField
                  control={reportForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du rapport</FormLabel>
                      <FormControl>
                        <Input placeholder="Rapport mensuel janvier 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reportForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de rapport</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REPORT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={reportForm.control}
                    name="periodStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reportForm.control}
                    name="periodEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createReportMutation.isPending}>
                    {createReportMutation.isPending ? "Génération..." : "Générer le rapport"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses ce mois</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.monthlyExpensesByCategory?.reduce((sum: number, cat: any) => sum + cat.amount, 0) || 0, settings?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.monthlyExpensesByCategory?.length || 0} catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fonds disponibles</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.totalImprestFunds || 0, settings?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeImprestFunds || 0} fonds actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports générés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Historique complet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports générés</CardTitle>
          <CardDescription>
            Historique de tous vos rapports comptables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Aucun rapport</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Générez votre premier rapport comptable.
                </p>
              </div>
            ) : (
              reports?.map((report: any) => {
                const reportType = REPORT_TYPES.find(t => t.value === report.type);
                const startDate = new Date(report.periodStart).toLocaleDateString('fr-FR');
                const endDate = new Date(report.periodEnd).toLocaleDateString('fr-FR');
                
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{reportType?.label}</span>
                            <span>•</span>
                            <span>{startDate} - {endDate}</span>
                            <span>•</span>
                            <span>Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReportMutation.mutate(report.id)}
                        disabled={deleteReportMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {stats?.monthlyExpensesByCategory && stats.monthlyExpensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu des dépenses par catégorie</CardTitle>
            <CardDescription>
              Répartition des dépenses du mois en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthlyExpensesByCategory.map((category: any, index: number) => {
                const percentage = category.allocatedAmount > 0 ? (category.amount / category.allocatedAmount) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-muted-foreground">
                        {formatPrice(category.amount, settings?.currency)} / {formatPrice(category.allocatedAmount, settings?.currency)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
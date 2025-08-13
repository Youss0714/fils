import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, FileText, Wallet, CreditCard } from "lucide-react";
import { ExpenseManager } from "../components/accounting/expense-manager";
import { ImprestManager } from "../components/accounting/imprest-manager";
import { ReportsManager } from "../components/accounting/reports-manager";

import { EXPENSE_STATUS, PAYMENT_METHODS, IMPREST_STATUS } from "@shared/schema";

export default function AccountingPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/accounting/stats"],
  });

  const { data: expenses } = useQuery({
    queryKey: ["/api/accounting/expenses"],
  });

  const { data: imprestFunds } = useQuery({
    queryKey: ["/api/accounting/imprest-funds"],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comptabilité</h1>
          <p className="text-muted-foreground">
            Gérez vos finances, dépenses et avances en toute sécurité
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalExpenses?.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentExpenses?.length || 0} dépenses récentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingExpenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dépenses à approuver
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedExpenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dépenses validées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fonds d'avance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalImprestFunds?.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeImprestFunds || 0} fonds actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats?.recentExpenses && stats.recentExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dépenses récentes</CardTitle>
            <CardDescription>
              Aperçu de vos dernières transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentExpenses.slice(0, 5).map((expense: any) => {
                const status = EXPENSE_STATUS.find(s => s.value === expense.status);
                const paymentMethod = PAYMENT_METHODS.find(p => p.value === expense.paymentMethod);
                
                return (
                  <div key={expense.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="text-sm font-medium">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category?.name} • {paymentMethod?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {parseFloat(expense.amount).toLocaleString('fr-FR')} FCFA
                      </span>
                      <Badge variant="secondary" className={status?.color}>
                        {status?.icon} {status?.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {stats?.monthlyExpensesByCategory && stats.monthlyExpensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par catégorie (ce mois)</CardTitle>
            <CardDescription>
              Répartition de vos dépenses mensuelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyExpensesByCategory.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <TabsList className="flex flex-col sm:flex-row w-full sm:w-auto h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
            <TabsTrigger 
              value="expenses" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <CreditCard className="h-5 w-5" />
              <span className="whitespace-nowrap">Dépenses</span>
            </TabsTrigger>
            <TabsTrigger 
              value="imprest" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <Wallet className="h-5 w-5" />
              <span className="whitespace-nowrap">Fonds d'avance</span>
            </TabsTrigger>

            <TabsTrigger 
              value="reports" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-green-50 dark:hover:bg-green-900/20 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <FileText className="h-5 w-5" />
              <span className="whitespace-nowrap">Rapports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="expenses">
          <ExpenseManager />
        </TabsContent>

        <TabsContent value="imprest">
          <ImprestManager />
        </TabsContent>



        <TabsContent value="reports">
          <ReportsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
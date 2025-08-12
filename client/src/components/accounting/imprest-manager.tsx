import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Wallet, ArrowUp, ArrowDown, Eye, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  insertImprestFundSchema,
  insertImprestTransactionSchema,
  IMPREST_STATUS, 
  IMPREST_TRANSACTION_TYPES,
  type InsertImprestFund,
  type InsertImprestTransaction 
} from "@shared/schema";

export function ImprestManager() {
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | 'expense'>('deposit');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: imprestFunds = [], isLoading: fundsLoading } = useQuery<any[]>({
    queryKey: ["/api/accounting/imprest-funds"],
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/accounting/imprest-funds", selectedFund?.id, "transactions"],
    enabled: !!selectedFund?.id,
  });

  // Forms
  const fundForm = useForm<InsertImprestFund>({
    resolver: zodResolver(insertImprestFundSchema),
    defaultValues: {
      accountHolder: "",
      initialAmount: "",
      purpose: "",
      status: "active",
    },
  });

  const transactionForm = useForm<InsertImprestTransaction>({
    resolver: zodResolver(insertImprestTransactionSchema),
    defaultValues: {
      type: "deposit",
      amount: "",
      description: "",
    },
  });

  // Mutations
  const createFundMutation = useMutation({
    mutationFn: (data: InsertImprestFund) => apiRequest("/api/accounting/imprest-funds", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      setIsFundDialogOpen(false);
      fundForm.reset();
      toast({ title: "Fonds d'avance créé avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la création du fonds",
        variant: "destructive" 
      });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: InsertImprestTransaction) => apiRequest("/api/accounting/imprest-transactions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds", selectedFund?.id, "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      setIsTransactionDialogOpen(false);
      transactionForm.reset();
      toast({ title: "Transaction créée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la création de la transaction",
        variant: "destructive" 
      });
    },
  });

  const handleCreateFund = (data: InsertImprestFund) => {
    console.log("Form data:", data);
    console.log("Form errors:", fundForm.formState.errors);
    createFundMutation.mutate(data);
  };

  const handleCreateTransaction = (data: InsertImprestTransaction) => {
    createTransactionMutation.mutate({
      ...data,
      imprestId: selectedFund?.id,
      type: transactionType,
    });
  };

  if (fundsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des fonds d'avance</h2>
          <p className="text-muted-foreground">
            Système d'imprest pour gérer les avances et remboursements
          </p>
        </div>
        <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau fonds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau fonds d'avance</DialogTitle>
              <DialogDescription>
                Créez un nouveau fonds d'avance pour un employé ou un projet
              </DialogDescription>
            </DialogHeader>
            <Form {...fundForm}>
              <form onSubmit={fundForm.handleSubmit(handleCreateFund)} className="space-y-4">
                <FormField
                  control={fundForm.control}
                  name="accountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Détenteur du fonds</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'employé" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fundForm.control}
                  name="initialAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant initial (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fundForm.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectif</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Frais de mission, petites dépenses..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createFundMutation.isPending}>
                    {createFundMutation.isPending ? "Création..." : "Créer le fonds"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Funds List */}
        <Card>
          <CardHeader>
            <CardTitle>Fonds d'avance actifs</CardTitle>
            <CardDescription>
              Liste de tous vos fonds d'avance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imprestFunds.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Aucun fonds d'avance</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Créez votre premier fonds d'avance.
                  </p>
                </div>
              ) : (
                imprestFunds.map((fund: any) => {
                  const status = IMPREST_STATUS.find(s => s.value === fund.status);
                  const balance = parseFloat(fund.currentBalance);
                  const initial = parseFloat(fund.initialAmount);
                  const usagePercent = ((initial - balance) / initial) * 100;
                  
                  return (
                    <div 
                      key={fund.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedFund?.id === fund.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedFund(fund)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{fund.accountHolder}</h4>
                          <p className="text-sm text-muted-foreground">{fund.reference}</p>
                        </div>
                        <Badge variant="secondary" className={status?.color}>
                          {status?.icon} {status?.label}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm">
                          <span>Solde actuel</span>
                          <span className="font-medium">
                            {balance.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Montant initial</span>
                          <span>{initial.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {usagePercent.toFixed(1)}% utilisé
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fund Details & Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedFund ? `Détails - ${selectedFund.accountHolder}` : "Sélectionnez un fonds"}
                </CardTitle>
                <CardDescription>
                  {selectedFund ? "Transactions et historique" : "Cliquez sur un fonds pour voir les détails"}
                </CardDescription>
              </div>
              {selectedFund && (
                <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle transaction</DialogTitle>
                      <DialogDescription>
                        Ajoutez une transaction au fonds de {selectedFund.accountHolder}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...transactionForm}>
                      <form onSubmit={transactionForm.handleSubmit(handleCreateTransaction)} className="space-y-4">
                        <div>
                          <Label htmlFor="transaction-type">Type de transaction</Label>
                          <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {IMPREST_TRANSACTION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormField
                          control={transactionForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant (FCFA)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="25000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={transactionForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Description de la transaction..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={createTransactionMutation.isPending}>
                            {createTransactionMutation.isPending ? "Création..." : "Créer la transaction"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedFund ? (
              <div className="space-y-4">
                {/* Fund Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Solde actuel</p>
                    <p className="text-lg font-semibold">
                      {parseFloat(selectedFund.currentBalance).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant initial</p>
                    <p className="text-lg font-semibold">
                      {parseFloat(selectedFund.initialAmount).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <h4 className="font-medium mb-2">Objectif</h4>
                  <p className="text-sm text-muted-foreground">{selectedFund.purpose}</p>
                </div>

                {/* Transactions */}
                <div>
                  <h4 className="font-medium mb-3">Historique des transactions</h4>
                  <div className="space-y-2">
                    {transactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune transaction pour ce fonds
                      </p>
                    ) : (
                      transactions.map((transaction: any) => {
                        const type = IMPREST_TRANSACTION_TYPES.find(t => t.value === transaction.type);
                        const amount = parseFloat(transaction.amount);
                        
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${type?.color}`}>
                                {transaction.type === 'deposit' ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUp className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : '-'}
                                {amount.toLocaleString('fr-FR')} FCFA
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Solde: {parseFloat(transaction.balanceAfter).toLocaleString('fr-FR')} FCFA
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Aucun fonds sélectionné</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sélectionnez un fonds pour voir ses détails.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
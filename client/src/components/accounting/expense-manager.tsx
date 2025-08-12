import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Check, X, Eye, DollarSign } from "lucide-react";
import { ExpensePDF } from "./expense-pdf";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  insertExpenseSchema, 
  insertExpenseCategorySchema, 
  EXPENSE_STATUS, 
  PAYMENT_METHODS,
  type InsertExpense,
  type InsertExpenseCategory 
} from "@shared/schema";

export function ExpenseManager() {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/accounting/expenses"],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/accounting/expense-categories"],
  });

  const { data: imprestFunds = [] } = useQuery<any[]>({
    queryKey: ["/api/accounting/imprest-funds"],
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  // Forms
  const expenseForm = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      paymentMethod: "cash",
      status: "pending",
      expenseDate: new Date().toISOString().split('T')[0],
      categoryId: undefined,
      notes: "",
      imprestId: undefined,
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(insertExpenseCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isMajor: false,
    },
  });

  // Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data: InsertExpense) => apiRequest("POST", "/api/accounting/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds"] });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
      toast({ title: "Dépense créée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la création de la dépense",
        variant: "destructive" 
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: InsertExpenseCategory) => apiRequest("POST", "/api/accounting/expense-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expense-categories"] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      toast({ title: "Catégorie créée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la création de la catégorie",
        variant: "destructive" 
      });
    },
  });

  const approveExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/accounting/expenses/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      toast({ title: "Dépense approuvée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de l'approbation",
        variant: "destructive" 
      });
    },
  });

  const rejectExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/accounting/expenses/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      toast({ title: "Dépense rejetée" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors du rejet",
        variant: "destructive" 
      });
    },
  });

  const handleCreateExpense = (data: any) => {
    console.log("Creating expense:", data);
    createExpenseMutation.mutate(data);
  };

  const handleCreateCategory = (data: any) => {
    console.log("Creating category:", data);
    createCategoryMutation.mutate(data);
  };

  if (expensesLoading) {
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
          <h2 className="text-2xl font-bold tracking-tight">Gestion des dépenses</h2>
          <p className="text-muted-foreground">
            Suivez et gérez toutes vos dépenses d'entreprise
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle catégorie de dépense</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle catégorie pour organiser vos dépenses
                </DialogDescription>
              </DialogHeader>
              <Form {...categoryForm}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Form submitted");
                    const values = categoryForm.getValues();
                    console.log("Form values:", values);
                    if (values.name && values.name.trim()) {
                      handleCreateCategory(values);
                    } else {
                      toast({
                        title: "Erreur",
                        description: "Le nom de la catégorie est requis",
                        variant: "destructive"
                      });
                    }
                  }} 
                  className="space-y-4"
                >
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la catégorie</FormLabel>
                        <FormControl>
                          <Input placeholder="Frais de déplacement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description de la catégorie..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createCategoryMutation.isPending}
                      onClick={() => console.log("Button clicked directly")}
                    >
                      {createCategoryMutation.isPending ? "Création..." : "Créer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle dépense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle dépense</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle dépense d'entreprise
                </DialogDescription>
              </DialogHeader>
              <Form {...expenseForm}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Expense form submitted");
                    const values = expenseForm.getValues();
                    console.log("Expense form values:", values);
                    console.log("Form errors:", expenseForm.formState.errors);
                    if (values.description && values.amount && values.categoryId) {
                      // Ajouter la référence automatiquement
                      const expenseData = {
                        ...values,
                        reference: `EXP-${Date.now()}`
                      };
                      console.log("Sending expense data:", expenseData);
                      handleCreateExpense(expenseData);
                    } else {
                      toast({
                        title: "Erreur",
                        description: "Description, montant et catégorie sont requis",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Déjeuner d'affaires avec client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
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
                      control={expenseForm.control}
                      name="expenseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de la dépense</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                  {category.isMajor && <Badge variant="secondary" className="ml-2">Majeure</Badge>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Méthode de paiement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAYMENT_METHODS.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.icon} {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="imprestId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonds d'avance (optionnel)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value ? String(field.value) : "none"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Aucun fonds" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucun fonds</SelectItem>
                              {imprestFunds.map((fund: any) => (
                                <SelectItem key={fund.id} value={fund.id.toString()}>
                                  {fund.accountHolder} - {parseFloat(fund.currentBalance).toLocaleString('fr-FR')} FCFA
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={expenseForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Informations supplémentaires..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createExpenseMutation.isPending}
                      onClick={() => console.log("Expense button clicked!")}
                    >
                      {createExpenseMutation.isPending ? "Création..." : "Créer la dépense"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des dépenses</CardTitle>
          <CardDescription>
            Toutes vos dépenses d'entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses?.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Aucune dépense</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Commencez par créer votre première dépense.
                </p>
              </div>
            ) : (
              expenses?.map((expense: any) => {
                const status = EXPENSE_STATUS.find(s => s.value === expense.status);
                const paymentMethod = PAYMENT_METHODS.find(p => p.value === expense.paymentMethod);
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{expense.category?.name}</span>
                            <span>•</span>
                            <span>{paymentMethod?.icon} {paymentMethod?.label}</span>
                            <span>•</span>
                            <span>{new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</span>
                            {expense.category?.isMajor && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">Majeure</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {parseFloat(expense.amount).toLocaleString('fr-FR')} FCFA
                        </p>
                        <Badge variant="secondary" className={status?.color}>
                          {status?.icon} {status?.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {expense.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveExpenseMutation.mutate(expense.id)}
                              disabled={approveExpenseMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectExpenseMutation.mutate(expense.id)}
                              disabled={rejectExpenseMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Détails de la dépense</DialogTitle>
                              <DialogDescription>
                                Informations complètes sur cette dépense
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Référence</Label>
                                  <p className="text-sm">{expense.reference}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Montant</Label>
                                  <p className="text-sm font-semibold">{parseFloat(expense.amount).toLocaleString('fr-FR')} FCFA</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Catégorie</Label>
                                  <p className="text-sm">{expense.category?.name || 'Non définie'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                                  <p className="text-sm">{new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                <p className="text-sm">{expense.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Méthode de paiement</Label>
                                  <p className="text-sm">
                                    {PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.label || expense.paymentMethod}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                                  <Badge variant="secondary" className={EXPENSE_STATUS.find(s => s.value === expense.status)?.color}>
                                    {EXPENSE_STATUS.find(s => s.value === expense.status)?.icon} {EXPENSE_STATUS.find(s => s.value === expense.status)?.label}
                                  </Badge>
                                </div>
                              </div>
                              {expense.notes && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                  <p className="text-sm">{expense.notes}</p>
                                </div>
                              )}
                              {expense.approvedBy && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Approuvé par</Label>
                                    <p className="text-sm">{expense.approvedBy}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Date d'approbation</Label>
                                    <p className="text-sm">{new Date(expense.approvedAt).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Créé le</Label>
                                <p className="text-sm">{new Date(expense.createdAt).toLocaleDateString('fr-FR')} à {new Date(expense.createdAt).toLocaleTimeString('fr-FR')}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <ExpensePDF expense={expense} user={user} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
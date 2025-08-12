import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Building2 } from "lucide-react";
import { insertChartOfAccountsSchema, ACCOUNT_TYPES, NORMAL_BALANCE_TYPES } from "@shared/schema";
import type { ChartOfAccounts, InsertChartOfAccounts } from "@shared/schema";
import { z } from "zod";

const formSchema = z.object({
  accountCode: z.string().min(1, "Le code du compte est requis"),
  accountName: z.string().min(1, "Le nom du compte est requis"),
  accountType: z.string().min(1, "Le type de compte est requis"),
  normalBalance: z.string().min(1, "Le solde normal est requis"),
  description: z.string().optional(),
  level: z.number().min(1).max(5).default(1),
  parentAccountId: z.number().optional(),
});

export function ChartOfAccountsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccounts | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountCode: "",
      accountName: "",
      accountType: "",
      description: "",
      normalBalance: "",
      level: 1,
      parentAccountId: undefined,
    },
  });

  // Get chart of accounts
  const { data: accounts, isLoading } = useQuery<ChartOfAccounts[]>({
    queryKey: ["/api/accounting/chart-of-accounts"],
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: (data: InsertChartOfAccounts) =>
      apiRequest("POST", "/api/accounting/chart-of-accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/chart-of-accounts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Compte créé",
        description: "Le compte a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de la création du compte",
      });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertChartOfAccounts> }) =>
      apiRequest("PATCH", `/api/accounting/chart-of-accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/chart-of-accounts"] });
      setIsDialogOpen(false);
      setEditingAccount(null);
      form.reset();
      toast({
        title: "Compte modifié",
        description: "Le compte a été modifié avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de la modification du compte",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/accounting/chart-of-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/chart-of-accounts"] });
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du compte",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted with data:", data);
    
    if (editingAccount) {
      // Pour la mise à jour, ne pas inclure userId
      const updateData = {
        accountCode: data.accountCode,
        accountName: data.accountName,
        accountType: data.accountType,
        normalBalance: data.normalBalance,
        description: data.description || null,
        level: data.level,
        parentAccountId: data.parentAccountId || null,
        isActive: true,
      };
      updateAccountMutation.mutate({ id: editingAccount.id, data: updateData });
    } else {
      // Pour la création, inclure userId (qui sera défini par le serveur)
      const createData: InsertChartOfAccounts = {
        accountCode: data.accountCode,
        accountName: data.accountName,
        accountType: data.accountType,
        normalBalance: data.normalBalance,
        description: data.description || null,
        level: data.level,
        parentAccountId: data.parentAccountId || null,
        userId: "", // Will be set by the server
        isActive: true,
      };
      createAccountMutation.mutate(createData);
    }
  };

  const handleEdit = (account: ChartOfAccounts) => {
    setEditingAccount(account);
    form.reset({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      description: account.description || "",
      normalBalance: account.normalBalance,
      level: account.level,
      parentAccountId: account.parentAccountId || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      deleteAccountMutation.mutate(id);
    }
  };

  const getAccountTypeInfo = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type);
    return accountType || { label: type, icon: "📄" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Plan Comptable
              </CardTitle>
              <CardDescription>
                Gérez votre plan comptable et organisez vos comptes
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingAccount(null);
                    form.reset();
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  Nouveau Compte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAccount ? "Modifier le Compte" : "Nouveau Compte"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAccount ? "Modifiez les informations du compte" : "Créez un nouveau compte dans votre plan comptable"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountCode">Code Compte *</Label>
                      <Input
                        id="accountCode"
                        {...form.register("accountCode")}
                        placeholder="101"
                      />
                      {form.formState.errors.accountCode && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.accountCode.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Niveau</Label>
                      <Input
                        id="level"
                        type="number"
                        min="1"
                        max="5"
                        {...form.register("level", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nom du Compte *</Label>
                    <Input
                      id="accountName"
                      {...form.register("accountName")}
                      placeholder="Caisse"
                    />
                    {form.formState.errors.accountName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.accountName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Type de Compte *</Label>
                    <Select 
                      value={form.watch("accountType") || ""} 
                      onValueChange={(value) => {
                        form.setValue("accountType", value);
                        // Auto-set normal balance based on account type
                        const accountType = ACCOUNT_TYPES.find(t => t.value === value);
                        if (accountType) {
                          form.setValue("normalBalance", accountType.normalBalance);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.accountType && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.accountType.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="normalBalance">Solde Normal *</Label>
                    <Select 
                      value={form.watch("normalBalance") || ""} 
                      onValueChange={(value) => form.setValue("normalBalance", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le solde normal" />
                      </SelectTrigger>
                      <SelectContent>
                        {NORMAL_BALANCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {accounts && accounts.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="parentAccountId">Compte Parent (optionnel)</Label>
                      <Select 
                        value={form.watch("parentAccountId")?.toString() || "none"} 
                        onValueChange={(value) => 
                          form.setValue("parentAccountId", value === "none" ? undefined : parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte parent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun compte parent</SelectItem>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.accountCode} - {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Description du compte..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 pt-4 mt-4 border-t">
                    <Button 
                      type="submit" 
                      disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                      className="flex-1"
                    >
                      {editingAccount ? "Modifier" : "Créer"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingAccount(null);
                        form.reset();
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Aucun compte défini</p>
              <p>Créez votre premier compte pour commencer à organiser votre comptabilité.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom du Compte</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Solde Normal</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Compte Parent</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts?.map((account) => {
                    const accountTypeInfo = getAccountTypeInfo(account.accountType);
                    const parentAccount = accounts.find((a) => a.id === account.parentAccountId);
                    
                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono font-semibold">
                          {account.accountCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {account.accountName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <span>{accountTypeInfo.icon}</span>
                            {accountTypeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.normalBalance === 'debit' ? 'default' : 'secondary'}>
                            {account.normalBalance === 'debit' ? 'Débit' : 'Crédit'}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.level}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {parentAccount ? `${parentAccount.accountCode} - ${parentAccount.accountName}` : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(account)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(account.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
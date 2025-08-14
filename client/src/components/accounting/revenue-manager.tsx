import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Eye, Calendar, DollarSign, FileText, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertRevenueCategorySchema, insertRevenueSchema, type RevenueCategory, type Revenue } from '@shared/schema';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Composant pour la gestion des revenus
export function RevenueManager() {
  const [activeTab, setActiveTab] = useState('revenues');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RevenueCategory | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const queryClient = useQueryClient();

  // Récupérer les catégories de revenus
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<RevenueCategory[]>({
    queryKey: ['/api/accounting/revenue-categories'],
  });

  // Récupérer les revenus
  const { data: revenues = [], isLoading: revenuesLoading } = useQuery<(Revenue & { category: RevenueCategory })[]>({
    queryKey: ['/api/accounting/revenues'],
  });

  // Formulaire pour les catégories
  const categoryForm = useForm<z.infer<typeof insertRevenueCategorySchema>>({
    resolver: zodResolver(insertRevenueCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Type modifié pour le formulaire avec revenueDate en string
  const revenueFormSchema = insertRevenueSchema.extend({
    revenueDate: z.string(),
  });

  // Formulaire pour les revenus
  const revenueForm = useForm<z.infer<typeof revenueFormSchema>>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      description: '',
      amount: '',
      categoryId: 0,
      revenueDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      source: '',
      notes: '',
    },
  });

  // Mutation pour créer/modifier une catégorie
  const categoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRevenueCategorySchema>) => {
      if (editingCategory) {
        return apiRequest('PUT', `/api/accounting/revenue-categories/${editingCategory.id}`, data);
      } else {
        return apiRequest('POST', '/api/accounting/revenue-categories', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenue-categories'] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      setEditingCategory(null);
      toast({
        title: editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée',
        description: editingCategory ? 'La catégorie de revenus a été mise à jour avec succès.' : 'La nouvelle catégorie de revenus a été créée.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde de la catégorie.',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer une catégorie
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/accounting/revenue-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenue-categories'] });
      toast({
        title: 'Catégorie supprimée',
        description: 'La catégorie de revenus a été supprimée avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression de la catégorie.',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour créer/modifier un revenu
  const revenueMutation = useMutation({
    mutationFn: async (data: z.infer<typeof revenueFormSchema>) => {
      // Convertir la date string en Date pour l'API
      const apiData = {
        ...data,
        revenueDate: new Date(data.revenueDate),
      };
      if (editingRevenue) {
        return apiRequest('PUT', `/api/accounting/revenues/${editingRevenue.id}`, apiData);
      } else {
        return apiRequest('POST', '/api/accounting/revenues', apiData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenues'] });
      setIsRevenueDialogOpen(false);
      revenueForm.reset();
      setEditingRevenue(null);
      toast({
        title: editingRevenue ? 'Revenu mis à jour' : 'Revenu créé',
        description: editingRevenue ? 'Le revenu a été mis à jour avec succès.' : 'Le nouveau revenu a été enregistré.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde du revenu.',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer un revenu
  const deleteRevenueMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/accounting/revenues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenues'] });
      toast({
        title: 'Revenu supprimé',
        description: 'Le revenu a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du revenu.',
        variant: 'destructive',
      });
    },
  });

  const handleEditCategory = (category: RevenueCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || '',
    });
    setIsCategoryDialogOpen(true);
  };

  const handleEditRevenue = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    revenueForm.reset({
      description: revenue.description,
      amount: revenue.amount,
      categoryId: revenue.categoryId,
      revenueDate: format(new Date(revenue.revenueDate), 'yyyy-MM-dd'),
      paymentMethod: revenue.paymentMethod,
      source: revenue.source || '',
      notes: revenue.notes || '',
    });
    setIsRevenueDialogOpen(true);
  };

  const handleViewRevenue = (revenue: Revenue & { category: RevenueCategory }) => {
    setSelectedRevenue(revenue);
    setIsDetailsDialogOpen(true);
  };

  const onCategorySubmit = (data: z.infer<typeof insertRevenueCategorySchema>) => {
    categoryMutation.mutate(data);
  };

  const onRevenueSubmit = (data: z.infer<typeof revenueFormSchema>) => {
    revenueMutation.mutate(data);
  };

  // Pagination pour les revenus
  const totalPages = Math.ceil(revenues.length / itemsPerPage);
  const paginatedRevenues = revenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fonction pour imprimer un revenu
  const printRevenue = (revenue: Revenue & { category: RevenueCategory }) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Détails du Revenu - ${revenue.reference}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .detail-row { margin: 10px 0; display: flex; justify-content: space-between; }
            .label { font-weight: bold; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DÉTAILS DU REVENU</h1>
          <h2>${revenue.reference}</h2>
        </div>
        <div class="detail-row">
          <span class="label">Description:</span>
          <span>${revenue.description}</span>
        </div>
        <div class="detail-row">
          <span class="label">Montant:</span>
          <span>${revenue.amount} FCFA</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span>${format(new Date(revenue.revenueDate), 'dd/MM/yyyy')}</span>
        </div>
        <div class="detail-row">
          <span class="label">Catégorie:</span>
          <span>${revenue.category?.name || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Mode de paiement:</span>
          <span>${revenue.paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="label">Source:</span>
          <span>${revenue.source || 'N/A'}</span>
        </div>
        ${revenue.notes ? `
        <div class="detail-row">
          <span class="label">Notes:</span>
          <span>${revenue.notes}</span>
        </div>
        ` : ''}
      </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('revenues')}
          className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 min-w-[120px] justify-center ${
            activeTab === 'revenues'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          data-testid="tab-revenues"
        >
          <DollarSign className="w-4 h-4" />
          <span>Revenus</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 min-w-[120px] justify-center ${
            activeTab === 'categories'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          data-testid="tab-categories"
        >
          <Building2 className="w-4 h-4" />
          <span>Catégories</span>
        </button>
      </div>

      {/* Onglet Revenus */}
      {activeTab === 'revenues' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestion des Revenus</h3>
            <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-revenue">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Revenu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRevenue ? 'Modifier le Revenu' : 'Nouveau Revenu'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...revenueForm}>
                  <form onSubmit={revenueForm.handleSubmit(onRevenueSubmit)} className="space-y-6 p-4">
                    <FormField
                      control={revenueForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-revenue-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant (FCFA)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" data-testid="input-revenue-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger data-testid="select-revenue-category">
                                <SelectValue placeholder="Sélectionner une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="revenueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date du Revenu</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-revenue-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode de Paiement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Espèces</SelectItem>
                              <SelectItem value="bank_transfer">Virement Bancaire</SelectItem>
                              <SelectItem value="check">Chèque</SelectItem>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="card">Carte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} data-testid="input-revenue-source" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ''} data-testid="textarea-revenue-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsRevenueDialogOpen(false);
                          revenueForm.reset();
                          setEditingRevenue(null);
                        }}
                        data-testid="button-cancel-revenue"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={revenueMutation.isPending}
                        data-testid="button-save-revenue"
                      >
                        {revenueMutation.isPending ? 'Sauvegarde...' : (editingRevenue ? 'Modifier' : 'Créer')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {revenuesLoading ? (
            <div className="text-center py-8">Chargement des revenus...</div>
          ) : paginatedRevenues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun revenu enregistré</p>
                <p className="text-sm text-gray-400 mt-2">Cliquez sur "Nouveau Revenu" pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedRevenues.map((revenue) => (
                  <Card key={revenue.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-lg">{revenue.description}</h4>
                            <span className="text-2xl font-bold text-green-600">
                              {parseFloat(revenue.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>{revenue.reference}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(revenue.revenueDate), 'dd/MM/yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4" />
                              <span>{revenue.category?.name || 'Sans catégorie'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4" />
                              <span className="capitalize">{revenue.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRevenue(revenue)}
                            data-testid={`button-view-revenue-${revenue.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRevenue(revenue)}
                            data-testid={`button-edit-revenue-${revenue.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteRevenueMutation.mutate(revenue.id)}
                            data-testid={`button-delete-revenue-${revenue.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      data-testid={`button-page-${page}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Onglet Catégories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catégories de Revenus</h3>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Catégorie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la catégorie</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-category-name" />
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
                            <Textarea {...field} value={field.value || ''} data-testid="textarea-category-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCategoryDialogOpen(false);
                          categoryForm.reset();
                          setEditingCategory(null);
                        }}
                        data-testid="button-cancel-category"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={categoryMutation.isPending}
                        data-testid="button-save-category"
                      >
                        {categoryMutation.isPending ? 'Sauvegarde...' : (editingCategory ? 'Modifier' : 'Créer')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {categoriesLoading ? (
            <div className="text-center py-8">Chargement des catégories...</div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune catégorie créée</p>
                <p className="text-sm text-gray-400 mt-2">Créez des catégories pour organiser vos revenus</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{category.name}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog pour les détails du revenu */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du Revenu</DialogTitle>
          </DialogHeader>
          {selectedRevenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Référence</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.reference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Montant</Label>
                  <p className="text-sm font-bold text-green-600">
                    {parseFloat(selectedRevenue.amount).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(selectedRevenue.revenueDate), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mode de paiement</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {selectedRevenue.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.description}</p>
              </div>
              {selectedRevenue.source && (
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.source}</p>
                </div>
              )}
              {selectedRevenue.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedRevenue && printRevenue(selectedRevenue as Revenue & { category: RevenueCategory })}
              data-testid="button-print-revenue"
            >
              <FileText className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={() => setIsDetailsDialogOpen(false)} data-testid="button-close-details">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
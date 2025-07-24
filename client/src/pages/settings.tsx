import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous êtes déconnecté. Reconnexion...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Note: Profile updates would need backend implementation
    toast({
      title: "Fonctionnalité en développement",
      description: "La mise à jour du profil sera bientôt disponible.",
      variant: "default",
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    // Note: Password change would need backend implementation
    toast({
      title: "Fonctionnalité en développement",
      description: "Le changement de mot de passe sera bientôt disponible.",
      variant: "default",
    });
    
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Paramètres" 
          subtitle="Gérez vos préférences et votre compte"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Paramètres" 
        subtitle="Gérez vos préférences et votre compte"
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Informations du Profil</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Adresse Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Sécurité</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      placeholder="Votre mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères.
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <CardTitle>Préférences de l'Application</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informations de l'Entreprise</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      placeholder="Votre Entreprise SARL"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">Adresse</Label>
                    <Input
                      id="companyAddress"
                      placeholder="123 Rue de la Paix, 75001 Paris"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siret">SIRET</Label>
                      <Input
                        id="siret"
                        placeholder="12345678901234"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="tva">N° TVA</Label>
                      <Input
                        id="tva"
                        placeholder="FR12345678901"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Invoice Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Paramètres de Facturation</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="defaultTax">Taux de TVA par défaut (%)</Label>
                    <Input
                      id="defaultTax"
                      type="number"
                      value="20"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
                    <Input
                      id="invoicePrefix"
                      value="FAC"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 p-4 bg-blue-50 rounded-lg">
                <Bell className="w-4 h-4 inline mr-2" />
                Ces paramètres seront configurables dans une prochaine version de l'application.
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de Danger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Supprimer toutes les données</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Cette action supprimera définitivement toutes vos données (clients, produits, factures).
                    Cette action est irréversible.
                  </p>
                  <Button variant="destructive" disabled>
                    Supprimer toutes les données
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

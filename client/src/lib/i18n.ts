// Système de traduction pour l'application
export type Language = 'fr' | 'en';

export interface Translations {
  // Navigation
  dashboard: string;
  clients: string;
  products: string;
  categories: string;
  invoices: string;
  sales: string;
  settings: string;
  export: string;
  logout: string;

  // Actions communes
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  search: string;
  loading: string;
  
  // Dashboard
  revenue: string;
  invoiceCount: string;
  clientCount: string;
  productCount: string;
  recentInvoices: string;
  topProducts: string;
  
  // Clients
  clientName: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  newClient: string;
  editClient: string;
  
  // Products
  productName: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  taxRate: string;
  newProduct: string;
  editProduct: string;
  
  // Invoices
  invoiceNumber: string;
  client: string;
  status: string;
  total: string;
  dueDate: string;
  pending: string;
  paid: string;
  overdue: string;
  newInvoice: string;
  
  // Settings
  language: string;
  currency: string;
  profile: string;
  preferences: string;

  personalInfo: string;
  updateProfile: string;
  profileFirstName: string;
  profileLastName: string;
  profilePhone: string;
  profileCompany: string;
  profilePosition: string;
  profileAddress: string;
  profileBusinessType: string;
  
  // Messages
  success: string;
  error: string;
  confirmDelete: string;
  noData: string;
  
  // Landing page
  appTitle: string;
  appDescription: string;
  loginButton: string;
  createAccountButton: string;
  newUserText: string;
  clientManagement: string;
  clientManagementDesc: string;
  productCatalog: string;
  productCatalogDesc: string;
  invoicing: string;
  invoicingDesc: string;
  reporting: string;
  reportingDesc: string;
  whyChoose: string;
  modernInterface: string;
  modernInterfaceDesc: string;
  secure: string;
  secureDesc: string;
  dashboardTitle: string;
  dashboardDesc: string;
  readyToOptimize: string;
  joinCompanies: string;
  startNow: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    clients: "Clients",
    products: "Produits",
    categories: "Catégories", 
    invoices: "Factures",
    sales: "Ventes",
    settings: "Paramètres",
    export: "Export",
    logout: "Déconnexion",

    // Actions communes
    create: "Créer",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    search: "Rechercher",
    loading: "Chargement...",
    
    // Dashboard
    revenue: "Chiffre d'affaires",
    invoiceCount: "Factures",
    clientCount: "Clients",
    productCount: "Produits",
    recentInvoices: "Factures récentes",
    topProducts: "Produits populaires",
    
    // Clients
    clientName: "Nom du client",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    company: "Entreprise",
    newClient: "Nouveau Client",
    editClient: "Modifier le Client",
    
    // Products
    productName: "Nom du produit",
    description: "Description",
    price: "Prix",
    stock: "Stock",
    category: "Catégorie",
    taxRate: "Taux de TVA",
    newProduct: "Nouveau Produit",
    editProduct: "Modifier le Produit",
    
    // Invoices
    invoiceNumber: "Numéro de facture",
    client: "Client",
    status: "Statut",
    total: "Total",
    dueDate: "Date d'échéance",
    pending: "En attente",
    paid: "Payée",
    overdue: "En retard",
    newInvoice: "Nouvelle Facture",
    
    // Settings
    language: "Langue",
    currency: "Devise",
    profile: "Profil",
    preferences: "Préférences",

    personalInfo: "Informations personnelles",
    updateProfile: "Mettre à jour le profil",
    profileFirstName: "Prénom",
    profileLastName: "Nom",
    profilePhone: "Téléphone",
    profileCompany: "Entreprise",
    profilePosition: "Poste",
    profileAddress: "Adresse",
    profileBusinessType: "Type d'activité",
    
    // Messages
    success: "Succès",
    error: "Erreur",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    noData: "Aucune donnée disponible",
    
    // Landing page
    appTitle: "YGestion",
    appDescription: "Application complète de gestion commerciale pour optimiser vos ventes, gérer vos clients et suivre votre activité en temps réel.",
    loginButton: "Se connecter",
    createAccountButton: "Créer un compte",
    newUserText: "Nouveau sur YGestion ? Créez votre compte et complétez votre profil pour commencer.",
    clientManagement: "Gestion des Clients",
    clientManagementDesc: "Centralisez toutes les informations de vos clients et leur historique d'achat.",
    productCatalog: "Catalogue Produits",
    productCatalogDesc: "Organisez vos produits par catégories et suivez vos stocks en temps réel.",
    invoicing: "Facturation",
    invoicingDesc: "Créez et gérez vos factures facilement avec génération PDF automatique.",
    reporting: "Reporting",
    reportingDesc: "Analysez vos performances avec des rapports détaillés et des exports CSV.",
    whyChoose: "Pourquoi choisir YGestion ?",
    modernInterface: "Interface Moderne",
    modernInterfaceDesc: "Interface intuitive et responsive, accessible depuis n'importe quel appareil.",
    secure: "Sécurisé",
    secureDesc: "Authentification sécurisée et données protégées avec chiffrement.",
    dashboardTitle: "Tableau de Bord",
    dashboardDesc: "Visualisez vos KPIs et suivez l'évolution de votre activité en temps réel.",
    readyToOptimize: "Prêt à optimiser votre gestion commerciale ?",
    joinCompanies: "Rejoignez les entreprises qui font confiance à YGestion pour leur croissance.",
    startNow: "Démarrer maintenant",
  },
  
  en: {
    // Navigation
    dashboard: "Dashboard",
    clients: "Clients",
    products: "Products",
    categories: "Categories",
    invoices: "Invoices",
    sales: "Sales",
    settings: "Settings",
    export: "Export",
    logout: "Logout",

    // Actions communes
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    loading: "Loading...",
    
    // Dashboard
    revenue: "Revenue",
    invoiceCount: "Invoices",
    clientCount: "Clients",
    productCount: "Products",
    recentInvoices: "Recent Invoices",
    topProducts: "Top Products",
    
    // Clients
    clientName: "Client Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    company: "Company",
    newClient: "New Client",
    editClient: "Edit Client",
    
    // Products
    productName: "Product Name",
    description: "Description",
    price: "Price",
    stock: "Stock",
    category: "Category",
    taxRate: "Tax Rate",
    newProduct: "New Product",
    editProduct: "Edit Product",
    
    // Invoices
    invoiceNumber: "Invoice Number",
    client: "Client",
    status: "Status",
    total: "Total",
    dueDate: "Due Date",
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    newInvoice: "New Invoice",
    
    // Settings
    language: "Language",
    currency: "Currency",
    profile: "Profile",
    preferences: "Preferences",

    personalInfo: "Personal Information",
    updateProfile: "Update Profile",
    profileFirstName: "First Name",
    profileLastName: "Last Name",
    profilePhone: "Phone",
    profileCompany: "Company",
    profilePosition: "Position",
    profileAddress: "Address",
    profileBusinessType: "Business Type",
    
    // Messages
    success: "Success",
    error: "Error",
    confirmDelete: "Are you sure you want to delete this item?",
    noData: "No data available",
    
    // Landing page
    appTitle: "YGestion",
    appDescription: "Complete business management application to optimize your sales, manage your clients and track your activity in real time.",
    loginButton: "Sign In",
    createAccountButton: "Create Account",
    newUserText: "New to YGestion? Create your account and complete your profile to get started.",
    clientManagement: "Client Management",
    clientManagementDesc: "Centralize all your client information and their purchase history.",
    productCatalog: "Product Catalog",
    productCatalogDesc: "Organize your products by categories and track your inventory in real time.",
    invoicing: "Invoicing",
    invoicingDesc: "Create and manage your invoices easily with automatic PDF generation.",
    reporting: "Reporting",
    reportingDesc: "Analyze your performance with detailed reports and CSV exports.",
    whyChoose: "Why choose YGestion?",
    modernInterface: "Modern Interface",
    modernInterfaceDesc: "Intuitive and responsive interface, accessible from any device.",
    secure: "Secure",
    secureDesc: "Secure authentication and protected data with encryption.",
    dashboardTitle: "Dashboard",
    dashboardDesc: "Visualize your KPIs and track your business activity evolution in real time.",
    readyToOptimize: "Ready to optimize your business management?",
    joinCompanies: "Join the companies that trust YGestion for their growth.",
    startNow: "Start Now",
  }
};

export const taxRates = [
  { value: "3.00", label: "3%" },
  { value: "5.00", label: "5%" },
  { value: "10.00", label: "10%" },
  { value: "15.00", label: "15%" },
  { value: "18.00", label: "18%" },
  { value: "21.00", label: "21%" },
];

export const currencies = [
  { value: "XOF", label: "XOF - Franc CFA", symbol: "XOF" },
  { value: "GHS", label: "GHS - Cedi ghanéen", symbol: "GH₵" },
];

export const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

// Hook pour utiliser les traductions avec support des paramètres utilisateur
export function useTranslation(language?: Language) {
  // Si aucune langue n'est fournie, essayer de récupérer depuis le localStorage
  const currentLanguage = language || 
    (typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') as Language : null) || 
    'fr';
    
  return {
    t: (key: keyof Translations) => translations[currentLanguage][key] || translations['fr'][key] || key,
    language: currentLanguage,
  };
}

// Fonction pour formater les prix selon la devise
export function formatPrice(amount: number | string, currency: string = 'XOF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  switch (currency) {
    case 'XOF':
      return `${numAmount.toLocaleString('fr-FR')} F CFA`;
    case 'GHS':
      return `GH₵ ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    default:
      // Fallback pour XOF par défaut
      return `${numAmount.toLocaleString('fr-FR')} F CFA`;
  }
}
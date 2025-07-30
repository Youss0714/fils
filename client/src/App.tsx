import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/loading-screen";
import LanguageSelector from "@/components/language-selector";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Invoices from "@/pages/invoices";
import InvoiceDetail from "@/pages/invoice-detail";
import Sales from "@/pages/sales";
import Settings from "@/pages/settings";
import Export from "@/pages/export";
import UserRegistration from "@/pages/user-registration";
import Sidebar from "@/components/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    // Check if we should show loading screen
    return !sessionStorage.getItem('hasSeenLoading');
  });
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    // Check if language has been selected before
    return !localStorage.getItem('initialLanguageSelected');
  });

  // Show loading screen if not seen before
  if (showLoadingScreen) {
    return (
      <LoadingScreen 
        onComplete={() => {
          setShowLoadingScreen(false);
          sessionStorage.setItem('hasSeenLoading', 'true');
        }} 
      />
    );
  }

  // Show language selector if not selected before
  if (showLanguageSelector) {
    return (
      <LanguageSelector 
        onLanguageSelect={(language) => {
          // Save the language preference
          localStorage.setItem('initialLanguageSelected', 'true');
          localStorage.setItem('preferredLanguage', language);
          setShowLanguageSelector(false);
        }} 
      />
    );
  }

  // Wait for auth to complete before showing main app
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route component={AuthPage} />
        </>
      ) : (
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/clients" component={Clients} />
            <Route path="/products" component={Products} />
            <Route path="/categories" component={Categories} />
            <Route path="/invoices" component={Invoices} />
            <Route path="/invoices/:id" component={InvoiceDetail} />
            <Route path="/sales" component={Sales} />
            <Route path="/settings" component={Settings} />
            <Route path="/export" component={Export} />
            <Route path="/complete-profile" component={UserRegistration} />
            <Route component={NotFound} />
          </Switch>
        </div>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

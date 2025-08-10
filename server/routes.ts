import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { 
  insertClientSchema, 
  insertProductSchema, 
  insertCategorySchema, 
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertLicenseSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Complete user profile
  app.post('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        company: req.body.company,
        position: req.body.position,
        address: req.body.address,
        businessType: req.body.businessType,
      };

      // Mise à jour du profil utilisateur
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Client routes
  app.get("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.search as string;
      
      if (query) {
        // Search clients by name, email, or company
        const clients = await storage.searchClients(userId, query);
        res.json(clients);
      } else {
        const clients = await storage.getClients(userId);
        res.json(clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id, userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clientData = insertClientSchema.parse({ ...req.body, userId });
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData, userId);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteClient(id, userId);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.search as string;
      
      if (query) {
        // Search products by name or description
        const products = await storage.searchProducts(userId, query);
        res.json(products);
      } else {
        const products = await storage.getProducts(userId);
        res.json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id, userId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productData = insertProductSchema.parse({ ...req.body, userId });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData, userId);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id, userId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData, userId);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id, userId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceWithItems(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/:id/details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceWithItems(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      res.status(500).json({ message: "Failed to fetch invoice details" });
    }
  });

  const createInvoiceSchema = z.object({
    invoice: insertInvoiceSchema.omit({ userId: true }).extend({
      dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    }),
    items: z.array(insertInvoiceItemSchema.omit({ invoiceId: true })),
  });

  app.post("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { invoice, items } = createInvoiceSchema.parse(req.body);
      const invoiceData = { ...invoice, userId };
      const newInvoice = await storage.createInvoice(invoiceData, items);
      res.json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData, userId);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(400).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteInvoice(id, userId);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Sales routes
  app.get("/api/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sales = await storage.getSales(userId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Data export routes
  app.get("/api/export/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clients = await storage.getClients(userId);
      
      const csv = [
        "ID,Nom,Email,Téléphone,Entreprise,Adresse,Date de création",
        ...clients.map(client => 
          `${client.id},"${client.name}","${client.email || ''}","${client.phone || ''}","${client.company || ''}","${client.address || ''}","${client.createdAt?.toISOString() || ''}"`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting clients:", error);
      res.status(500).json({ message: "Failed to export clients" });
    }
  });

  app.get("/api/export/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const products = await storage.getProducts(userId);
      
      const csv = [
        "ID,Nom,Description,Prix HT,Stock,Date de création",
        ...products.map(product => 
          `${product.id},"${product.name}","${product.description || ''}","${product.priceHT}","${product.stock}","${product.createdAt?.toISOString() || ''}"`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting products:", error);
      res.status(500).json({ message: "Failed to export products" });
    }
  });

  app.get("/api/export/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      
      const csv = [
        "ID,Numéro,Client ID,Statut,Total HT,Taux TVA,Total TVA,Total TTC,Échéance,Date de création",
        ...invoices.map(invoice => 
          `${invoice.id},"${invoice.number}","${invoice.clientId}","${invoice.status}","${invoice.totalHT}","${invoice.tvaRate}","${invoice.totalTVA}","${invoice.totalTTC}","${invoice.dueDate?.toISOString() || ''}","${invoice.createdAt?.toISOString() || ''}"`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting invoices:", error);
      res.status(500).json({ message: "Failed to export invoices" });
    }
  });

  // User settings routes
  app.get("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json({
        currency: user?.currency || "XOF",
        language: user?.language || "fr",
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
    }
  });

  app.patch("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const { currency, language } = req.body;
      const updatedUser = await storage.updateUserSettings(req.user.id, { currency, language });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres" });
    }
  });

  // License activation route (public but session-aware)
  app.post("/api/activate", async (req: any, res) => {
    try {
      const { key, clientName, deviceId } = req.body;

      if (!key) {
        return res.status(400).json({ message: "Clé d'activation requise" });
      }

      // Check if license exists
      const license = await storage.getLicenseByKey(key);
      if (!license) {
        return res.status(404).json({ message: "Clé d'activation invalide" });
      }

      // Check if already activated
      if (license.activated) {
        return res.status(409).json({ message: "Cette clé a déjà été activée" });
      }

      // Check if revoked
      if (license.revokedAt) {
        return res.status(403).json({ message: "Cette clé a été révoquée" });
      }

      // Activate the license
      const activatedLicense = await storage.activateLicense(key, clientName, deviceId);
      
      // If user is authenticated, mark their account as license activated immediately
      if (req.user && req.user.id) {
        await storage.setUserLicenseActivated(req.user.id, true);
      } else {
        // Store license activation in session for later association
        if (req.session) {
          req.session.activatedLicenseKey = key;
        }
      }
      
      res.json({
        message: "Licence activée avec succès",
        license: {
          key: activatedLicense.key,
          clientName: activatedLicense.clientName,
          activatedAt: activatedLicense.activatedAt,
        },
      });
    } catch (error) {
      console.error("Error activating license:", error);
      res.status(500).json({ message: "Erreur lors de l'activation de la licence" });
    }
  });

  // Admin middleware to check for ADMIN_TOKEN
  const isAdmin = (req: any, res: any, next: any) => {
    const adminToken = req.headers["x-admin-token"];
    const expectedToken = process.env.ADMIN_TOKEN || "youssouphafils-admin-2025";

    if (!adminToken || adminToken !== expectedToken) {
      return res.status(403).json({ message: "Accès admin refusé" });
    }

    next();
  };

  // Admin routes for Fatimata
  app.get("/api/admin/licenses", isAdmin, async (req, res) => {
    try {
      const licenses = await storage.getAllLicenses();
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des licences" });
    }
  });

  app.post("/api/admin/licenses", isAdmin, async (req, res) => {
    try {
      const licenseData = insertLicenseSchema.parse(req.body);
      
      // Check if key already exists
      const existingLicense = await storage.getLicenseByKey(licenseData.key);
      if (existingLicense) {
        return res.status(409).json({ message: "Cette clé existe déjà" });
      }

      const newLicense = await storage.createLicense(licenseData);
      res.status(201).json(newLicense);
    } catch (error) {
      console.error("Error creating license:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la création de la licence" });
      }
    }
  });

  app.patch("/api/admin/licenses/:key/revoke", isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      
      const license = await storage.getLicenseByKey(key);
      if (!license) {
        return res.status(404).json({ message: "Licence introuvable" });
      }

      const revokedLicense = await storage.revokeLicense(key);
      res.json(revokedLicense);
    } catch (error) {
      console.error("Error revoking license:", error);
      res.status(500).json({ message: "Erreur lors de la révocation de la licence" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

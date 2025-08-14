import {
  users,
  clients,
  products,
  categories,
  invoices,
  invoiceItems,
  sales,
  licenses,
  expenseCategories,
  expenses,
  imprestFunds,
  imprestTransactions,
  accountingReports,
  cashBookEntries,
  pettyCashEntries,
  transactionJournal,
  revenueCategories,
  revenues,

  type User,
  type UpsertUser,
  type Client,
  type Product,
  type Category,
  type Invoice,
  type InvoiceItem,
  type Sale,
  type License,
  type ExpenseCategory,
  type Expense,
  type ImprestFund,
  type ImprestTransaction,
  type AccountingReport,
  type CashBookEntry,
  type PettyCashEntry,
  type TransactionJournal,
  type RevenueCategory,
  type Revenue,

  type InsertClient,
  type InsertProduct,
  type InsertCategory,
  type InsertInvoice,
  type InsertInvoiceItem,
  type InsertSale,
  type InsertLicense,
  type InsertExpenseCategory,
  type InsertExpense,
  type InsertImprestFund,
  type InsertImprestTransaction,
  type InsertAccountingReport,
  type InsertCashBookEntry,
  type InsertPettyCashEntry,
  type InsertTransactionJournal,
  type InsertRevenueCategory,
  type InsertRevenue,

} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum, count, sql, like, or, gte, lte, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createLocalUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profileData: Partial<User>): Promise<User>;
  updateUserSettings(id: string, settings: { currency?: string; language?: string }): Promise<User>;
  setUserLicenseActivated(id: string, activated: boolean): Promise<User>;

  
  // Client operations
  getClients(userId: string): Promise<Client[]>;
  getClient(id: number, userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>, userId: string): Promise<Client>;
  deleteClient(id: number, userId: string): Promise<void>;
  searchClients(userId: string, query: string): Promise<Client[]>;
  
  // Product operations
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: number, userId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, userId: string): Promise<Product>;
  deleteProduct(id: number, userId: string): Promise<void>;
  searchProducts(userId: string, query: string): Promise<Product[]>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  getCategory(id: number, userId: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>, userId: string): Promise<Category>;
  deleteCategory(id: number, userId: string): Promise<void>;
  
  // Invoice operations
  getInvoices(userId: string): Promise<Invoice[]>;
  getInvoice(id: number, userId: string): Promise<Invoice | undefined>;
  getInvoiceWithItems(id: number, userId: string): Promise<(Invoice & { items: InvoiceItem[]; client: Client }) | undefined>;
  createInvoice(invoice: InsertInvoice, items: Omit<InsertInvoiceItem, 'invoiceId'>[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>, userId: string): Promise<Invoice>;
  deleteInvoice(id: number, userId: string): Promise<void>;
  
  // Sales operations
  getSales(userId: string): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    revenue: number;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    recentInvoices: (Invoice & { client: Client })[];
    topProducts: (Product & { salesCount: number })[];
    lowStockProducts: Product[];
  }>;

  // License operations
  getLicenseByKey(key: string): Promise<License | undefined>;
  getAllLicenses(): Promise<License[]>;
  createLicense(license: InsertLicense): Promise<License>;
  activateLicense(key: string, clientName?: string, deviceId?: string): Promise<License>;
  revokeLicense(key: string): Promise<License>;

  // Accounting operations
  
  // Expense Categories
  getExpenseCategories(userId: string): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number, userId: string): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>, userId: string): Promise<ExpenseCategory>;
  deleteExpenseCategory(id: number, userId: string): Promise<void>;

  // Expenses
  getExpenses(userId: string): Promise<(Expense & { category: ExpenseCategory })[]>;
  getExpense(id: number, userId: string): Promise<(Expense & { category: ExpenseCategory }) | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>, userId: string): Promise<Expense>;
  deleteExpense(id: number, userId: string): Promise<void>;
  approveExpense(id: number, approvedBy: string, userId: string): Promise<Expense>;
  rejectExpense(id: number, userId: string): Promise<Expense>;

  // Imprest Funds
  getImprestFunds(userId: string): Promise<ImprestFund[]>;
  getImprestFund(id: number, userId: string): Promise<ImprestFund | undefined>;
  createImprestFund(fund: InsertImprestFund): Promise<ImprestFund>;
  updateImprestFund(id: number, fund: Partial<InsertImprestFund>, userId: string): Promise<ImprestFund>;
  deleteImprestFund(id: number, userId: string): Promise<void>;

  // Imprest Transactions
  getImprestTransactions(imprestId: number, userId: string): Promise<ImprestTransaction[]>;
  createImprestTransaction(transaction: InsertImprestTransaction): Promise<ImprestTransaction>;
  
  // Accounting Reports
  getAccountingReports(userId: string): Promise<AccountingReport[]>;
  createAccountingReport(report: InsertAccountingReport): Promise<AccountingReport>;
  deleteAccountingReport(id: number, userId: string): Promise<void>;

  // Accounting Statistics
  getAccountingStats(userId: string): Promise<{
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    totalImprestFunds: number;
    activeImprestFunds: number;
    monthlyExpensesByCategory: { category: string; amount: number }[];
    recentExpenses: (Expense & { category: ExpenseCategory })[];
  }>;

  // Cash Book operations
  getCashBookEntries(userId: string): Promise<CashBookEntry[]>;
  getCashBookEntry(id: number, userId: string): Promise<CashBookEntry | undefined>;
  createCashBookEntry(data: InsertCashBookEntry): Promise<CashBookEntry>;
  updateCashBookEntry(id: number, data: Partial<InsertCashBookEntry>, userId: string): Promise<CashBookEntry>;
  deleteCashBookEntry(id: number, userId: string): Promise<void>;
  reconcileCashBookEntry(id: number, userId: string): Promise<CashBookEntry>;

  // Petty Cash operations
  getPettyCashEntries(userId: string): Promise<PettyCashEntry[]>;
  getPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry | undefined>;
  createPettyCashEntry(data: InsertPettyCashEntry): Promise<PettyCashEntry>;
  updatePettyCashEntry(id: number, data: Partial<InsertPettyCashEntry>, userId: string): Promise<PettyCashEntry>;
  approvePettyCashEntry(id: number, approvedBy: string, userId: string): Promise<PettyCashEntry>;
  rejectPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry>;
  deletePettyCashEntry(id: number, userId: string): Promise<void>;

  // Transaction Journal operations
  getTransactionJournal(userId: string, filters?: any): Promise<TransactionJournal[]>;
  addToTransactionJournal(data: InsertTransactionJournal): Promise<TransactionJournal>;
  getTransactionJournalEntry(id: number, userId: string): Promise<TransactionJournal | undefined>;

  // Financial Dashboard
  getFinancialDashboardData(userId: string): Promise<any>;

  // Revenue operations
  getRevenueCategories(userId: string): Promise<RevenueCategory[]>;
  getRevenueCategory(id: number, userId: string): Promise<RevenueCategory | undefined>;
  createRevenueCategory(category: InsertRevenueCategory): Promise<RevenueCategory>;
  updateRevenueCategory(id: number, category: Partial<InsertRevenueCategory>, userId: string): Promise<RevenueCategory>;
  deleteRevenueCategory(id: number, userId: string): Promise<void>;

  getRevenues(userId: string): Promise<(Revenue & { category: RevenueCategory })[]>;
  getRevenue(id: number, userId: string): Promise<Revenue | undefined>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  updateRevenue(id: number, revenue: Partial<InsertRevenue>, userId: string): Promise<Revenue>;
  deleteRevenue(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createLocalUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSettings(id: string, settings: { currency?: string; language?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setUserLicenseActivated(id: string, activated: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ licenseActivated: activated, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }



  // Client operations
  async getClients(userId: string): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number, userId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>, userId: string): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number, userId: string): Promise<void> {
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
  }

  async searchClients(userId: string, query: string): Promise<Client[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(clients)
      .where(and(
        eq(clients.userId, userId),
        or(
          like(sql`LOWER(${clients.name})`, searchTerm),
          like(sql`LOWER(${clients.email})`, searchTerm),
          like(sql`LOWER(${clients.company})`, searchTerm)
        )
      ))
      .orderBy(desc(clients.createdAt))
      .limit(10);
  }

  // Product operations
  async getProducts(userId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number, userId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.userId, userId)));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, userId: string): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(and(eq(products.id, id), eq(products.userId, userId)))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: string): Promise<void> {
    await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)));
  }

  async searchProducts(userId: string, query: string): Promise<Product[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(products)
      .where(and(
        eq(products.userId, userId),
        or(
          like(sql`LOWER(${products.name})`, searchTerm),
          like(sql`LOWER(${products.description})`, searchTerm)
        )
      ))
      .orderBy(desc(products.createdAt))
      .limit(10);
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId)).orderBy(desc(categories.createdAt));
  }

  async getCategory(id: number, userId: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>, userId: string): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: string): Promise<void> {
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Invoice operations
  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number, userId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    return invoice;
  }

  async getInvoiceWithItems(id: number, userId: string): Promise<(Invoice & { items: InvoiceItem[]; client: Client }) | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!invoice) return undefined;

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    return {
      ...invoice.invoices,
      items,
      client: invoice.clients!,
    };
  }

  async createInvoice(invoice: InsertInvoice, items: Omit<InsertInvoiceItem, 'invoiceId'>[]): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoiceId: newInvoice.id,
      }));
      await db.insert(invoiceItems).values(itemsWithInvoiceId);

      // Update stock immediately after creating invoice
      await this.updateStockAfterInvoiceCreation(itemsWithInvoiceId, invoice.userId);
      
      // If the invoice is created with 'payee' status, create sales records immediately
      if (invoice.status === 'payee' || invoice.status === 'paid') {
        await this.createSalesFromInvoice(newInvoice.id, invoice.userId);
      }
    }

    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>, userId: string): Promise<Invoice> {
    // Get the current invoice before updating
    const currentInvoice = await this.getInvoice(id, userId);
    
    const [updatedInvoice] = await db
      .update(invoices)
      .set(invoice)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    // If the status changed to 'payee' (or old 'paid'), create sales records
    if ((invoice.status === 'payee' || invoice.status === 'paid') && 
        currentInvoice?.status !== 'payee' && currentInvoice?.status !== 'paid') {
      await this.createSalesFromInvoice(id, userId);
    }

    return updatedInvoice;
  }

  // Helper function to update stock after invoice creation
  private async updateStockAfterInvoiceCreation(items: InsertInvoiceItem[], userId: string): Promise<void> {
    // Update stock for each product (prevent negative stock)
    for (const item of items.filter(item => item.productId)) {
      await db
        .update(products)
        .set({
          stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`
        })
        .where(and(
          eq(products.id, item.productId!),
          eq(products.userId, userId)
        ));
    }
  }

  // Helper function to create sales from invoice items
  private async createSalesFromInvoice(invoiceId: number, userId: string): Promise<void> {
    // Get invoice items
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    
    // Create sales records for each item and update stock
    const salesData = items
      .filter(item => item.productId) // Only create sales for items with productId
      .map(item => ({
        invoiceId: invoiceId,
        productId: item.productId!,
        quantity: item.quantity,
        unitPrice: item.priceHT,
        total: item.totalHT,
        userId: userId,
      }));

    if (salesData.length > 0) {
      // Insert sales records
      await db.insert(sales).values(salesData);
      
      // Update stock for each product (prevent negative stock)
      for (const item of items.filter(item => item.productId)) {
        await db
          .update(products)
          .set({
            stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`
          })
          .where(and(
            eq(products.id, item.productId!),
            eq(products.userId, userId)
          ));
      }
    }
  }

  async deleteInvoice(id: number, userId: string): Promise<void> {
    // First delete sales records associated with this invoice
    await db.delete(sales).where(eq(sales.invoiceId, id));
    // Then delete invoice items
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    // Finally delete the invoice
    await db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  }

  // Sales operations
  async getSales(userId: string): Promise<Sale[]> {
    return db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.createdAt));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    revenue: number;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    recentInvoices: (Invoice & { client: Client })[];
    topProducts: (Product & { salesCount: number })[];
    lowStockProducts: Product[];
    revenueGrowth: number;
    invoiceGrowth: number;
    clientGrowth: number;
    recentInvoiceCount: number;
    recentClientCount: number;
  }> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    // Current revenue (sum of all paid invoices)
    const revenueResult = await db
      .select({ total: sum(invoices.totalTTC) })
      .from(invoices)
      .where(and(eq(invoices.userId, userId), eq(invoices.status, "payee")));
    
    const revenue = parseFloat(revenueResult[0]?.total || "0");

    // Previous month revenue for comparison
    const lastMonthRevenueResult = await db
      .select({ total: sum(invoices.totalTTC) })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId), 
        eq(invoices.status, "payee"),
        sql`${invoices.createdAt} >= ${lastMonth.toISOString()}`,
        sql`${invoices.createdAt} < ${thisMonth.toISOString()}`
      ));
    
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult[0]?.total || "0");
    const revenueGrowth = lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Total invoice count
    const invoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.userId, userId));
    
    const invoiceCount = invoiceCountResult[0]?.count || 0;

    // Recent invoices (this week)
    const recentInvoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`${invoices.createdAt} >= ${thisWeek.toISOString()}`
      ));
    
    const recentInvoiceCount = recentInvoiceCountResult[0]?.count || 0;

    // Previous week invoice count for comparison
    const lastWeekInvoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`${invoices.createdAt} >= ${lastWeek.toISOString()}`,
        sql`${invoices.createdAt} < ${thisWeek.toISOString()}`
      ));
    
    const lastWeekInvoiceCount = lastWeekInvoiceCountResult[0]?.count || 0;
    const invoiceGrowth = lastWeekInvoiceCount > 0 ? ((recentInvoiceCount - lastWeekInvoiceCount) / lastWeekInvoiceCount) * 100 : 0;

    // Total client count
    const clientCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.userId, userId));
    
    const clientCount = clientCountResult[0]?.count || 0;

    // Recent clients (this month)
    const recentClientCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(
        eq(clients.userId, userId),
        sql`${clients.createdAt} >= ${thisMonth.toISOString()}`
      ));
    
    const recentClientCount = recentClientCountResult[0]?.count || 0;

    // Previous month client count for comparison
    const lastMonthClientCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(
        eq(clients.userId, userId),
        sql`${clients.createdAt} >= ${lastMonth.toISOString()}`,
        sql`${clients.createdAt} < ${thisMonth.toISOString()}`
      ));
    
    const lastMonthClientCount = lastMonthClientCountResult[0]?.count || 0;
    const clientGrowth = lastMonthClientCount > 0 ? ((recentClientCount - lastMonthClientCount) / lastMonthClientCount) * 100 : 0;

    // Product count
    const productCountResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.userId, userId));
    
    const productCount = productCountResult[0]?.count || 0;

    // Recent invoices with client info
    const recentInvoices = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    const recentInvoicesFormatted = recentInvoices.map(row => ({
      ...row.invoices,
      client: row.clients!,
    }));

    // Top products by sales quantity
    const topProductsResult = await db
      .select({
        product: products,
        salesCount: sum(sales.quantity),
      })
      .from(products)
      .leftJoin(sales, eq(products.id, sales.productId))
      .where(eq(products.userId, userId))
      .groupBy(products.id)
      .orderBy(desc(sum(sales.quantity)))
      .limit(5);

    const topProducts = topProductsResult
      .map(row => ({
        ...row.product,
        salesCount: parseInt(row.salesCount || "0"),
      }))
      .sort((a, b) => b.salesCount - a.salesCount); // Ensure proper sorting by sales count

    // Low stock products (stock < 10)
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.userId, userId), eq(products.stock, 0)))
      .limit(10);

    return {
      revenue,
      invoiceCount,
      clientCount,
      productCount,
      recentInvoices: recentInvoicesFormatted,
      topProducts,
      lowStockProducts,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      invoiceGrowth: Math.round(invoiceGrowth * 100) / 100,
      clientGrowth: Math.round(clientGrowth * 100) / 100,
      recentInvoiceCount,
      recentClientCount,
    };
  }

  // License operations
  async getLicenseByKey(key: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.key, key));
    return license;
  }

  async getAllLicenses(): Promise<License[]> {
    return db.select().from(licenses).orderBy(desc(licenses.createdAt));
  }

  async createLicense(licenseData: InsertLicense): Promise<License> {
    const [license] = await db.insert(licenses).values(licenseData).returning();
    return license;
  }

  async activateLicense(key: string, clientName?: string, deviceId?: string): Promise<License> {
    const [license] = await db
      .update(licenses)
      .set({
        activated: true,
        clientName,
        deviceId,
        activatedAt: new Date(),
      })
      .where(eq(licenses.key, key))
      .returning();
    return license;
  }

  async revokeLicense(key: string): Promise<License> {
    const [license] = await db
      .update(licenses)
      .set({
        activated: false,
        revokedAt: new Date(),
      })
      .where(eq(licenses.key, key))
      .returning();
    return license;
  }

  // Accounting operations implementation

  // Expense Categories
  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId)).orderBy(desc(expenseCategories.createdAt));
  }

  async getExpenseCategory(id: number, userId: string): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)));
    return category;
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [newCategory] = await db.insert(expenseCategories).values(category).returning();
    return newCategory;
  }

  async updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>, userId: string): Promise<ExpenseCategory> {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set(category)
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteExpenseCategory(id: number, userId: string): Promise<void> {
    await db.delete(expenseCategories).where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)));
  }

  // Expenses
  async getExpenses(userId: string): Promise<any[]> {
    return await db
      .select({
        id: expenses.id,
        reference: expenses.reference,
        description: expenses.description,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        imprestId: expenses.imprestId,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          isMajor: expenseCategories.isMajor,
        },
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpense(id: number, userId: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        id: expenses.id,
        reference: expenses.reference,
        description: expenses.description,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        imprestId: expenses.imprestId,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          isMajor: expenseCategories.isMajor,
        },
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    return result;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    // Generate unique reference if not provided
    const reference = expense.reference || `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Create the expense without deducting from imprest fund yet
    const [newExpense] = await db.insert(expenses).values({ ...expense, reference }).returning();
    
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>, userId: string): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(expense)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: number, userId: string): Promise<void> {
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  async approveExpense(id: number, approvedBy: string, userId: string): Promise<Expense> {
    return await db.transaction(async (tx) => {
      // Get the expense details first
      const [expense] = await tx.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
      if (!expense) throw new Error("Dépense introuvable");

      // Update expense status
      const [updatedExpense] = await tx
        .update(expenses)
        .set({ 
          status: 'approved', 
          approvedBy, 
          approvedAt: new Date() 
        })
        .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
        .returning();

      // If linked to an imprest fund, deduct the amount NOW (on approval)
      if (expense.imprestId) {
        // Get current fund balance
        const [fund] = await tx.select().from(imprestFunds).where(eq(imprestFunds.id, expense.imprestId));
        if (!fund) throw new Error("Fonds d'avance introuvable");
        
        const currentBalance = parseFloat(fund.currentBalance);
        const expenseAmount = parseFloat(expense.amount);
        
        if (currentBalance < expenseAmount) {
          throw new Error(`Solde insuffisant. Solde actuel: ${currentBalance} FCFA, Dépense: ${expenseAmount} FCFA`);
        }
        
        const newBalance = currentBalance - expenseAmount;
        
        // Update fund balance
        await tx.update(imprestFunds)
          .set({ currentBalance: newBalance.toString(), updatedAt: new Date() })
          .where(eq(imprestFunds.id, expense.imprestId));
        
        // Create imprest transaction record
        await tx.insert(imprestTransactions).values({
          reference: `ITX-${Date.now()}`,
          imprestId: expense.imprestId,
          type: 'expense',
          amount: expense.amount,
          description: `Dépense approuvée: ${expense.description}`,
          balanceAfter: newBalance.toString(),
          expenseId: expense.id,
          userId: expense.userId,
        });
      }

      // Note: Transaction journal integration removed for now

      return updatedExpense;
    });
  }

  async rejectExpense(id: number, userId: string): Promise<Expense> {
    return await db.transaction(async (tx) => {
      // Get the expense details first
      const [expense] = await tx.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
      if (!expense) throw new Error("Dépense introuvable");

      // Update expense status
      const [updatedExpense] = await tx
        .update(expenses)
        .set({ status: 'rejected' })
        .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
        .returning();

      // If the expense was already approved and linked to an imprest fund, restore the amount
      if (expense.status === 'approved' && expense.imprestId) {
        // Get current fund balance
        const [fund] = await tx.select().from(imprestFunds).where(eq(imprestFunds.id, expense.imprestId));
        if (fund) {
          const currentBalance = parseFloat(fund.currentBalance);
          const expenseAmount = parseFloat(expense.amount);
          const newBalance = currentBalance + expenseAmount;
          
          // Restore fund balance
          await tx.update(imprestFunds)
            .set({ currentBalance: newBalance.toString(), updatedAt: new Date() })
            .where(eq(imprestFunds.id, expense.imprestId));
          
          // Create imprest transaction record for the refund
          await tx.insert(imprestTransactions).values({
            reference: `ITX-${Date.now()}`,
            imprestId: expense.imprestId,
            type: 'refund',
            amount: expense.amount,
            description: `Remboursement dépense rejetée: ${expense.description}`,
            balanceAfter: newBalance.toString(),
            expenseId: expense.id,
            userId: expense.userId,
          });
        }
      }

      return updatedExpense;
    });
  }

  // Imprest Funds
  async getImprestFunds(userId: string): Promise<ImprestFund[]> {
    return db.select().from(imprestFunds).where(eq(imprestFunds.userId, userId)).orderBy(desc(imprestFunds.createdAt));
  }

  async getImprestFund(id: number, userId: string): Promise<ImprestFund | undefined> {
    const [fund] = await db.select().from(imprestFunds).where(and(eq(imprestFunds.id, id), eq(imprestFunds.userId, userId)));
    return fund;
  }

  async createImprestFund(fund: InsertImprestFund): Promise<ImprestFund> {
    // Generate unique reference
    const reference = `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const initialAmount = parseFloat(fund.initialAmount as any);
    const [newFund] = await db.insert(imprestFunds).values({ 
      ...fund, 
      reference,
      initialAmount: initialAmount.toString(),
      currentBalance: initialAmount.toString(),
    }).returning();
    return newFund;
  }

  async updateImprestFund(id: number, fund: Partial<InsertImprestFund>, userId: string): Promise<ImprestFund> {
    const [updatedFund] = await db
      .update(imprestFunds)
      .set({ ...fund, updatedAt: new Date() })
      .where(and(eq(imprestFunds.id, id), eq(imprestFunds.userId, userId)))
      .returning();
    return updatedFund;
  }

  async deleteImprestFund(id: number, userId: string): Promise<void> {
    // First delete related transactions
    await db.delete(imprestTransactions).where(eq(imprestTransactions.imprestId, id));
    // Then delete the fund
    await db.delete(imprestFunds).where(and(eq(imprestFunds.id, id), eq(imprestFunds.userId, userId)));
  }

  // Imprest Transactions
  async getImprestTransactions(imprestId: number, userId: string): Promise<ImprestTransaction[]> {
    return db.select().from(imprestTransactions)
      .where(and(eq(imprestTransactions.imprestId, imprestId), eq(imprestTransactions.userId, userId)))
      .orderBy(desc(imprestTransactions.createdAt));
  }

  async createImprestTransaction(transaction: InsertImprestTransaction): Promise<ImprestTransaction> {
    // Generate unique reference
    const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Get current fund to calculate new balance
    const [fund] = await db.select().from(imprestFunds).where(eq(imprestFunds.id, transaction.imprestId));
    if (!fund) throw new Error("Imprest fund not found");
    
    const currentBalance = parseFloat(fund.currentBalance);
    const transactionAmount = parseFloat(transaction.amount as any);
    
    let newBalance: number;
    if (transaction.type === 'deposit') {
      newBalance = currentBalance + transactionAmount;
    } else {
      newBalance = currentBalance - transactionAmount;
      if (newBalance < 0) throw new Error("Insufficient funds");
    }
    
    // Create transaction
    const [newTransaction] = await db.insert(imprestTransactions).values({
      ...transaction,
      reference,
      amount: transactionAmount.toString(),
      balanceAfter: newBalance.toString(),
    }).returning();
    
    // Update fund balance
    await db.update(imprestFunds)
      .set({ 
        currentBalance: newBalance.toString(),
        updatedAt: new Date() 
      })
      .where(eq(imprestFunds.id, transaction.imprestId));
    
    return newTransaction;
  }

  // Accounting Reports
  async getAccountingReports(userId: string): Promise<AccountingReport[]> {
    return db.select().from(accountingReports).where(eq(accountingReports.userId, userId)).orderBy(desc(accountingReports.createdAt));
  }

  async createAccountingReport(report: InsertAccountingReport): Promise<AccountingReport> {
    const [newReport] = await db.insert(accountingReports).values(report).returning();
    return newReport;
  }

  async deleteAccountingReport(id: number, userId: string): Promise<void> {
    await db.delete(accountingReports).where(and(eq(accountingReports.id, id), eq(accountingReports.userId, userId)));
  }

  // Accounting Statistics
  async getAccountingStats(userId: string): Promise<{
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    totalImprestFunds: number;
    activeImprestFunds: number;
    totalRevenues: number;
    monthlyRevenues: number;
    recentRevenues: number;
    monthlyExpensesByCategory: { category: string; amount: number }[];
    recentExpenses: (Expense & { category: ExpenseCategory })[];
  }> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Total expenses amount
    const totalExpensesResult = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(eq(expenses.userId, userId));
    
    const totalExpenses = parseFloat(totalExpensesResult[0]?.total || "0");

    // Pending expenses count
    const pendingExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.status, "pending")));
    
    const pendingExpenses = pendingExpensesResult[0]?.count || 0;

    // Approved expenses count
    const approvedExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.status, "approved")));
    
    const approvedExpenses = approvedExpensesResult[0]?.count || 0;

    // Total imprest funds amount
    const totalImprestResult = await db
      .select({ total: sum(imprestFunds.currentBalance) })
      .from(imprestFunds)
      .where(eq(imprestFunds.userId, userId));
    
    const totalImprestFunds = parseFloat(totalImprestResult[0]?.total || "0");

    // Active imprest funds count
    const activeImprestResult = await db
      .select({ count: count() })
      .from(imprestFunds)
      .where(and(eq(imprestFunds.userId, userId), eq(imprestFunds.status, "active")));
    
    const activeImprestFunds = activeImprestResult[0]?.count || 0;

    // Monthly expenses by category with imprest fund allocation
    const monthlyExpensesByCategory = await db
      .select({
        category: expenseCategories.name,
        categoryId: expenseCategories.id,
        expenseAmount: sum(expenses.amount),
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(
        eq(expenses.userId, userId),
        sql`${expenses.expenseDate} >= ${thisMonth.toISOString()}`
      ))
      .groupBy(expenseCategories.name, expenseCategories.id);

    // Get imprest fund allocations for each category - using MAX to avoid counting the same fund multiple times
    const imprestAllocationByCategory = await db
      .select({
        categoryId: expenseCategories.id,
        category: expenseCategories.name,
        allocatedAmount: sql<string>`MAX(${imprestFunds.initialAmount})`,
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .leftJoin(imprestFunds, eq(expenses.imprestId, imprestFunds.id))
      .where(and(
        eq(expenses.userId, userId),
        isNotNull(expenses.imprestId),
        eq(imprestFunds.status, "active")
      ))
      .groupBy(expenseCategories.id, expenseCategories.name, imprestFunds.id);

    const monthlyExpensesByCategoryFormatted = monthlyExpensesByCategory.map(row => {
      const allocation = imprestAllocationByCategory.find(alloc => 
        alloc.categoryId === row.categoryId
      );
      return {
        category: row.category || 'Sans catégorie',
        amount: parseFloat(row.expenseAmount || "0"),
        allocatedAmount: parseFloat(allocation?.allocatedAmount || "0"),
      };
    });

    // Recent expenses
    const recentExpensesResult = await db
      .select()
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt))
      .limit(5);

    const recentExpenses = recentExpensesResult.map(row => ({
      ...row.expenses,
      category: row.expense_categories!,
    }));

    // Total revenues amount
    const totalRevenuesResult = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(eq(revenues.userId, userId));
    
    const totalRevenues = parseFloat(totalRevenuesResult[0]?.total || "0");

    // Monthly revenues (current month)
    const monthlyRevenuesResult = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(and(
        eq(revenues.userId, userId),
        sql`${revenues.revenueDate} >= ${thisMonth.toISOString()}`
      ));
    
    const monthlyRevenues = parseFloat(monthlyRevenuesResult[0]?.total || "0");

    // Recent revenues count (last 30 days)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentRevenuesResult = await db
      .select({ count: count() })
      .from(revenues)
      .where(and(
        eq(revenues.userId, userId),
        sql`${revenues.revenueDate} >= ${lastMonth.toISOString()}`
      ));
    
    const recentRevenues = recentRevenuesResult[0]?.count || 0;

    return {
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      totalImprestFunds,
      activeImprestFunds,
      totalRevenues,
      monthlyRevenues,
      recentRevenues,
      monthlyExpensesByCategory: monthlyExpensesByCategoryFormatted,
      recentExpenses,
    };
  }

  // ==========================================
  // CASH BOOK OPERATIONS
  // ==========================================
  
  async getCashBookEntries(userId: string): Promise<CashBookEntry[]> {
    return db.select().from(cashBookEntries).where(eq(cashBookEntries.userId, userId)).orderBy(desc(cashBookEntries.date));
  }

  async getCashBookEntry(id: number, userId: string): Promise<CashBookEntry | undefined> {
    const [entry] = await db.select().from(cashBookEntries).where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)));
    return entry;
  }

  async createCashBookEntry(data: InsertCashBookEntry): Promise<CashBookEntry> {
    // Generate unique reference
    const reference = `CB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const [newEntry] = await db.insert(cashBookEntries).values({
      ...data,
      reference,
      date: typeof data.date === 'string' ? data.date : data.date.toISOString().split('T')[0],
    }).returning();

    // Add to transaction journal
    await this.addToTransactionJournal({
      userId: data.userId,
      transactionDate: data.date,
      reference,
      description: data.description,
      sourceModule: 'cash_book',
      sourceId: newEntry.id,
      debitAccount: data.type === 'expense' ? data.account : undefined,
      creditAccount: data.type === 'income' ? data.account : undefined,
      debitAmount: data.type === 'expense' ? data.amount : undefined,
      creditAmount: data.type === 'income' ? data.amount : undefined,
      createdBy: data.userId,
    });

    return newEntry;
  }

  async updateCashBookEntry(id: number, data: Partial<InsertCashBookEntry>, userId: string): Promise<CashBookEntry> {
    const updateData: any = { ...data };
    if (updateData.date instanceof Date) {
      updateData.date = updateData.date.toISOString().split('T')[0];
    }
    
    const [updatedEntry] = await db
      .update(cashBookEntries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async deleteCashBookEntry(id: number, userId: string): Promise<void> {
    await db.delete(cashBookEntries).where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)));
  }

  async reconcileCashBookEntry(id: number, userId: string): Promise<CashBookEntry> {
    const [updatedEntry] = await db
      .update(cashBookEntries)
      .set({
        isReconciled: true,
        reconciledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  // ==========================================
  // PETTY CASH OPERATIONS
  // ==========================================
  
  async getPettyCashEntries(userId: string): Promise<PettyCashEntry[]> {
    return db.select().from(pettyCashEntries).where(eq(pettyCashEntries.userId, userId)).orderBy(desc(pettyCashEntries.date));
  }

  async getPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry | undefined> {
    const [entry] = await db.select().from(pettyCashEntries).where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)));
    return entry;
  }

  async createPettyCashEntry(data: InsertPettyCashEntry): Promise<PettyCashEntry> {
    // Calculate running balance
    const lastEntry = await db
      .select({ runningBalance: pettyCashEntries.runningBalance })
      .from(pettyCashEntries)
      .where(eq(pettyCashEntries.userId, data.userId))
      .orderBy(desc(pettyCashEntries.createdAt))
      .limit(1);

    const lastBalance = parseFloat(lastEntry[0]?.runningBalance || "0");
    const newBalance = lastBalance - parseFloat(data.amount);

    const [newEntry] = await db.insert(pettyCashEntries).values({
      ...data,
      date: typeof data.date === 'string' ? data.date : data.date.toISOString().split('T')[0],
    }).returning();

    return newEntry;
  }

  async updatePettyCashEntry(id: number, data: Partial<InsertPettyCashEntry>, userId: string): Promise<PettyCashEntry> {
    const updateData: any = { ...data };
    if (updateData.date instanceof Date) {
      updateData.date = updateData.date.toISOString().split('T')[0];
    }
    
    const [updatedEntry] = await db
      .update(pettyCashEntries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async approvePettyCashEntry(id: number, approvedBy: string, userId: string): Promise<PettyCashEntry> {
    const [updatedEntry] = await db
      .update(pettyCashEntries)
      .set({
        status: 'approved',
        approvedBy,
        updatedAt: new Date(),
      })
      .where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)))
      .returning();

    if (updatedEntry) {
      // Add to transaction journal
      await this.addToTransactionJournal({
        userId,
        transactionDate: new Date(updatedEntry.date),
        reference: `PC-${updatedEntry.id}`,
        description: updatedEntry.description,
        sourceModule: 'petty_cash',
        sourceId: updatedEntry.id,
        debitAccount: 'petty_cash_expense',
        creditAccount: 'petty_cash',
        debitAmount: updatedEntry.amount,
        creditAmount: updatedEntry.amount,
        createdBy: approvedBy,
      });
    }

    return updatedEntry;
  }

  async rejectPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry> {
    const [updatedEntry] = await db
      .update(pettyCashEntries)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async deletePettyCashEntry(id: number, userId: string): Promise<void> {
    await db.delete(pettyCashEntries).where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)));
  }

  // ==========================================
  // TRANSACTION JOURNAL OPERATIONS
  // ==========================================
  
  async getTransactionJournal(userId: string, filters?: any): Promise<TransactionJournal[]> {
    const conditions = [eq(transactionJournal.userId, userId)];

    if (filters?.startDate) {
      conditions.push(gte(transactionJournal.transactionDate, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      conditions.push(lte(transactionJournal.transactionDate, new Date(filters.endDate)));
    }
    if (filters?.sourceModule) {
      conditions.push(eq(transactionJournal.sourceModule, filters.sourceModule));
    }

    return await db
      .select()
      .from(transactionJournal)
      .where(and(...conditions))
      .orderBy(desc(transactionJournal.entryDate));
  }

  async addToTransactionJournal(data: InsertTransactionJournal): Promise<TransactionJournal> {
    const [newEntry] = await db.insert(transactionJournal).values(data).returning();
    return newEntry;
  }

  async getTransactionJournalEntry(id: number, userId: string): Promise<TransactionJournal | undefined> {
    const [entry] = await db
      .select()
      .from(transactionJournal)
      .where(and(eq(transactionJournal.id, id), eq(transactionJournal.userId, userId)));
    return entry;
  }

  // ==========================================
  // FINANCIAL DASHBOARD OPERATIONS
  // ==========================================
  
  async getFinancialDashboardData(userId: string) {
    try {
      // Cash flow summary
      const cashFlowResult = await db
        .select({
          type: cashBookEntries.type,
          total: sum(cashBookEntries.amount),
        })
        .from(cashBookEntries)
        .where(and(
          eq(cashBookEntries.userId, userId),
          sql`${cashBookEntries.date} >= date_trunc('month', current_date)`
        ))
        .groupBy(cashBookEntries.type);

      // Account balances
      const accountBalances = await db
        .select({
          account: cashBookEntries.account,
          balance: sum(sql`CASE WHEN ${cashBookEntries.type} = 'income' THEN ${cashBookEntries.amount} ELSE -${cashBookEntries.amount} END`),
        })
        .from(cashBookEntries)
        .where(eq(cashBookEntries.userId, userId))
        .groupBy(cashBookEntries.account);

      // Recent transactions
      const recentTransactions = await db
        .select()
        .from(transactionJournal)
        .where(eq(transactionJournal.userId, userId))
        .orderBy(desc(transactionJournal.entryDate))
        .limit(10);

      // Petty cash summary
      const pettyCashSummary = await db
        .select({
          status: pettyCashEntries.status,
          count: count(),
          total: sum(pettyCashEntries.amount),
        })
        .from(pettyCashEntries)
        .where(and(
          eq(pettyCashEntries.userId, userId),
          sql`${pettyCashEntries.date} >= date_trunc('month', current_date)`
        ))
        .groupBy(pettyCashEntries.status);

      return {
        cashFlow: cashFlowResult.map(c => ({
          type: c.type,
          total: parseFloat(c.total || "0")
        })),
        accountBalances: accountBalances.map(a => ({
          account: a.account,
          balance: parseFloat(a.balance || "0")
        })),
        recentTransactions,
        pettyCashSummary: pettyCashSummary.map(p => ({
          status: p.status,
          count: p.count,
          total: parseFloat(p.total || "0")
        }))
      };
    } catch (error) {
      console.error("Error getting financial dashboard data:", error);
      throw error;
    }
  }

  // ==========================================
  // REVENUE OPERATIONS
  // ==========================================

  async getRevenueCategories(userId: string): Promise<RevenueCategory[]> {
    return await db
      .select()
      .from(revenueCategories)
      .where(eq(revenueCategories.userId, userId))
      .orderBy(desc(revenueCategories.createdAt));
  }

  async getRevenueCategory(id: number, userId: string): Promise<RevenueCategory | undefined> {
    const [category] = await db
      .select()
      .from(revenueCategories)
      .where(and(eq(revenueCategories.id, id), eq(revenueCategories.userId, userId)));
    return category;
  }

  async createRevenueCategory(categoryData: InsertRevenueCategory): Promise<RevenueCategory> {
    const [category] = await db
      .insert(revenueCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateRevenueCategory(id: number, categoryData: Partial<InsertRevenueCategory>, userId: string): Promise<RevenueCategory> {
    const [category] = await db
      .update(revenueCategories)
      .set(categoryData)
      .where(and(eq(revenueCategories.id, id), eq(revenueCategories.userId, userId)))
      .returning();
    return category;
  }

  async deleteRevenueCategory(id: number, userId: string): Promise<void> {
    await db
      .delete(revenueCategories)
      .where(and(eq(revenueCategories.id, id), eq(revenueCategories.userId, userId)));
  }

  async getRevenues(userId: string): Promise<(Revenue & { category: RevenueCategory })[]> {
    return await db
      .select({
        id: revenues.id,
        reference: revenues.reference,
        description: revenues.description,
        amount: revenues.amount,
        categoryId: revenues.categoryId,
        revenueDate: revenues.revenueDate,
        paymentMethod: revenues.paymentMethod,
        source: revenues.source,
        receiptUrl: revenues.receiptUrl,
        notes: revenues.notes,
        userId: revenues.userId,
        createdAt: revenues.createdAt,
        category: {
          id: revenueCategories.id,
          name: revenueCategories.name,
          description: revenueCategories.description,
          userId: revenueCategories.userId,
          createdAt: revenueCategories.createdAt,
        },
      })
      .from(revenues)
      .leftJoin(revenueCategories, eq(revenues.categoryId, revenueCategories.id))
      .where(eq(revenues.userId, userId))
      .orderBy(desc(revenues.createdAt)) as (Revenue & { category: RevenueCategory })[];
  }

  async getRevenue(id: number, userId: string): Promise<Revenue | undefined> {
    const [revenue] = await db
      .select()
      .from(revenues)
      .where(and(eq(revenues.id, id), eq(revenues.userId, userId)));
    return revenue;
  }

  async createRevenue(revenueData: InsertRevenue): Promise<Revenue> {
    const reference = `REV-${Date.now()}`;
    const [revenue] = await db
      .insert(revenues)
      .values({
        ...revenueData,
        reference,
      })
      .returning();
    return revenue;
  }

  async updateRevenue(id: number, revenueData: Partial<InsertRevenue>, userId: string): Promise<Revenue> {
    const [revenue] = await db
      .update(revenues)
      .set(revenueData)
      .where(and(eq(revenues.id, id), eq(revenues.userId, userId)))
      .returning();
    return revenue;
  }

  async deleteRevenue(id: number, userId: string): Promise<void> {
    await db
      .delete(revenues)
      .where(and(eq(revenues.id, id), eq(revenues.userId, userId)));
  }

}

export const storage = new DatabaseStorage();

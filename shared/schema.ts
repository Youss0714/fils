import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - for local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),

  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 255 }),
  address: text("address"),
  businessType: varchar("business_type", { length: 255 }),
  currency: varchar("currency", { length: 10 }).default("XOF"), // XOF ou GHS
  language: varchar("language", { length: 10 }).default("fr"), // fr ou en
  licenseActivated: boolean("license_activated").default(false), // Licence activée pour cet utilisateur
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  company: varchar("company", { length: 255 }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceHT: decimal("price_ht", { precision: 10, scale: 2 }).notNull(), // Prix HT uniquement
  stock: integer("stock").default(0),
  alertStock: integer("alert_stock").default(10), // Seuil d'alerte pour le stock
  categoryId: integer("category_id").references(() => categories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 50 }).notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  status: varchar("status", { length: 50 }).notNull().default("en_attente"), // en_attente, payee, partiellement_reglee
  totalHT: decimal("total_ht", { precision: 10, scale: 2 }).notNull(), // Total HT
  tvaRate: decimal("tva_rate", { precision: 5, scale: 2 }).notNull(), // Taux TVA choisi (3%, 5%, 10%, 15%, 18%, 21%)
  totalTVA: decimal("total_tva", { precision: 10, scale: 2 }).notNull(), // Montant TVA calculé
  totalTTC: decimal("total_ttc", { precision: 10, scale: 2 }).notNull(), // Total TTC final
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  productId: integer("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  priceHT: decimal("price_ht", { precision: 10, scale: 2 }).notNull(), // Prix HT unitaire
  totalHT: decimal("total_ht", { precision: 10, scale: 2 }).notNull(), // Total HT ligne (quantity * priceHT)
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Licenses table for activation system
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  activated: boolean("activated").default(false),
  clientName: varchar("client_name", { length: 255 }),
  deviceId: varchar("device_id", { length: 255 }),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  activatedAt: timestamp("activated_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accounting module tables
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isMajor: boolean("is_major").default(false), // true for major expenses, false for minor
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull(), // Référence unique
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  expenseDate: timestamp("expense_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, bank_transfer, check, card
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, paid, rejected
  receiptUrl: varchar("receipt_url", { length: 500 }), // URL du reçu/justificatif
  notes: text("notes"),
  imprestId: integer("imprest_id").references(() => imprestFunds.id), // Lien vers le fonds d'avance
  userId: varchar("user_id").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const imprestFunds = pgTable("imprest_funds", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull().unique(),
  accountHolder: varchar("account_holder", { length: 255 }).notNull(), // Détenteur du compte
  initialAmount: decimal("initial_amount", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(), // Objectif du fonds
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended, closed
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const imprestTransactions = pgTable("imprest_transactions", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull(),
  imprestId: integer("imprest_id").notNull().references(() => imprestFunds.id),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdrawal, expense
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  expenseId: integer("expense_id").references(() => expenses.id), // Lié à une dépense si applicable
  receiptUrl: varchar("receipt_url", { length: 500 }),
  notes: text("notes"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountingReports = pgTable("accounting_reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // expense_summary, imprest_summary, monthly_report, yearly_report
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  data: jsonb("data").notNull(), // Données du rapport en JSON
  generatedBy: varchar("generated_by").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Main Cash Book - Transactions principales (revenus, achats, transferts)
export const cashBookEntries = pgTable("cash_book_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reference: varchar("reference", { length: 100 }).notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income', 'expense', 'transfer'
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  account: varchar("account", { length: 100 }).notNull(), // Compte concerné
  counterparty: varchar("counterparty", { length: 255 }), // Contrepartie
  category: varchar("category", { length: 100 }),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  notes: text("notes"),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledAt: timestamp("reconciled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Petty Cash - Petites dépenses quotidiennes avec justificatifs
export const pettyCashEntries = pgTable("petty_cash_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  recipient: varchar("recipient", { length: 255 }),
  purpose: text("purpose"),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  approvedBy: varchar("approved_by").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'approved', 'rejected'
  justification: text("justification"), // Justificatifs attachés
  runningBalance: decimal("running_balance", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction Journal - Historique complet des opérations avec filtres
export const transactionJournal = pgTable("transaction_journal", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  reference: varchar("reference", { length: 100 }).notNull(),
  description: text("description").notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(), // 'cash_book', 'petty_cash', 'expenses', 'imprest'
  sourceId: integer("source_id").notNull(), // ID de l'enregistrement source
  debitAccount: varchar("debit_account", { length: 100 }),
  creditAccount: varchar("credit_account", { length: 100 }),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
});



// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  products: many(products),
  categories: many(categories),
  invoices: many(invoices),
  sales: many(sales),
  expenseCategories: many(expenseCategories),
  expenses: many(expenses),
  imprestFunds: many(imprestFunds),
  imprestTransactions: many(imprestTransactions),
  accountingReports: many(accountingReports),
  cashBookEntries: many(cashBookEntries),
  pettyCashEntries: many(pettyCashEntries),
  transactionJournal: many(transactionJournal),

}));

export const licensesRelations = relations(licenses, ({ }) => ({}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  products: many(products),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  invoiceItems: many(invoiceItems),
  sales: many(sales),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
  sales: many(sales),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [sales.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
}));

// Accounting relations
export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [expenseCategories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),

  imprestFund: one(imprestFunds, {
    fields: [expenses.imprestId],
    references: [imprestFunds.id],
  }),
  approver: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
  }),
}));

export const imprestFundsRelations = relations(imprestFunds, ({ one, many }) => ({
  user: one(users, {
    fields: [imprestFunds.userId],
    references: [users.id],
  }),
  transactions: many(imprestTransactions),
}));

export const imprestTransactionsRelations = relations(imprestTransactions, ({ one }) => ({
  user: one(users, {
    fields: [imprestTransactions.userId],
    references: [users.id],
  }),
  imprestFund: one(imprestFunds, {
    fields: [imprestTransactions.imprestId],
    references: [imprestFunds.id],
  }),
  expense: one(expenses, {
    fields: [imprestTransactions.expenseId],
    references: [expenses.id],
  }),
}));

export const accountingReportsRelations = relations(accountingReports, ({ one }) => ({
  user: one(users, {
    fields: [accountingReports.userId],
    references: [users.id],
  }),
  generatedBy: one(users, {
    fields: [accountingReports.generatedBy],
    references: [users.id],
  }),
}));

export const cashBookEntriesRelations = relations(cashBookEntries, ({ one }) => ({
  user: one(users, {
    fields: [cashBookEntries.userId],
    references: [users.id],
  }),

}));

export const pettyCashEntriesRelations = relations(pettyCashEntries, ({ one }) => ({
  user: one(users, {
    fields: [pettyCashEntries.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [pettyCashEntries.approvedBy],
    references: [users.id],
  }),
}));

export const transactionJournalRelations = relations(transactionJournal, ({ one }) => ({
  user: one(users, {
    fields: [transactionJournal.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [transactionJournal.createdBy],
    references: [users.id],
  }),
}));



// Tax rates available for invoices
export const TAX_RATES = [
  { value: "3.00", label: "3%" },
  { value: "5.00", label: "5%" },
  { value: "10.00", label: "10%" },
  { value: "15.00", label: "15%" },
  { value: "18.00", label: "18%" },
  { value: "21.00", label: "21%" },
] as const;

// Invoice status options
export const INVOICE_STATUS = [
  { value: "en_attente", label: "En attente", icon: "⏳", color: "bg-yellow-100 text-yellow-800" },
  { value: "payee", label: "Payée", icon: "✅", color: "bg-green-100 text-green-800" },
  { value: "partiellement_reglee", label: "Partiellement réglée", icon: "💳", color: "bg-blue-100 text-blue-800" },
] as const;

// Accounting constants
export const EXPENSE_STATUS = [
  { value: "pending", label: "En attente", icon: "⏳", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approuvée", icon: "✅", color: "bg-green-100 text-green-800" },
  { value: "paid", label: "Payée", icon: "💰", color: "bg-blue-100 text-blue-800" },
  { value: "rejected", label: "Rejetée", icon: "❌", color: "bg-red-100 text-red-800" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Espèces", icon: "💵" },
  { value: "bank_transfer", label: "Virement bancaire", icon: "🏦" },
  { value: "check", label: "Chèque", icon: "📝" },
  { value: "card", label: "Carte", icon: "💳" },
] as const;

export const IMPREST_STATUS = [
  { value: "active", label: "Actif", icon: "✅", color: "bg-green-100 text-green-800" },
  { value: "suspended", label: "Suspendu", icon: "⏸️", color: "bg-orange-100 text-orange-800" },
  { value: "closed", label: "Fermé", icon: "🔒", color: "bg-red-100 text-red-800" },
] as const;

export const IMPREST_TRANSACTION_TYPES = [
  { value: "deposit", label: "Dépôt", icon: "⬇️", color: "bg-green-100 text-green-800" },
  { value: "withdrawal", label: "Retrait", icon: "⬆️", color: "bg-blue-100 text-blue-800" },
  { value: "expense", label: "Dépense", icon: "💰", color: "bg-red-100 text-red-800" },
] as const;

export const REPORT_TYPES = [
  { value: "expense_summary", label: "Résumé des dépenses" },
  { value: "imprest_summary", label: "Résumé des avances" },
  { value: "monthly_report", label: "Rapport mensuel" },
  { value: "yearly_report", label: "Rapport annuel" },
] as const;

// Account types for chart of accounts
export const ACCOUNT_TYPES = [
  { value: "asset", label: "Actifs", normalBalance: "debit", icon: "🏢" },
  { value: "liability", label: "Passifs", normalBalance: "credit", icon: "💳" },
  { value: "equity", label: "Capitaux propres", normalBalance: "credit", icon: "💰" },
  { value: "revenue", label: "Revenus", normalBalance: "credit", icon: "📈" },
  { value: "expense", label: "Charges", normalBalance: "debit", icon: "📉" },
] as const;

export const NORMAL_BALANCE_TYPES = [
  { value: "debit", label: "Débit" },
  { value: "credit", label: "Crédit" },
] as const;

// Cash Book constants
export const CASH_BOOK_TYPES = [
  { value: "income", label: "Recette", icon: "⬇️", color: "bg-green-100 text-green-800" },
  { value: "expense", label: "Dépense", icon: "⬆️", color: "bg-red-100 text-red-800" },
  { value: "transfer", label: "Transfert", icon: "↔️", color: "bg-blue-100 text-blue-800" },
] as const;

export const CASH_BOOK_ACCOUNTS = [
  { value: "bank_main", label: "Compte bancaire principal" },
  { value: "bank_secondary", label: "Compte bancaire secondaire" },
  { value: "cash", label: "Caisse" },
  { value: "petty_cash", label: "Petite caisse" },
  { value: "mobile_money", label: "Mobile Money" },
] as const;

// Petty Cash constants
export const PETTY_CASH_STATUS = [
  { value: "pending", label: "En attente", icon: "⏳", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approuvée", icon: "✅", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejetée", icon: "❌", color: "bg-red-100 text-red-800" },
] as const;

export const PETTY_CASH_CATEGORIES = [
  { value: "transport", label: "Transport" },
  { value: "meals", label: "Repas" },
  { value: "office_supplies", label: "Fournitures de bureau" },
  { value: "communication", label: "Communication" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Autres" },
] as const;

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  priceHT: z.string().refine(
    (val) => {
      const price = parseFloat(val);
      return !isNaN(price) && price > 0;
    },
    { message: "Le prix doit être supérieur à 0" }
  ),
  stock: z.number().min(0, "Le stock ne peut pas être négatif"),
  alertStock: z.number().min(1, "Le seuil d'alerte doit être au moins de 1"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
  activatedAt: true,
  revokedAt: true,
});

// Accounting insert schemas
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
}).extend({
  amount: z.string().refine(
    (val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount > 0;
    },
    { message: "Le montant doit être supérieur à 0" }
  ),
  expenseDate: z.string().transform(val => new Date(val)),
});

export const insertImprestFundSchema = createInsertSchema(imprestFunds).omit({
  id: true,
  reference: true,
  currentBalance: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  initialAmount: z.string().refine(
    (val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount > 0;
    },
    { message: "Le montant initial doit être supérieur à 0" }
  ),
});

export const insertImprestTransactionSchema = createInsertSchema(imprestTransactions).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.string().refine(
    (val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount > 0;
    },
    { message: "Le montant doit être supérieur à 0" }
  ),
});

export const insertAccountingReportSchema = createInsertSchema(accountingReports).omit({
  id: true,
  createdAt: true,
}).extend({
  periodStart: z.string().transform(val => new Date(val)),
  periodEnd: z.string().transform(val => new Date(val)),
});

// New modules insert schemas
export const insertCashBookEntrySchema = createInsertSchema(cashBookEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().refine(
    (val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount > 0;
    },
    { message: "Le montant doit être supérieur à 0" }
  ),
  date: z.string().transform(val => new Date(val)),
});

export const insertPettyCashEntrySchema = createInsertSchema(pettyCashEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().refine(
    (val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount > 0;
    },
    { message: "Le montant doit être supérieur à 0" }
  ),
  date: z.string().transform(val => new Date(val)),
});

export const insertTransactionJournalSchema = createInsertSchema(transactionJournal).omit({
  id: true,
  entryDate: true,
}).extend({
  transactionDate: z.string().transform(val => new Date(val)),
  debitAmount: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const amount = parseFloat(val);
      return !isNaN(amount) && amount >= 0;
    },
    { message: "Le montant débit doit être positif" }
  ),
  creditAmount: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const amount = parseFloat(val);
      return !isNaN(amount) && amount >= 0;
    },
    { message: "Le montant crédit doit être positif" }
  ),
});



// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type License = typeof licenses.$inferSelect;

// Accounting types
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ImprestFund = typeof imprestFunds.$inferSelect;
export type ImprestTransaction = typeof imprestTransactions.$inferSelect;
export type AccountingReport = typeof accountingReports.$inferSelect;
export type CashBookEntry = typeof cashBookEntries.$inferSelect;
export type PettyCashEntry = typeof pettyCashEntries.$inferSelect;
export type TransactionJournal = typeof transactionJournal.$inferSelect;


export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

// Accounting insert types
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertImprestFund = z.infer<typeof insertImprestFundSchema>;
export type InsertImprestTransaction = z.infer<typeof insertImprestTransactionSchema>;
export type InsertAccountingReport = z.infer<typeof insertAccountingReportSchema>;
export type InsertCashBookEntry = z.infer<typeof insertCashBookEntrySchema>;
export type InsertPettyCashEntry = z.infer<typeof insertPettyCashEntrySchema>;
export type InsertTransactionJournal = z.infer<typeof insertTransactionJournalSchema>;


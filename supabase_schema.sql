-- YGestion - Complete Database Schema for Supabase
-- Application complète de gestion d'entreprise pour le marché africain
-- Support des devises XOF et GHS, multi-langue (français/anglais)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Session storage table (required for authentication)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Users table - Main user management
CREATE TABLE users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR, -- For local authentication
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    address TEXT,
    business_type VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'XOF', -- XOF or GHS
    language VARCHAR(10) DEFAULT 'fr', -- fr or en
    license_activated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    company VARCHAR(255),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_ht DECIMAL(15,2) NOT NULL, -- Prix HT uniquement
    stock INTEGER DEFAULT 0,
    alert_stock INTEGER DEFAULT 10, -- Seuil d'alerte pour le stock
    category_id INTEGER REFERENCES categories(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    status VARCHAR(50) NOT NULL DEFAULT 'en_attente', -- en_attente, payee, partiellement_reglee
    total_ht DECIMAL(15,2) NOT NULL, -- Total HT
    tva_rate DECIMAL(5,2) NOT NULL, -- Taux TVA choisi (0%, 3%, 5%, 10%, 15%, 18%, 21%)
    total_tva DECIMAL(15,2) NOT NULL, -- Montant TVA calculé
    total_ttc DECIMAL(15,2) NOT NULL, -- Total TTC final
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash', -- cash, bank_transfer, check, card, mobile_money
    due_date TIMESTAMP,
    notes TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price_ht DECIMAL(15,2) NOT NULL, -- Prix HT unitaire
    total_ht DECIMAL(15,2) NOT NULL -- Total HT ligne (quantity * priceHT)
);

-- Sales table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stock replenishments table
CREATE TABLE stock_replenishments (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    cost_per_unit DECIMAL(15,2), -- Coût d'achat par unité
    total_cost DECIMAL(15,2), -- Coût total du réapprovisionnement
    supplier VARCHAR(255), -- Nom du fournisseur
    reference VARCHAR(100), -- Référence de la commande/livraison
    notes TEXT, -- Notes sur le réapprovisionnement
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Licenses table (for activation system)
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    activated BOOLEAN DEFAULT false,
    client_name VARCHAR(255),
    device_id VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    activated_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Business alerts table
CREATE TABLE business_alerts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'low_stock', 'overdue_invoice', 'critical_stock', 'payment_due'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50), -- 'product', 'invoice', 'client'
    entity_id INTEGER, -- ID de l'entité concernée
    metadata JSONB, -- Données additionnelles (stock level, due date, etc.)
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ACCOUNTING MODULE TABLES --

-- Expense categories table
CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_major BOOLEAN DEFAULT false, -- true for major expenses, false for minor
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chart of accounts table
CREATE TABLE chart_of_accounts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    parent_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Imprest funds table
CREATE TABLE imprest_funds (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(100) NOT NULL UNIQUE,
    account_holder VARCHAR(255) NOT NULL, -- Détenteur du compte
    initial_amount DECIMAL(15,2) NOT NULL,
    current_balance DECIMAL(15,2) NOT NULL,
    purpose TEXT NOT NULL, -- Objectif du fonds
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, closed
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(100) NOT NULL, -- Référence unique
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES expense_categories(id),
    account_id INTEGER REFERENCES chart_of_accounts(id), -- Lien vers le plan comptable
    expense_date TIMESTAMP NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, bank_transfer, check, card
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, paid, rejected
    receipt_url VARCHAR(500), -- URL du reçu/justificatif
    notes TEXT,
    imprest_id INTEGER REFERENCES imprest_funds(id), -- Lien vers le fonds d'avance
    user_id VARCHAR NOT NULL REFERENCES users(id),
    approved_by VARCHAR REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Imprest transactions table
CREATE TABLE imprest_transactions (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(100) NOT NULL,
    imprest_id INTEGER NOT NULL REFERENCES imprest_funds(id),
    type VARCHAR(50) NOT NULL, -- deposit, withdrawal, expense
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    expense_id INTEGER REFERENCES expenses(id), -- Lié à une dépense si applicable
    receipt_url VARCHAR(500),
    notes TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Accounting reports table
CREATE TABLE accounting_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- expense_summary, imprest_summary, monthly_report, yearly_report
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    data JSONB NOT NULL, -- Données du rapport en JSON
    generated_by VARCHAR NOT NULL REFERENCES users(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Main Cash Book - Transactions principales (revenus, achats, transferts)
CREATE TABLE cash_book_entries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    reference VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
    amount DECIMAL(12,2) NOT NULL,
    account VARCHAR(100) NOT NULL, -- Compte concerné
    counterparty VARCHAR(255), -- Contrepartie
    category VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL,
    receipt_number VARCHAR(100),
    notes TEXT,
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Petty Cash - Petites dépenses quotidiennes avec justificatifs
CREATE TABLE petty_cash_entries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    recipient VARCHAR(255),
    purpose TEXT,
    receipt_number VARCHAR(50),
    approved_by VARCHAR REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
    justification TEXT, -- Justificatifs attachés
    running_balance DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transaction Journal - Historique complet des opérations avec filtres
CREATE TABLE transaction_journal (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    entry_date TIMESTAMP DEFAULT NOW() NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    reference VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    source_module VARCHAR(50) NOT NULL, -- 'cash_book', 'petty_cash', 'expenses', 'imprest'
    source_id INTEGER NOT NULL, -- ID de l'enregistrement source
    debit_account VARCHAR(100),
    credit_account VARCHAR(100),
    debit_amount DECIMAL(12,2),
    credit_amount DECIMAL(12,2),
    running_balance DECIMAL(12,2),
    created_by VARCHAR NOT NULL REFERENCES users(id)
);

-- Revenue Categories - Catégories de revenus
CREATE TABLE revenue_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Revenues - Enregistrement des revenus
CREATE TABLE revenues (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES revenue_categories(id),
    revenue_date TIMESTAMP NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, bank_transfer, check, card
    source VARCHAR(255), -- Source du revenu (client, vente, service, etc.)
    receipt_url VARCHAR(500),
    notes TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ADDITIONAL INDEXES FOR PERFORMANCE --

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Business logic indexes
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_business_alerts_user_id ON business_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_business_alerts_type ON business_alerts(type);
CREATE INDEX IF NOT EXISTS idx_business_alerts_is_read ON business_alerts(is_read);

-- Accounting indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_imprest_funds_user_id ON imprest_funds(user_id);
CREATE INDEX IF NOT EXISTS idx_imprest_transactions_user_id ON imprest_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_book_entries_user_id ON cash_book_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_entries_user_id ON petty_cash_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_journal_user_id ON transaction_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON revenues(user_id);

-- Date-based indexes for reporting
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_revenues_revenue_date ON revenues(revenue_date);

-- DEFAULT DATA TEMPLATES --
-- Note: These templates will be created when the first user registers
-- The application will automatically create these default categories for each new user

-- Template for default expense categories (created by application logic):
-- 'Frais de bureau', 'Transport', 'Communication', 'Formation', 'Équipement', 
-- 'Maintenance', 'Marketing', 'Salaires', 'Charges sociales', 'Loyer'

-- Template for default revenue categories (created by application logic):
-- 'Ventes de produits', 'Prestations de services', 'Commissions', 'Autres revenus'

-- Template for default chart of accounts - OHADA structure (created by application logic):
-- '411-Clients', '401-Fournisseurs', '421-Personnel', '431-Sécurité Sociale',
-- '512-Banque', '531-Caisse', '701-Ventes', '706-Services', '601-Achats', 
-- '624-Transport', '626-Publicité', '661-Salaires'

-- COMMENTS FOR DOCUMENTATION --

COMMENT ON TABLE users IS 'Table principale des utilisateurs avec profils étendus pour facturation';
COMMENT ON TABLE invoices IS 'Factures avec gestion TVA flexible et multi-devises XOF/GHS';
COMMENT ON TABLE products IS 'Produits avec gestion de stock et alertes automatiques';
COMMENT ON TABLE expenses IS 'Système de gestion des dépenses avec approbation et justificatifs';
COMMENT ON TABLE imprest_funds IS 'Fonds d''avance pour petites dépenses avec suivi des soldes';
COMMENT ON TABLE business_alerts IS 'Système d''alertes métier automatiques (stock, échéances, etc.)';
COMMENT ON TABLE chart_of_accounts IS 'Plan comptable personnalisable basé sur OHADA';

-- TRIGGERS FOR AUTOMATIC UPDATES --

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imprest_funds_updated_at BEFORE UPDATE ON imprest_funds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_book_entries_updated_at BEFORE UPDATE ON cash_book_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petty_cash_entries_updated_at BEFORE UPDATE ON petty_cash_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_alerts_updated_at BEFORE UPDATE ON business_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) SETUP --

-- Enable RLS on all user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_replenishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE imprest_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE imprest_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_book_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you'll need to adjust based on your auth setup)
-- Example: Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can view own categories" ON categories FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own clients" ON clients FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own products" ON products FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own invoices" ON invoices FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own sales" ON sales FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own expenses" ON expenses FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own alerts" ON business_alerts FOR ALL USING (auth.uid()::text = user_id);

-- Note: Adjust these policies based on your specific authentication setup with Supabase Auth

-- END OF SCHEMA --

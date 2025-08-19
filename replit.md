# YGestion - Business Management Application

## Overview
YGestion is a comprehensive business management application for the African market, supporting XOF and GHS currencies. It offers full client, product, category, invoice, and sales management, alongside a complete accounting module. Key capabilities include professional invoice generation with PDF export, real-time business metrics, robust client and product management, and an extensive accounting system covering Main Cash Book, Petty Cash operations, Transaction Journal, and financial reporting. The application also features multi-language support (French and English) and automatic stock management. The project aims to deliver a modern, responsive, and type-safe solution with full financial management for small to medium-sized businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## Migration History
- **August 19, 2025**: Successfully migrated from Replit Agent to Replit environment (completed)
- **August 19, 2025**: Migration to standard Replit environment completed successfully
  - Created PostgreSQL database and deployed complete schema with all tables
  - Fixed all Node.js dependencies and package configurations
  - Verified application startup and all core functionalities working
  - Confirmed proper client-server separation and security architecture
  - All features tested: authentication, dashboard, user management, alerts system
  - Fixed stock replenishment history display issue with proper JSON response parsing
  - Installed all required Node.js dependencies (tsx, express, drizzle-orm, etc.)
  - Created PostgreSQL database with complete schema deployment
  - Fixed invoice creation validation to handle null dueDate values properly
  - Verified all authentication, dashboard, and core business features working
  - Application running stable on port 5000 with proper client/server separation
  - Fixed dashboard recent invoices to display only 4 most recent instead of 5
  - Added pagination system to invoice list (10 items per page)
  - Added pagination system to sales list in "Ventes récentes" section (10 items per page)
  - Enhanced pagination with "First page" and "Last page" navigation buttons
  - Added payment method selection field to invoice creation form with 5 options
  - **Post-Migration Enhancement**: Implemented automatic stock alert generation
    - Stock alerts now generate automatically when creating/updating invoices
    - Stock alerts now generate automatically when creating/updating products
    - Overdue invoice alerts now generate automatically when creating/updating invoices
    - Overdue invoice alerts now generate automatically when fetching alerts (every 30-60s)
    - Overdue invoice alerts now generate automatically when loading dashboard (every 30s)
    - Fixed database date formatting issues preventing overdue alert generation
    - Completely removed need to manually click "Vérifier stocks" or "Vérifier échéances"
    - System now detects invoice due dates automatically and generates alerts in real-time
    - Added notification badge on "Alertes" section in sidebar showing unread alert count
    - Added "Marquer toutes comme lues" button for bulk alert management
    - Optimized alert generation to prevent constant regeneration and duplicate alerts

## Recent Changes
- **August 19, 2025**: Replaced startup logo with new YGestion branding and ultra-professional animations
  - Updated authentication page logo with new YGestion image and rotating gradient border effects
  - Enhanced loading screen with multi-layered animations, floating particles, and sophisticated visual effects
  - Added 3D-style logo presentation with shadows, gradients, and smooth bounce animations
  - Implemented multiple rotating rings and pulsing effects for premium visual experience
- **August 19, 2025**: Applied beautiful gradient background with glassmorphism effects
  - Removed all bg-gray-50 classes across all pages to ensure gradient background visibility
  - Enhanced "Nouveau Client" button with attractive blue gradient styling
  - Fixed background display issues in Settings, Dashboard, Products, Sales, and User Registration pages
  - Applied semi-transparent styling to table headers and hover states for better integration
- **August 17, 2025**: Enhanced UI/UX with detailed loading states and improved business rules
  - Implemented comprehensive loading skeleton system with specialized components for each page
  - Added DashboardSkeleton, InvoiceListSkeleton, ClientListSkeleton, ProductListSkeleton, SalesListSkeleton
  - Enhanced form loading states with InvoiceFormSkeleton and LoadingButton component
  - Replaced basic loading states with detailed, realistic skeleton placeholders
  - Improved loading buttons with spinner animations and status text
  - Fixed invoice creation validation with proper dueDate handling for different statuses
  - Added business rule: dueDate is now required for "en_attente" and "partiellement_reglee" status
  - Created custom validation schema to replace generated schema for better control
- **August 16, 2025**: Fixed invoice sales accounting logic
  - Sales are now created immediately upon invoice creation regardless of payment status
  - Stock is deducted immediately upon invoice creation regardless of payment status
  - Added duplicate prevention for sales records
  - Fixed accounting issue where unpaid invoices were not being counted as sales
  - Dashboard revenue now displays HT (excluding tax) amounts instead of TTC amounts
  - Stock management now reflects physical delivery rather than payment status
  - Added "Aucune (0%)" TVA option for businesses that don't charge VAT

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection Pooling**: Neon serverless pool with WebSocket support

### Key Features and Design Decisions
- **Authentication**: Local Email/Password with Bcrypt, HTTP-only cookies, and secure sessions.
- **Data Models**: Comprehensive models for Users, Clients, Categories, Products, Invoices, and Sales.
- **UI/UX**: Consistent design system using shadcn/ui, responsive layout, React Hook Form with Zod validation, optimistic updates, and toast notifications.
- **Data Flow**: Authenticated client-server communication, Drizzle ORM for type-safe operations, Zod schemas for runtime validation.
- **Invoice System**: Supports 7 configurable VAT rates (including 0% for no tax), PDF export, and automatic sales creation upon payment.
- **Stock Management**: Automatic stock deduction on paid invoices, negative stock protection, customizable alert thresholds, and secure stock modification only through replenishments and sales (direct editing disabled for security).
- **Multi-Currency Support**: Exclusive support for XOF and GHS.
- **Multi-Language**: Full i18n for French and English with language persistence.
- **Dashboard**: Real-time business metrics, revenue growth, and top product statistics.
- **User Profile**: Comprehensive profile editing for personalized contact information on invoices.
- **PDF Generation**: Utilizes jsPDF and html2canvas for robust PDF export.
- **Print Functionality**: Includes print-only CSS styles.
- **Extended Accounting System**: Complete accounting module with Main Cash Book, Petty Cash management, Transaction Journal, comprehensive financial reporting, "Résultat Net" calculation, and proper exclusion of rejected expenses from totals.
- **Advanced Financial Operations**: Automated transaction tracking, approval workflows, reconciliation features, and real-time financial dashboards.
- **Licensing System**: Full license management with activation tracking, admin API, and web interfaces.
- **Chart of Accounts**: Central accounting system integrated with expenses, ensuring proper financial transaction classification.

## External Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth service
- **UI Library**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **PDF Generation**: jsPDF, html2canvas
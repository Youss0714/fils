# YGestion - Business Management Application

## Overview
YGestion is a comprehensive business management application for the African market, supporting XOF and GHS currencies. It offers full client, product, category, invoice, and sales management, alongside a complete accounting module. Key capabilities include professional invoice generation with PDF export, real-time business metrics, robust client and product management, and an extensive accounting system covering Main Cash Book, Petty Cash operations, Transaction Journal, and financial reporting. The application also features multi-language support (French and English) and automatic stock management. The project aims to deliver a modern, responsive, and type-safe solution with full financial management for small to medium-sized businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## Migration History
- **August 17, 2025**: Successfully migrated from Replit Agent to Replit environment
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

## Recent Changes
- **August 17, 2025**: Fixed invoice creation validation and enhanced business rules
  - Corrected Zod schema to properly handle null dueDate values during invoice creation
  - Resolved "400: Failed to create invoice" error when creating invoices with paid status  
  - Enhanced invoice validation to accept null, undefined, and string values for dueDate field
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
- **Stock Management**: Automatic stock deduction on paid invoices, negative stock protection, and customizable alert thresholds.
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
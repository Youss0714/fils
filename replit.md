# YGestion - Business Management Application

## Overview
YGestion is a comprehensive business management application designed for the African market, specifically supporting XOF (Franc CFA) and GHS (Cedi) currencies. Built with React, Express, and PostgreSQL, it provides a complete solution for managing clients, products, categories, invoices, sales, and a full accounting module. Key capabilities include professional invoice generation with PDF export, real-time business metrics, robust client and product management, comprehensive accounting system with expense tracking, imprest management, Main Cash Book, Petty Cash operations, Transaction Journal, and financial reporting, multi-language support (French and English), and automatic stock management. The project aims to offer a modern, responsive, and type-safe solution for small to medium-sized businesses with complete financial management capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
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
- **Authentication**: Local Email/Password with Bcrypt hashing, HTTP-only cookies, and secure sessions.
- **Data Models**: Comprehensive models for Users, Clients, Categories, Products, Invoices, and Sales.
- **UI/UX**: Consistent design system using shadcn/ui, responsive layout, React Hook Form with Zod validation, optimistic updates with React Query, and toast notifications.
- **Data Flow**: Authenticated client-server communication, Drizzle ORM for type-safe database operations, Zod schemas for runtime validation.
- **Invoice System**: Supports 6 configurable VAT rates (3%, 5%, 10%, 15%, 18%, 21%) calculated at the invoice level, PDF export, and automatic sales creation upon payment.
- **Stock Management**: Automatic stock deduction on paid invoices, protection against negative stock, and customizable product alert thresholds.
- **Multi-Currency Support**: Exclusive support for XOF and GHS.
- **Multi-Language**: Full i18n system for French and English, with language selection at startup and persistence.
- **Dashboard**: Real-time business metrics, revenue growth calculation, and top product statistics.
- **User Profile**: Comprehensive profile editing for personalized contact information on invoices.
- **Application Rebranding**: Renamed from GestionPro to YGestion.
- **PDF Generation**: Utilizes jsPDF and html2canvas for robust PDF export.
- **Print Functionality**: Includes print-only CSS styles for clean invoice printing.
- **Extended Accounting System**: Complete accounting module with Main Cash Book, Petty Cash management, Transaction Journal, and comprehensive financial reporting.
- **Advanced Financial Operations**: Automated transaction tracking, approval workflows, reconciliation features, and real-time financial dashboards.

## External Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth service
- **UI Library**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **PDF Generation**: jsPDF, html2canvas

## Fresh Migration Completed (August 14, 2025) 
✓ **Complete Migration**: Successfully migrated YGestion from Replit Agent to standard Replit environment
✓ **Database Setup**: PostgreSQL database provisioned and all tables created using `npm run db:push`
✓ **Application Status**: Running successfully on port 5000 with full functionality
✓ **Dependencies**: All packages properly installed and configured (tsx, express, react, etc.)
✓ **Security Implementation**: Proper client/server separation with secure authentication
✓ **Revenue Total Section**: Enhanced accounting dashboard with revenue totals card showing total revenues and recent revenue count
✓ **TypeScript Fixes**: Resolved interface errors and updated accounting stats API to include revenue data
✓ **Chart of Accounts**: Complete integration with missing chartOfAccounts table and schema
✓ **Migration Verification**: User registration, login, dashboard, and all accounting modules working properly
✓ **Revenue Integration**: Added totalRevenues, monthlyRevenues, and recentRevenues to accounting statistics API

## Previous Migration (August 12, 2025)
✓ **Migration Status**: Successfully completed fresh migration from Replit Agent to standard Replit environment
✓ **Fresh Migration Today**: Re-migrated project successfully with all components working (August 12, 2025)  
✓ **Database Setup**: PostgreSQL database provisioned and schema deployed automatically  
✓ **Application Status**: Running successfully on port 5000 without errors  
✓ **Dependencies**: All packages properly installed and configured (tsx, express, react, etc.)  
✓ **Security Implementation**: Proper client/server separation with secure authentication
✓ **Migration Verification**: Full user registration, profile setup, and module access confirmed
✓ **Bug Fixes**: Resolved Select component value prop issues in expense manager form
✓ **Business Logic Fix**: Imprest fund deduction now occurs only after expense approval (not on creation) - TESTED AND VERIFIED  
✓ **Chart of Accounts Fix**: Fixed API request format issues in chart-of-accounts-manager.tsx
  - Corrected apiRequest function calls to use proper parameter order (method, url, data)
  - Fixed TypeScript errors related to API request structure
  - Resolved Select component value prop issues (empty string to "none")
  - Fixed userId foreign key constraint violation in update operations
  - Improved dialog layout with proper scrolling and button visibility
  - All CRUD operations now fully functional (Create, Read, Update, Delete)
✓ **Trial Balance System**: Fixed API request format in trial-balance-manager.tsx
  - Corrected apiRequest function call to use proper parameter order (method, url, data)
  - Trial balance generation and consultation now fully operational
  - Professional balance display with totals, equilibrium status, and PDF export capability
✓ **Chart of Accounts Integration with Expenses**: Transformed chart of accounts to central accounting system
  - Added accountId field to expenses table for direct linking to chart of accounts
  - Enhanced expense forms to include chart of accounts selection (filtered by expense type)
  - Updated expense displays to show account codes and names alongside categories
  - Modified database queries to include account information in expense listings
  - Plan comptable is now the central hub for all financial transaction classification
✓ **Logo Feature Removed**: Company logo upload functionality completely removed as requested
  - Deleted logo-upload.tsx component
  - Removed logo upload UI from settings page  
  - Deleted API routes for logo management (/api/user/logo)
  - Removed companyLogo field from database schema
  - Cleaned logo references from invoice PDFs and components
✓ **Features Verified**: All business management features functional (dashboard, invoicing, client management)
✓ **License Activation Flow**: Implemented mandatory license activation after user registration
  - Added licenseActivated field to user schema
  - Modified App.tsx to show license activation page for unactivated users
  - Session-based license tracking for immediate activation after registration
  - Auto-association of activated licenses with user accounts on login/register
✓ **Extended Accounting Module Implementation** (August 12, 2025)
  - Complete Main Cash Book system with income/expense tracking and reconciliation
  - Petty Cash management with approval workflow and running balance calculations
  - Transaction Journal with automated entries from all accounting modules
  - Financial Dashboard with real-time cash flow analysis and account balances
  - 3 new database tables: cash_book_entries, petty_cash_entries, transaction_journal
  - 25+ new storage operations with comprehensive API routes
  - Integrated transaction tracking across all financial operations
✓ **Full Accounting Module Functionality Restored** (August 12, 2025)
  - Fixed critical API request parameter order issues across all accounting components
  - Corrected expense creation by adding automatic reference generation (EXP-timestamp)
  - All accounting modules now fully functional: expenses, categories, imprest funds, reports
  - Expense approval/rejection workflow operational
  - Comprehensive error handling and user feedback implemented
  - Added expense details modal with complete information display when clicking eye icon
✓ **PDF and Print Functionality Implemented** (August 12, 2025)
  - Complete PDF generation for expenses and imprest funds using jsPDF and html2canvas
  - Professional print functionality with popup windows and proper formatting
  - French localization for all PDF documents with company information
  - Optimized layouts for A4 printing with proper styling and branding
  - Print and download buttons added to all accounting elements
✓ **Enhanced Accounting Tab Design** (August 12, 2025)
  - Improved tab accessibility with larger click areas and better spacing
  - Added color-coded tabs: red for expenses, blue for imprest funds, green for reports
  - Enhanced visual feedback with hover effects and active states
  - Responsive design with mobile-first approach
✓ **Enhanced User Experience with Cancel Buttons** (August 12, 2025)
  - Added "Annuler" (Cancel) buttons to all creation forms alongside submit buttons
  - Implemented consistent form handling with proper form reset on cancel
  - Applied to expense creation, category creation, imprest fund creation, and transaction forms
  - Improved responsive layout with proper spacing for mobile and desktop
✓ **Pagination System Implementation** (August 12, 2025)
  - Added comprehensive pagination to expense and imprest fund lists to reduce scrolling
  - Implemented 5 items per page for expenses and 3 items per page for imprest funds
  - Responsive pagination controls with "Précédent/Suivant" navigation in French
  - Visual page indicators with active state highlighting
  - Automatic hiding of pagination when items fit on single page
✓ **Bulk Audit Features** (August 12, 2025)
  - Added bulk print functionality for all expenses with professional audit report format
  - Implemented bulk PDF download for comprehensive expense auditing
  - Features include company information, detailed expense breakdown, and financial summary
  - French localization with proper formatting for business use
  - Responsive buttons that appear only when expenses exist
✓ **Bulk Audit Features** (August 12, 2025)
  - Added bulk print functionality for all expenses with professional audit report format
  - Implemented bulk PDF download for comprehensive expense auditing
  - Features include company information, detailed expense breakdown, and financial summary
  - French localization with proper formatting for business use
  - Responsive buttons that appear only when expenses exist

## Licensing System Implementation (August 10, 2025)
✓ **Complete Licensing System**: Full license management system implemented
  - PostgreSQL table for license storage with activation tracking
  - Admin API routes protected by token authentication
  - Public activation API for clients (/api/activate)
  - Web interfaces for activation (public/index.html) and administration (public/admin.html)
  - React components integration with sidebar navigation
✓ **Administrator Change**: License system admin changed to "Youssouphafils"
  - Admin token: youssouphafils-admin-2025
  - Sidebar menu appears for users named "Youssouphafils"
  - All license creation attributed to "Youssouphafils"
  - Admin user "Youssouphafils" bypasses license activation requirements
  - Admin email: youssouphafils@gmail.com
✓ **Security Features**: Token-based admin authentication, unique license keys, revocation capability
✓ **User Experience**: Simple activation flow, comprehensive admin dashboard, real-time status tracking
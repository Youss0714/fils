# YGestion - Business Management Application

## Overview

YGestion is a comprehensive business management application built with React, Express, and PostgreSQL. It provides a complete solution for managing clients, products, categories, invoices, and sales with a modern, responsive interface using shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with proper error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection Pooling**: Neon serverless pool with WebSocket support

## Key Components

### Authentication System
- **Provider**: Local Authentication (Email/Password)
- **Session Storage**: In-memory sessions with express-session
- **User Management**: Local user registration and profile management
- **Security**: Bcrypt password hashing, HTTP-only cookies, secure sessions
- **Features**: User registration, login/logout, profile completion

### Data Models
- **Users**: Profile information and authentication data
- **Clients**: Customer management with contact details
- **Categories**: Product categorization system
- **Products**: Inventory management with pricing and stock
- **Invoices**: Invoice generation with line items
- **Sales**: Sales history and analytics

### UI Architecture
- **Design System**: Consistent shadcn/ui components
- **Layout**: Sidebar navigation with responsive design
- **Forms**: React Hook Form with Zod validation
- **State**: Optimistic updates with React Query
- **Notifications**: Toast notifications for user feedback

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: Replit OAuth → Session creation → User provisioning
2. **API Requests**: Authenticated requests with credential inclusion
3. **Data Fetching**: React Query manages caching and synchronization
4. **Form Submissions**: Optimistic updates with rollback on errors

### Database Operations
1. **Queries**: Drizzle ORM with type-safe operations
2. **Transactions**: Atomic operations for complex business logic
3. **Validation**: Zod schemas for runtime type checking
4. **Relationships**: Foreign key constraints and joins

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth service
- **UI Library**: Radix UI primitives
- **Styling**: Tailwind CSS framework
- **Validation**: Zod for schema validation

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across the stack
- **Linting**: ESLint configuration
- **Development**: Hot module replacement and error overlay

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild creates a single Node.js bundle
- **Assets**: Static files served from dist/public
- **Environment**: Production environment variables

### Development Environment
- **Local**: Concurrent frontend and backend development
- **Database**: Provisioned PostgreSQL instance
- **Authentication**: Replit development environment
- **Hot Reload**: Vite HMR for instant feedback

### Key Features
- **Dashboard**: Real-time business metrics and analytics
- **Client Management**: Complete customer relationship management
- **Product Catalog**: Inventory with categories, pricing, and dynamic VAT rates
- **Invoice System**: Professional invoice generation with PDF export
- **Sales Tracking**: Historical sales data and reporting
- **Multi-Currency Support**: XOF (Franc CFA) and GHS (Cedi) with proper formatting
- **Multi-Language**: French and English interface with complete i18n system
- **Settings Management**: User preferences for currency and language
- **Export/Backup**: Data export functionality for business continuity

## Recent Changes (January 29, 2025)
- **Migration Complete**: Successfully migrated from Replit Agent to standard Replit environment
- **PDF Download Feature**: Implemented functional PDF generation for invoices using jsPDF and html2canvas
- **Database Setup**: PostgreSQL database provisioned and schema deployed successfully
- **Application Running**: Server started on port 5000 with all routes functional
- **Authentication Working**: Local authentication with user registration and profile completion
- **Full CRUD Operations**: All business entities (clients, products, categories, invoices) working properly
- **New Tax Logic Implementation**: TVA now calculated exclusively at invoice level instead of product level
- **Database Schema Restructuring**: Products store only `priceHT` (price excluding tax), removed tax fields from products
- **Dynamic Invoice VAT**: Invoices now support 6 configurable tax rates (3%, 5%, 10%, 15%, 18%, 21%) with proper calculation
- **Backend Validation Fixed**: Updated all validation schemas to work with new tax structure
- **Frontend Tax Calculator**: Added dynamic tax rate selector and real-time total calculation in invoice forms
- **Multi-Currency Support**: Maintained XOF and GHS currency formatting with new tax structure
- **Sales History Fix**: Fixed sales data display issue by implementing automatic sales creation when invoices are marked as "paid"
- **Invoice Detail Page**: Added complete invoice detail view with PDF preview and status management
- **Stock Management**: Implemented automatic stock deduction when invoices are paid, with protection against negative stock
- **Currency Display Fix**: Corrected dashboard invoice amounts to show proper currency formatting (XOF/GHS/EUR)
- **Data Integrity**: Fixed deletion cascade for invoices with associated sales records
- **Stock Management Verification**: Confirmed automatic stock deduction is working correctly across multiple test scenarios
- **Migration to Replit Completed**: Successfully migrated from Replit Agent to standard Replit environment (January 28, 2025)
- **Database Provisioning**: PostgreSQL database created and schema deployed automatically
- **Product Selection Fix**: Resolved invoice form product selection issue by replacing ProductCombobox with SimpleProductSelect component
- **Form Validation Enhancement**: Improved form field updates and validation triggers for invoice creation
- **Alert Stock Feature Added**: Implemented customizable stock alert thresholds for products (January 29, 2025)
  - Added `alertStock` field to products database schema with default value of 10
  - Updated product forms to include alert stock configuration
  - Enhanced stock status logic to use custom alert thresholds instead of fixed values
  - Product cards now display both current stock and alert threshold information
  - Stock status badges now accurately reflect custom alert levels per product
- **Price Validation Enhancement**: Added positive value validation for product prices (January 29, 2025)
  - Enhanced Zod schema validation to require prices greater than 0
  - Added HTML5 min attribute to price input field (min="0.01")
  - Added proper validation messages for negative prices
  - Stock and alert stock fields also validated for non-negative values
- **Euro Currency Removal**: Completely removed Euro currency symbols from application (January 29, 2025)
  - Removed EUR formatting from dashboard, invoices, sales, and PDF components
  - Updated all formatCurrency functions to use only XOF (F CFA) and GHS (GH₵) currencies
  - Replaced Euro icon with TrendingUp icon in sales statistics
  - Application now exclusively supports African currencies (XOF and GHS) as intended
- **Language Translation System Fix**: Implemented proper internationalization system (January 29, 2025)
  - Enhanced useTranslation hook with fallback support for missing translations
  - Updated Dashboard component to use dynamic translations based on user language settings
  - Modified Sidebar component to display translated navigation menu items
  - Applied translations to table headers, status badges, and common UI elements
  - English and French languages now properly applied throughout the application interface
- **Startup Loading Animation**: Added animated splash screen with logo (January 29, 2025)
  - Created LoadingScreen component with animated YGestion logo and progress bar
  - Added smooth fade-in animations and rotating logo elements with CSS keyframes
  - Integrated multi-language support for loading text (English/French)
  - Implemented session-based loading screen display (shows once per session)
  - Enhanced user experience with professional startup animation and branding
  - Fixed animation display logic and set duration to 10 seconds as requested
  - Added proper fade-out transition and improved visibility management
- **Application Rebranding**: Changed application name from GestionPro to YGestion (January 29, 2025)
  - Updated all references in loading screen, sidebar, landing page, auth pages
  - Changed application title throughout the user interface
  - Updated authentication session secret and documentation
  - Maintained all functionality while applying new branding consistently
- **Critical UI Fix: Client and Product Selection Components** (January 30, 2025)
  - Resolved major issue where client and product selection fields were grayed out and non-functional
  - Replaced problematic cmdk-based Command components with simplified Popover-based selection
  - Created SimpleClientSelect and SimpleProductSelectV2 components using direct onClick events
  - Eliminated conflicts between shadcn/ui Command components and form interaction
  - Invoice creation now fully functional with reliable client and product selection
  - Users can successfully create invoices with proper data validation
- **PDF Download and Print Functionality Enhancement** (January 30, 2025)
  - Fixed PDF download functionality in invoice detail pages - now works without authorization prompts
  - Added comprehensive print-only CSS styles to ensure only invoice content prints (not sidebar/navigation)
  - Enhanced PDF generation in invoice list page with direct download buttons
  - Added print functionality to invoice list page with proper invoice-only output
  - Both print and PDF download now work seamlessly from both invoice list and detail pages
  - Print functionality removes all UI elements except invoice content for clean printing
  - Fixed print button navigation issue that was causing full page refresh by replacing window.location.href with wouter navigation
- **Print Dialog Fix**: Fixed print functionality from invoice preview dialog (January 30, 2025)
  - Added CSS print styles to make dialog content visible during printing
  - Fixed issue where printing from "voir" button showed blank page
  - Print functionality now works correctly from both detail page and list view dialog
  - Added print-specific classes to hide dialog headers and show content properly
- **Invoice Contact Information Fix**: Updated invoice footer to use user's email and phone (January 30, 2025)
  - Replaced generic contact email with authenticated user's email and phone number
  - Applied changes to both InvoicePDF component and PDF generation in invoice list
  - Footer now displays personalized contact information for each user
- **Dashboard Top Products Statistics Fix**: Resolved issue where sales statistics weren't updating (January 30, 2025)
  - Fixed automatic sales creation when invoices are created with "payee" status
  - Corrected query to sum quantities sold instead of counting sale records
  - Added missing sales records for existing paid invoices
  - Added JavaScript sorting to ensure proper display order of top products
  - Dashboard now accurately reflects total quantities sold with correct ranking
- **Application Close Button**: Added close application functionality in sidebar (January 30, 2025)
  - Added close button (X icon) next to logout button in user profile section
  - Includes confirmation dialog in both French and English
  - Button changes color to red on hover to indicate close action
  - Tooltip displays appropriate language text for close function
- **Dynamic Performance Indicators**: Replaced static percentages with real calculated data (January 30, 2025)
  - Added revenue growth calculation comparing current vs previous month
  - Added weekly invoice count with actual recent invoice numbers
  - Added monthly client count with actual new client numbers  
  - Performance indicators now reflect true business metrics instead of placeholder values
  - Dashboard shows actual growth percentages or "no previous data" when appropriate
- **Enhanced Settings Page**: Added developer contact and comprehensive user guide (January 30, 2025)
  - Added developer contact section with direct email link (youssouphafils@gmail.com)
  - Created comprehensive user guide with getting started steps
  - Added key features documentation and tips & tricks section
  - Full bilingual support (French/English) for all new content
  - Professional styling with organized sections and visual hierarchy
- **Initial Language Selection**: Added language selector at app startup (January 30, 2025)
  - Created LanguageSelector component with elegant design and flag icons
  - Integrated language selection flow after loading screen and before authentication
  - Added localStorage persistence for language preference across sessions
  - Automatic synchronization between initial language choice and user settings
  - Added reset option in settings to show language selector again
  - Seamless integration with existing internationalization system
- **User Profile Editing**: Added comprehensive profile editing functionality (January 30, 2025)
  - Created ProfileEditor component with complete form fields for user coordinates
  - Added personal information section in settings page with professional styling
  - Integrated form fields for firstName, lastName, phone, company, position, address, and businessType
  - Connected to existing complete-profile API endpoint for seamless data persistence
  - Added full French/English translations for all new profile fields
  - Real-time form validation with proper error handling and success notifications
  - Profile information automatically appears on invoices and business documents

The application follows modern web development best practices with a focus on type safety, user experience, and maintainable code architecture adapted for African markets.
# YGestion - Business Management Application

## Overview
YGestion is a comprehensive business management application designed for the African market, specifically supporting XOF (Franc CFA) and GHS (Cedi) currencies. Built with React, Express, and PostgreSQL, it provides a complete solution for managing clients, products, categories, invoices, and sales. Key capabilities include professional invoice generation with PDF export, real-time business metrics, robust client and product management, multi-language support (French and English), and automatic stock management. The project aims to offer a modern, responsive, and type-safe solution for small to medium-sized businesses.

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

## External Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth service
- **UI Library**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **PDF Generation**: jsPDF, html2canvas

## Migration to Standard Replit Environment (August 10, 2025)
✓ **Migration Status**: Successfully completed migration from Replit Agent  
✓ **Database Setup**: PostgreSQL database provisioned and schema deployed automatically  
✓ **Application Status**: Running successfully on port 5000 without errors  
✓ **Dependencies**: All packages properly installed and configured  
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
✓ **Security Features**: Token-based admin authentication, unique license keys, revocation capability
✓ **User Experience**: Simple activation flow, comprehensive admin dashboard, real-time status tracking
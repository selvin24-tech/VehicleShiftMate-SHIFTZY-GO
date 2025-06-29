# Shiftzy Go - Vehicle Shifting Platform

## Overview

Shiftzy Go is a modern vehicle shifting platform that connects vehicle owners who need to transport their vehicles with travelers looking for driving opportunities. The application facilitates peer-to-peer vehicle transportation with features for booking, tracking, payments, and communication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom responsive typography
- **State Management**: TanStack Query for server state, React Context for local state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **File Structure**: Monorepo with shared types and schemas

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### User Management
- User profiles with ratings and reviews
- Avatar support and verification status
- Address and contact information management

### Vehicle Management
- Multi-type vehicle support (car, bike, SUV, luxury)
- Vehicle ratings and review system
- Photo uploads and registration details
- Rental availability tracking

### Shift Request System
- Location-based pickup and drop-off
- Vehicle type and model selection
- Insurance verification requirements
- Status tracking (pending, approved, in-transit, completed, cancelled)

### Trip Management
- Driver assignment and tracking
- Real-time status updates
- Distance and duration calculations
- Payment integration

### Communication System
- Real-time chat using WebSockets
- Conversation management between users
- Message threading and read status
- Floating chat interface

### Review System
- Dual review system (user and vehicle reviews)
- Multi-criteria rating for vehicles (comfort, cleanliness, performance)
- Average rating calculations
- Review moderation capabilities

### Payment Integration
- Stripe payment processing
- Secure checkout flow
- Payment status tracking
- Refund handling

## Data Flow

1. **User Registration**: New users create profiles with verification
2. **Vehicle Listing**: Owners add vehicles with photos and details
3. **Shift Request**: Users create requests with pickup/drop locations
4. **Matching**: System matches requests with available travelers
5. **Booking**: Travelers book vehicles through secure payment
6. **Communication**: Real-time chat enables coordination
7. **Tracking**: Live tracking during vehicle transport
8. **Completion**: Trip completion triggers payment release and reviews

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **@stripe/stripe-js**: Payment processing
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code for Node.js
- **Database**: Drizzle Kit manages schema migrations

### Environment Configuration
- Development: Local Vite dev server with hot reload
- Production: Express server serving built frontend
- Database: Environment-based connection strings

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Common types and schemas
├── migrations/      # Database migrations
├── dist/           # Production build output
└── attached_assets/ # Design specifications
```

## Recent Changes
- June 29, 2025: Simplified login system - accepts any credentials for development
- June 29, 2025: Created role-based authentication (admin_2025 vs customer users)
- June 29, 2025: Built comprehensive admin dashboard with operational metrics
- June 29, 2025: Replaced platform overview with simple trust indicator showing 4,370+ trusted users
- June 29, 2025: Removed detailed statistics from customer home page for cleaner UX

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
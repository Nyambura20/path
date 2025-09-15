# BrightPath Frontend - React Application

A modern React frontend for the BrightPath educational management platform, featuring a clean green-themed UI with comprehensive student, teacher, and course management capabilities.

## 🚀 Features

- **Authentication System**: JWT-based login/register with automatic token refresh
- **Role-Based Access**: Different interfaces for students, teachers, and administrators
- **Course Management**: Browse, enroll/drop, and manage courses with detailed views
- **User Management**: Comprehensive student and teacher profiles and listings
- **Dashboard**: Personalized dashboards with key metrics and quick actions
- **Responsive Design**: Modern, mobile-friendly UI with Tailwind CSS
- **Green Theme**: Professional green color scheme throughout the application

## 🛠 Tech Stack

- **React 19** - Modern React with hooks and functional components
- **React Router v7** - Client-side routing with protected routes
- **Tailwind CSS v4** - Utility-first CSS framework with custom green theme
- **Axios** - HTTP client with request/response interceptors
- **JWT Authentication** - Secure token-based authentication

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Navigation with role-based menus
│   ├── Footer.js       # Site footer
│   ├── LoadingSpinner.js # Loading indicators
│   └── NotificationContainer.js # Toast notifications
├── pages/              # Main application pages
│   ├── Home.js         # Landing page
│   ├── About.js        # About page
│   ├── Login.js        # Authentication
│   ├── Register.js     # User registration
│   ├── Dashboard.js    # User dashboard
│   ├── Courses.js      # Course listing and management
│   ├── CourseDetail.js # Individual course details
│   ├── Students.js     # Student management
│   ├── Teachers.js     # Teacher management
│   └── NotFound.js     # 404 error page
├── services/           # API and external services
│   └── api.js         # Centralized API client with JWT handling
├── utils/             # Utility functions and contexts
│   ├── AuthContext.js # Authentication state management
│   └── NotificationContext.js # Notification system
├── App.js             # Main app component with routing
├── index.js           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Django backend running on `http://localhost:8000`

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd /home/sarah/brightpath/frontend-new
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   # Edit .env file to change API base URL if needed
   nano .env
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Environment Configuration

The application uses environment variables for configuration:

### Development (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
```

### Production
```env
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

### Build Commands
```bash
# Development build
npm run build

# Production build
npm run build:prod

# Staging build
npm run build:staging
```

## 🎨 UI Components & Theme

The application features a comprehensive green theme:

- **Primary Colors**: Various shades of green (#22c55e to #052e16)
- **UI Components**: Buttons, cards, forms, modals with consistent styling
- **Loading States**: Elegant spinners and loading indicators
- **Notifications**: Toast-style notifications for user feedback
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## 🔐 Authentication Flow

1. **Login/Register**: JWT tokens stored in localStorage
2. **API Requests**: Automatic token attachment via Axios interceptors
3. **Token Refresh**: Automatic renewal of expired tokens
4. **Protected Routes**: Role-based access control
5. **Logout**: Clean token removal and redirect

## 📱 Key Pages & Features

### Dashboard
- Personalized welcome message
- Key statistics and metrics
- Quick action buttons
- Role-specific content

### Courses
- Course listing with filtering and search
- Enrollment/drop functionality for students
- Detailed course information
- Prerequisites and schedules

### User Management
- Student and teacher listings
- Advanced filtering and sorting
- Profile cards with contact information
- Status indicators and metrics

## 🚀 Deployment

### Development Deployment
```bash
npm start
# Runs on http://localhost:3000
```

### Production Build
```bash
npm run build:prod
# Creates optimized production build in /build
```

### Static Hosting (Recommended)
Deploy the `/build` folder to:
- **Netlify**: Drag & drop deployment
- **Vercel**: GitHub integration
- **AWS S3 + CloudFront**: Enterprise hosting
- **Nginx**: Self-hosted option

### Environment Variables for Production
Set these in your hosting platform:
```
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

## 🔧 API Integration

The frontend communicates with the Django backend through a centralized API client (`src/services/api.js`) that handles:

- **Authentication**: Login, register, token refresh
- **Courses**: CRUD operations, enrollment management
- **Users**: Student and teacher data
- **Dashboard**: Statistics and user data
- **Error Handling**: Comprehensive error responses
- **Loading States**: Automatic loading indicators

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🤝 Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use TypeScript-style prop documentation

### State Management
- Context API for global state (auth, notifications)
- Local state for component-specific data
- Custom hooks for reusable logic

### API Calls
- Use the centralized API client
- Implement proper loading and error states
- Handle edge cases and network failures

## 📝 Notes

- **Backend Dependency**: Requires Django backend on `http://localhost:8000`
- **CORS**: Ensure Django backend allows frontend origin
- **Authentication**: JWT tokens have configurable expiration
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🚀 Production Deployment Checklist

- [ ] Set production API base URL
- [ ] Configure environment variables
- [ ] Build optimized production bundle
- [ ] Test authentication flow
- [ ] Verify API connectivity
- [ ] Set up SSL/HTTPS
- [ ] Configure domain/subdomain
- [ ] Set up monitoring and analytics

---

**BrightPath Frontend** - A modern, production-ready educational management platform interface.

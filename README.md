# Ponts per la Pau - Library & Education Management System

A comprehensive web-based library and education management system designed to connect communities through learning and knowledge sharing. Built with React, TypeScript, and Supabase.

## 🌟 Overview

Ponts per la Pau is a full-featured management platform that combines library operations with educational class management. It provides role-based access control for different user types and comprehensive tracking of all activities.

## 🚀 Features

### 📚 Library Management
- **Digital Book Catalog**: Complete book inventory with metadata
- **Borrowing System**: Track book loans, due dates, and returns
- **Book Requests**: Users can request to borrow books with admin approval
- **Inventory Tracking**: Monitor available vs. borrowed copies
- **Search & Filtering**: Find books by title, author, genre, or availability

### 🎓 Class Management
- **Class Creation**: Set up classes with schedules, subjects, and levels
- **Student Enrollment**: Manage class enrollments with approval workflows
- **Teacher Assignment**: Assign staff members as class teachers
- **Schedule Management**: Flexible scheduling with multiple time slots
- **Student Feedback**: Teachers can provide performance feedback

### 👥 User Management
- **Role-Based Access**: Admin, Staff, Student, and Visitor roles
- **User Approval Workflow**: Admin approval required for new accounts
- **Profile Management**: Comprehensive user profiles with documents
- **Activity Tracking**: Log all user actions and system events

### 🔐 Authentication & Security
- **Secure Authentication**: Email/password with Supabase Auth
- **Row Level Security**: Database-level access control
- **Password Setup**: Flexible password creation for admin-created accounts
- **Session Management**: Persistent login sessions

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database with RLS policies
- **Real-time subscriptions** for live updates
- **File storage** for documents and images

### State Management
- **React Context API** for global state
- **Custom hooks** for data fetching
- **Service layer** for API interactions

## 📊 Database Schema

### Core Tables

#### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- role (enum: admin, staff, student, visitor)
- status (enum: pending, approved, rejected)
- name, father_name, last_name (text)
- date_of_birth, gender, national_id, passport_no
- phone, address, parent_contact
- photo, job_title, job_description
- join_date, leave_date, education_documents
- cv, activity_history, short_bio
- classes_teaching, education_level
- created_at, updated_at (timestamps)
```

#### Books Table
```sql
- id (uuid, primary key)
- title, author, isbn, genre (text)
- publisher, published_year
- total_copies, available_copies (integer)
- description, cover_image (text)
- status (enum: available, reserved, maintenance)
- created_at, updated_at (timestamps)
```

#### Classes Table
```sql
- id (uuid, primary key)
- name, description, subject, level (text)
- teacher_id (uuid, foreign key to users)
- schedule (jsonb array)
- max_students, current_students (integer)
- enrolled_students (text array)
- status (enum: active, inactive, completed)
- start_date, end_date (date)
- created_at, updated_at (timestamps)
```

#### Borrow Logs Table
```sql
- id (uuid, primary key)
- book_id, user_id (uuid, foreign keys)
- borrow_date, due_date, return_date (date)
- status (enum: borrowed, returned, overdue)
- renewal_count (integer)
- notes (text)
- created_at, updated_at (timestamps)
```

#### Additional Tables
- **book_requests**: Book borrowing requests with approval workflow
- **student_feedbacks**: Teacher feedback for students
- **activities**: System activity logging

## 🎭 User Roles & Permissions

### 👑 Admin
- **Full System Access**: Manage all users, books, and classes
- **User Approval**: Approve/reject new user registrations
- **Book Management**: Add, edit, delete books; manage borrowing
- **Class Management**: Create classes, assign teachers, manage enrollments
- **Activity Monitoring**: View all system activities and logs

### 👨‍🏫 Staff
- **Profile Management**: Update personal and professional information
- **Teaching**: Manage assigned classes and provide student feedback
- **Library Access**: Browse books and request to borrow
- **Limited Admin**: Some administrative functions based on permissions

### 👨‍🎓 Student
- **Class Enrollment**: Request to join available classes
- **Library Access**: Browse and request books
- **Profile Management**: Update personal information
- **View Feedback**: See teacher feedback and progress

### 👤 Visitor
- **Limited Access**: Browse library catalog
- **Book Requests**: Request to borrow books (with approval)
- **Profile Management**: Basic profile updates

## 🔄 Key Workflows

### User Registration & Approval
1. User registers with email and basic information
2. Account created with "pending" status
3. Admin reviews and approves/rejects the account
4. Approved users can log in and access features
5. Activity logged for audit trail

### Book Borrowing Process
1. User browses library catalog
2. User requests to borrow a book
3. Admin reviews and approves/rejects request
4. If approved, book is marked as borrowed
5. Available copies decremented
6. Due date tracking begins

### Class Enrollment Process
1. Student views available classes
2. Student requests enrollment in a class
3. Admin/Staff reviews enrollment request
4. If approved, student is added to class
5. Teacher can provide feedback on student progress

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ponts-per-la-pau
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Click "Connect to Supabase" in the top right of the application
   - Or manually create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations**
   - The migrations are automatically applied when you connect to Supabase
   - Check the `supabase/migrations/` folder for all schema files

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
   - Open http://localhost:5173
   - Register as an admin user first
   - Approve other users through the admin panel

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── BookCard.tsx
│   ├── BookFormModal.tsx
│   ├── BorrowBookModal.tsx
│   ├── ClassFormModal.tsx
│   ├── ConfirmDialog.tsx
│   ├── FileUpload.tsx
│   ├── Layout.tsx
│   └── ...
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   ├── UserContext.tsx
│   ├── LibraryContext.tsx
│   ├── ClassContext.tsx
│   ├── BookRequestContext.tsx
│   └── ...
├── pages/              # Page components
│   ├── admin/          # Admin-specific pages
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ...
├── services/           # API service layers
│   ├── authService.ts
│   ├── userService.ts
│   ├── classService.ts
│   └── ...
├── types/              # TypeScript type definitions
│   ├── User.ts
│   ├── Library.ts
│   ├── Class.ts
│   └── index.ts
└── lib/
    └── supabase.ts     # Supabase client configuration
```

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Configuration
- Row Level Security (RLS) enabled on all tables
- Policies configured for role-based access
- Triggers for automatic timestamp updates
- Foreign key constraints for data integrity

## 🎯 Usage Guide

### For Administrators
1. **Initial Setup**: Register as the first user (becomes admin)
2. **User Management**: Approve pending user registrations
3. **Library Setup**: Add books to the catalog
4. **Class Creation**: Set up classes and assign teachers
5. **Monitor Activity**: Review system logs and user activities

### For Staff Members
1. **Profile Setup**: Complete professional information
2. **Class Teaching**: Manage assigned classes
3. **Student Feedback**: Provide performance evaluations
4. **Library Access**: Borrow books for teaching resources

### For Students
1. **Profile Completion**: Add academic information
2. **Class Enrollment**: Request to join available classes
3. **Library Usage**: Browse and request books
4. **Progress Tracking**: View teacher feedback

### For Visitors
1. **Library Browsing**: View available books
2. **Book Requests**: Request borrowing privileges
3. **Account Upgrade**: Request role change to student/staff

## 🔍 Key Features in Detail

### Activity Logging
- All user actions are logged with timestamps
- Admins can view comprehensive activity feeds
- Audit trail for compliance and monitoring

### File Management
- Profile photos with preview
- CV/Resume uploads for staff
- Education document storage
- Secure file viewing and downloading

### Request Systems
- **Book Requests**: Approval workflow for borrowing
- **Class Enrollment**: Managed enrollment process
- **Admin Notifications**: Real-time request notifications

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Bolt Hosting
- Use the deploy button in the interface
- Automatic build and deployment process
- Custom domain support available

## 🛡️ Security Features

- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Granular access control
- **Input Validation**: Client and server-side validation
- **Secure File Handling**: Safe file upload and storage
- **Session Management**: Secure authentication sessions

## 📈 Monitoring & Analytics

- **User Activity Tracking**: Comprehensive activity logs
- **System Statistics**: Usage metrics and reports
- **Performance Monitoring**: Real-time system health
- **Audit Trails**: Complete action history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions about the system:
- Check the documentation
- Review the activity logs for troubleshooting
- Contact system administrators

## 📄 License

This project is part of the Ponts per la Pau educational initiative.

---

**Built with ❤️ for education and community building**
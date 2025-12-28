<div align="center">

# 🏥 Siddha Shivalayas

### Healthcare Management System

A comprehensive full-stack web application for managing patient records, inventory, billing, and purchase operations for a traditional Siddha medicine clinic.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[Live Demo](#-live-demo) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture)

</div>

---

## 📋 About

**Siddha Shivalayas** is a production-grade healthcare management system built as a freelance project for a traditional Siddha medicine clinic. The application streamlines daily clinic operations including patient registration, inventory management, billing, and purchase tracking.

> ⚠️ **Demo Note:** This repository contains a demo version connected to a sample database. The production version operates on the clinic's private infrastructure with real patient data.

---

## 🎯 Live Demo

Experience the application with demo credentials:

| Access Level | Email | Password |
|:-------------|:------|:---------|
| **Admin Access** (Full Privileges) | `visitor@gmail.com` | `visitor123` |
| **Staff Access** (Restricted) | `visitor-staff@gmail.com` | `visitor123` |

> 💡 **Tip:** Try both accounts to see the role-based access control in action!

---

## ✨ Features

### 👥 Patient Management
- Complete CRUD operations for patient records
- Patient history tracking and quick search
- Detailed patient profiles with visit records

### 📦 Inventory Management
- Real-time stock level monitoring
- HSN code and GST-compliant product catalog
- Low stock alerts and quantity tracking

### 🧾 Billing System
- Generate professional bills with itemized details
- Support for consulting fees, treatments, and medicines
- **PDF & DOCX export** with custom clinic branding
- Complete billing history with search functionality

### 📥 Purchase Management
- Record vendor purchases with invoice details
- Batch number and expiry date tracking
- Auto-update inventory on purchase entries
- GST-compliant purchase records

### 🔐 Security & Access Control
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin/Staff/Demo)
- Protected routes with automatic session handling
- Multi-tenant database architecture for demo/production isolation

### 📊 Dashboard & Analytics
- Quick overview of key metrics
- Total patients, stock levels, and billing stats
- Intuitive navigation with modern UI

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 18** | UI library with hooks and functional components |
| **Vite** | Next-generation build tool for fast development |
| **Material-UI 5** | Comprehensive component library |
| **React Router 6** | Client-side routing with protected routes |
| **Axios** | HTTP client with interceptors for auth |
| **jsPDF + html2canvas** | PDF generation for bills and reports |
| **SheetJS (xlsx)** | Excel export functionality |

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **JWT** | Secure authentication tokens |
| **bcrypt.js** | Password hashing |
| **docxtemplater** | DOCX document generation |
| **PDFKit** | Server-side PDF creation |

### DevOps & Tooling
| Technology | Purpose |
|:-----------|:--------|
| **Docker** | Containerization ready |
| **Vercel** | Frontend deployment |
| **MongoDB Atlas** | Cloud database hosting |
| **ESLint** | Code quality and standards |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   React 18   │  │  Material-UI │  │   React Router 6     │  │
│  │   + Vite     │  │   Components │  │   Protected Routes   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              │     Axios + Auth Interceptor   │                  │
│              └───────────────┬───────────────┘                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────┼──────────────────────────────────┐
│                         BACKEND                                  │
│              ┌───────────────┴───────────────┐                  │
│              │      Express.js Server         │                  │
│              └───────────────┬───────────────┘                  │
│                              │                                   │
│  ┌──────────────┐  ┌────────┴────────┐  ┌──────────────────┐   │
│  │ JWT Auth     │  │  Role-Based     │  │  Database        │   │
│  │ Middleware   │  │  Access Control │  │  Switcher        │   │
│  └──────────────┘  └─────────────────┘  └────────┬─────────┘   │
│                                                   │              │
│  ┌───────────────────────────────────────────────┴───────────┐  │
│  │                      Mongoose ODM                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                        DATABASE LAYER                            │
│         ┌────────────────────┴────────────────────┐             │
│         │              MongoDB Atlas               │             │
│    ┌────┴────┐                              ┌─────┴────┐        │
│    │Production│                              │  Demo    │        │
│    │   DB     │                              │   DB     │        │
│    └─────────┘                              └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Siddha-Shivalayas/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & authorization
│   │   └── dbSwitcher.js        # Multi-tenant database switching
│   ├── models/
│   │   ├── User.js              # User model with password hashing
│   │   ├── Patient.js           # Patient schema (via dbSwitcher)
│   │   ├── Stock.js             # Inventory schema
│   │   └── Bill.js              # Billing schema
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── patient.js           # Patient CRUD operations
│   │   ├── stock.js             # Inventory management
│   │   └── bill.js              # Billing & document generation
│   ├── server.js                # Express app configuration
│   ├── Dockerfile               # Container configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── Pages/               # Route page components
│   │   ├── services/            # API service layer
│   │   │   └── authService.js   # Authentication utilities
│   │   ├── config/
│   │   │   └── api.js           # Centralized API endpoints
│   │   ├── designTokens.js      # Design system tokens
│   │   ├── Header.jsx           # App navigation header
│   │   ├── Home.jsx             # Dashboard homepage
│   │   └── App.jsx              # Main application component
│   ├── .env.example             # Environment template
│   ├── vite.config.js           # Vite configuration
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (local or Atlas connection)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vimal004/Siddha-Shivalayas.git
   cd Siddha-Shivalayas
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

   Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | `/auth/login` | Authenticate user and receive JWT |
| GET | `/auth/verify` | Verify token validity |
| GET | `/auth/me` | Get current user info |

### Patients
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/patients` | List all patients |
| POST | `/patients` | Create new patient |
| GET | `/patients/:id` | Get patient by ID |
| PUT | `/patients/:id` | Update patient |
| DELETE | `/patients/:id` | Delete patient |

### Inventory
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/stocks` | List all stock items |
| POST | `/stocks` | Add new stock item |
| PUT | `/stocks/:id` | Update stock item |
| DELETE | `/stocks/:id` | Remove stock item |

### Billing
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/bills` | Get billing history |
| POST | `/bills` | Generate new bill |
| GET | `/bills/:id/pdf` | Download bill as PDF |
| GET | `/bills/:id/docx` | Download bill as DOCX |

### Purchases
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/purchases` | List purchase history |
| POST | `/purchases` | Record new purchase |

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with 24-hour expiry
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-Based Access**: Admin, Staff, and Demo roles with granular permissions
- **Database Isolation**: Demo users access isolated database preventing data contamination
- **Protected Routes**: Frontend and backend route protection

---

## 🎨 Design Philosophy

The UI follows **Material Design 3** principles with:
- Clean, minimalist interfaces
- Consistent design tokens
- Responsive layouts for all devices
- Smooth micro-animations
- Intuitive navigation patterns

---

## 📈 Future Roadmap

- [ ] Appointment scheduling system
- [ ] Email notifications for stock alerts
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Tamil/Hindi)
- [ ] Mobile application (React Native)
- [ ] Automated backup system

---

## 👨‍💻 Author

**Vimal Manoharan**

[![GitHub](https://img.shields.io/badge/GitHub-vimal004-181717?style=for-the-badge&logo=github)](https://github.com/vimal004)
[![Email](https://img.shields.io/badge/Email-2004.vimal@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:2004.vimal@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

*Built with ❤️ for Siddha Shivalayas Clinic*

</div>

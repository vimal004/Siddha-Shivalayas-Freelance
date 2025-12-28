# Siddha-Shivalayas: Billing and Patient Management System

> ⚠️ **Note:** This project is a **dummy replica** of the original system used at the Siddha Shivalayas Clinic. The actual production version is hosted privately on the clinic’s server and is not publicly accessible. Login credentials: visitor@gmail.com(admin)/visitor-staff@gmail.com(staff) pwd:visitor123

## Overview

**Siddha-Shivalayas** is a full-stack web application developed to streamline operations at the Siddha Shivalayas Clinic. It provides an efficient solution for managing patient records, tracking clinic inventory, and generating bills, enhancing administrative productivity and user experience. Built with modern web technologies, this project showcases a robust backend API, an intuitive frontend interface, and document generation capabilities.

---

## Features

### ✅ Patient Management
- Create, read, update, and delete (CRUD) patient records.
- View patient details and history.

### 📦 Stock Management
- Manage clinic inventory with CRUD operations.
- Track stock levels and update quantities.

### 🧾 Bill Generation
- Generate bills in PDF and DOCX formats.
- View and manage billing history.

### 🔐 User Authentication
- Secure login system for clinic staff (to be enhanced with JWT).
- Role-based access control (planned feature).

### 💻 User Interface
- Responsive and intuitive frontend built with React and Material-UI.
- Easy navigation for managing patients, stocks, and bills.

### 📤 Data Export
- Export data to Excel for reporting.
- Generate PDF reports using `html2canvas` and `jspdf`.

---

## Technologies Used

### Backend
- **Node.js**: Runtime environment for server-side logic.
- **Express.js**: Framework for building RESTful APIs.
- **Mongoose**: ODM for MongoDB database interactions.

### Frontend
- **React.js**: Library for building user interfaces.
- **Vite**: Build tool for fast development and production builds.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Material-UI**: Component library for consistent UI design.
- **React Router**: For client-side routing.

### Database
- **MongoDB**: NoSQL database for storing patient and stock data.

### Document Generation
- **docxtemplater**: For generating DOCX files.
- **pdfkit**: For creating PDF documents.
- **jspdf**: For additional PDF generation support.
- **html2canvas**: For rendering HTML to canvas for PDF exports.

### Data Handling
- **xlsx**: For Excel file generation and data export.

### Development Tools
- **ESLint**: For code linting and maintaining code quality.
- **dotenv**: For managing environment variables.

---

## Prerequisites

Ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or cloud instance, e.g., MongoDB Atlas)
- Git

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/vimal004/Siddha-Shivalayas.git
cd Siddha-Shivalayas

Backend Setup

cd backend
npm install

Create a .env file in the backend directory with:

MONGODB_URI=<your-mongodb-connection-string>
PORT=5000

Start the backend server:

npm start

Frontend Setup

cd frontend
npm install
npm run dev

Verify Setup

    Backend: http://localhost:5000

    Frontend: http://localhost:5173

Usage
Access the Application

    Open your browser and go to: http://localhost:5173

    Log in using the default credentials (to be configured)

Navigate Features

    Patients: /managepatients

    Stocks: /managestocks

    Bills: /generatebill

    Billing History: /billhistory

Export Data

    Export patient/stock data as Excel files

    Generate PDF reports for bills/summaries

API Documentation

Base URL: http://localhost:5000/api
Patient Endpoints
Endpoint	Method	Description
/patients	POST	Create a new patient
/patients	GET	Retrieve all patients
/patients/:id	GET	Get patient by ID
/patients/:id	PUT	Update patient by ID
/patients/:id	DELETE	Delete patient by ID
Stock Endpoints
Endpoint	Method	Description
/stocks	POST	Create a stock item
/stocks	GET	Retrieve all stock items
/stocks/:id	GET	Get stock by ID
/stocks/:id	PUT	Update stock by ID
/stocks/:id	DELETE	Delete stock by ID
Bill Endpoints
Endpoint	Method	Description
/bills	POST	Generate a new bill
/bills	GET	Retrieve all bills
/bills/:id	GET	Get bill by ID
/bills/:id/pdf	GET	Download bill as PDF
/bills/:id/docx	GET	Download bill as DOCX
Error Responses
Status	Description	Example Response
400	Bad Request	{ "error": "Invalid input" }
404	Not Found	{ "error": "Resource not found" }
500	Internal Server Error	{ "error": "Server error" }
Project Structure

Siddha-Shivalayas/
├── backend/
│   ├── routes/
│   │   ├── patient.js
│   │   ├── stock.js
│   │   ├── bill.js
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Stock.js
│   │   ├── Bill.js
│   ├── .env
│   ├── server.js
│   ├── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Home.jsx
│   │   ├── pages/
│   │   │   ├── ManagePatients.jsx
│   │   │   ├── ManageStocks.jsx
│   │   │   ├── GenerateBill.jsx
│   │   ├── App.jsx
│   ├── .eslintrc.cjs
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
├── README.md

Future Enhancements

    JWT-based authentication

    Role-based access control

    Unit and integration tests (Jest, Mocha)

    Optimized database queries

    Multi-language UI support

License

This project is licensed under the MIT License.
Contact

Developer: Vimal
GitHub: vimal004
Email: 2004.vimal@gmail.com

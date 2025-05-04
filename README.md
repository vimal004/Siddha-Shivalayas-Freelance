Siddha-Shivalayas: Billing and Patient Management System
Overview
Siddha-Shivalayas is a full-stack web application developed to streamline operations at the Siddha Shivalayas Clinic. It provides an efficient solution for managing patient records, tracking clinic inventory, and generating bills, enhancing administrative productivity and user experience. Built with modern web technologies, this project showcases a robust backend API, an intuitive frontend interface, and document generation capabilities.

Features

Patient Management:
Create, read, update, and delete (CRUD) patient records.
View patient details and history.


Stock Management:
Manage clinic inventory with CRUD operations.
Track stock levels and update quantities.


Bill Generation:
Generate bills in PDF and DOCX formats.
View and manage billing history.


User Authentication:
Secure login system for clinic staff (to be enhanced with JWT).
Role-based access control (planned feature).


User Interface:
Responsive and intuitive frontend built with React and Material-UI.
Easy navigation for managing patients, stocks, and bills.


Data Export:
Export data to Excel for reporting.
Generate PDF reports using html2canvas and jspdf.




Technologies Used

Backend:
Node.js: Runtime environment for server-side logic.
Express.js: Framework for building RESTful APIs.
Mongoose: ODM for MongoDB database interactions.


Frontend:
React.js: Library for building user interfaces.
Vite: Build tool for fast development and production builds.
Tailwind CSS: Utility-first CSS framework for styling.
Material-UI: Component library for consistent UI design.
React Router: For client-side routing.


Database:
MongoDB: NoSQL database for storing patient and stock data.


Document Generation:
docxtemplater: For generating DOCX files.
pdfkit: For creating PDF documents.
jspdf: For additional PDF generation support.
html2canvas: For rendering HTML to canvas for PDF exports.


Data Handling:
xlsx: For Excel file generation and data export.


Development Tools:
ESLint: For code linting and maintaining code quality.
dotenv: For managing environment variables.




Prerequisites
Before setting up the project, ensure you have the following installed:

Node.js (v16 or higher)
npm (v8 or higher)
MongoDB (local or cloud instance, e.g., MongoDB Atlas)
Git (for cloning the repository)


Installation
Follow these steps to set up the project locally:

Clone the Repository:
git clone https://github.com/vimal004/Siddha-Shivalayas.git
cd Siddha-Shivalayas


Backend Setup:
cd backend
npm install


Create a .env file in the backend directory with the following variables:MONGODB_URI=<your-mongodb-connection-string>
PORT=5000


Start the backend server:npm start




Frontend Setup:
cd frontend
npm install


Start the frontend development server:npm run dev




Verify Setup:

The backend should be running on http://localhost:5000.
The frontend should be accessible at http://localhost:5173 (default Vite port).




Usage

Access the Application:

Open your browser and navigate to http://localhost:5173.
Log in using the default credentials (to be implemented or configured).


Navigate Features:

Patients: Go to /managepatients to add, view, edit, or delete patient records.
Stocks: Visit /managestocks to manage clinic inventory.
Bills: Access /generatebill to create and download bills.
History: View billing history at /billhistory.


Export Data:

Use the export feature to download patient or stock data in Excel format.
Generate PDF reports for bills or summaries.




API Documentation
The backend provides a RESTful API for managing patients, stocks, and bills. Below is a detailed list of available endpoints.
Base URL
http://localhost:5000/api

Patient Endpoints



Endpoint
Method
Description
Request Body
Response



/patients
POST
Create a new patient
{ "name": "string", "age": number, "contact": "string", "address": "string" }
201: { id, name, age, contact, address }


/patients
GET
Retrieve all patients
None
200: [{ id, name, age, contact, address }]


/patients/:id
GET
Retrieve a patient by ID
None
200: { id, name, age, contact, address }


/patients/:id
PUT
Update a patient by ID
{ "name": "string", "age": number, "contact": "string", "address": "string" }
200: { id, name, age, contact, address }


/patients/:id
DELETE
Delete a patient by ID
None
204: No Content


Stock Endpoints



Endpoint
Method
Description
Request Body
Response



/stocks
POST
Create a new stock item
{ "name": "string", "quantity": number, "price": number }
201: { id, name, quantity, price }


/stocks
GET
Retrieve all stock items
None
200: [{ id, name, quantity, price }]


/stocks/:id
GET
Retrieve a stock item by ID
None
200: { id, name, quantity, price }


/stocks/:id
PUT
Update a stock item by ID
{ "name": "string", "quantity": number, "price": number }
200: { id, name, quantity, price }


/stocks/:id
DELETE
Delete a stock item by ID
None
204: No Content


Bill Endpoints



Endpoint
Method
Description
Request Body
Response



/bills
POST
Generate a new bill
{ "patientId": "string", "items": [{ "name": "string", "quantity": number, "price": number }], "total": number }
201: { id, patientId, items, total, date }


/bills
GET
Retrieve all bills
None
200: [{ id, patientId, items, total, date }]


/bills/:id
GET
Retrieve a bill by ID
None
200: { id, patientId, items, total, date }


/bills/:id/pdf
GET
Download bill as PDF
None
200: PDF file


/bills/:id/docx
GET
Download bill as DOCX
None
200: DOCX file


Error Responses



Status
Description
Response



400
Bad Request
{ "error": "Invalid input" }


404
Not Found
{ "error": "Resource not found" }


500
Internal Server Error
{ "error": "Server error" }



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


Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Please ensure your code follows the project's coding standards and includes appropriate tests.

Troubleshooting

MongoDB Connection Error:
Verify the MONGODB_URI in the .env file.
Ensure MongoDB is running or the cloud instance is accessible.


Frontend Not Loading:
Check if the backend is running on http://localhost:5000.
Run npm install in the frontend directory to ensure all dependencies are installed.


CORS Issues:
Ensure CORS is enabled in the backend (server.js) with appropriate origins.




Future Enhancements

Implement JWT-based authentication for secure user access.
Add role-based access control for different staff roles.
Introduce unit and integration tests using Jest and Mocha.
Optimize database queries for large datasets.
Add support for multi-language interfaces.


License
This project is licensed under the MIT License.

Contact
For questions or feedback, please contact:

Developer: Vimal
GitHub: vimal004
Email: 2004.vimal@gmail.com


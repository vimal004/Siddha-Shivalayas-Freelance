Siddha-Shivalayas: Billing and Patient Management System
Project Description
Siddha-Shivalayas is a full-stack web application designed to streamline operations at the Siddha Shivalayas Clinic. It provides functionalities for managing patient records, tracking clinic inventory, and generating bills, enhancing efficiency in clinic administration.
Features

Patient Management: Create, read, update, and delete patient records.
Stock Management: Track and manage clinic inventory.
Bill Generation: Generate bills in PDF and DOCX formats.
User Interface: Intuitive frontend for easy navigation and interaction.
Authentication: Basic user login system (to be enhanced with JWT).

Technologies Used

Backend: Node.js, Express.js, Mongoose
Frontend: React.js, Vite, Tailwind CSS, Material-UI
Database: MongoDB
Document Generation: docxtemplater, pdfkit, jspdf
Others: xlsx, html2canvas

Installation

Clone the Repository:git clone https://github.com/vimal004/Siddha-Shivalayas.git
cd Siddha-Shivalayas


Backend Setup:cd backend
npm install
npm start


Frontend Setup:cd frontend
npm install
npm run dev


Environment Variables:
Create a .env file in the backend directory.
Add MONGODB_URI and PORT variables.



Usage

Access the application at http://localhost:5173 (default frontend port).
Log in using credentials (to be implemented).
Navigate to sections like "Manage Patients," "Manage Stocks," or "Generate Bill."

Contributing
Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request.
License
This project is licensed under the MIT License.

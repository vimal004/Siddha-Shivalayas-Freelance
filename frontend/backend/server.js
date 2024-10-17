const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const { convertToPdf } = require("docx-pdf"); // Install docx-pdf for conversion

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://2004vimal:zaq1%40wsx@cluster0.kfsrfxi.mongodb.net/SiddhaShivalayas",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const stockRoutes = require("./routes/stock");
const patientRoutes = require("./routes/patient");

app.use("/stocks", stockRoutes);
app.use("/patients", patientRoutes);

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.post("/generate-bill", (req, res) => {
  const { id, name, phone, address, treatmentOrMedicine, date } = req.body;

  // Load the bill template
  const content = fs.readFileSync(
    path.resolve(__dirname, "./bill_template.docx"),
    "binary"
  );
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip);

  // Replace placeholders with form data
  doc.setData({
    id: id,
    name: name,
    phone: phone,
    address: address,
    treatmentOrMedicine: treatmentOrMedicine,
    date: date,
  });

  try {
    doc.render();
  } catch (error) {
    return res.status(500).send("Error generating bill");
  }

  const buf = doc.getZip().generate({ type: "nodebuffer" });

  // Send the file as a downloadable response without saving it
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=generated-bill-${id}.docx`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.send(buf);
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

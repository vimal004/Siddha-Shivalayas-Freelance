const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs').promises;
const path = require('path');
const ILovePDFApi = require('ilovepdf-sdk');
const { Readable } = require('stream'); // Import the Readable stream module

const app = express();

// --- START: Configuration ---
// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// iLovePDF API Keys
const ILOVEPDF_PUBLIC_KEY =
  'project_public_0f6e1a7f5c6ebbd83cd869b99afe325b_MIke497da1ee9b7a763eb9eb296487395116b';
const ILOVEPDF_SECRET_KEY =
  'secret_key_34cdae62c413fa81474dd25d046f029e_kKaGBd4f783ba1b08c961929ffca2cb946d21';
const ilovepdf = new ILovePDFApi(ILOVEPDF_PUBLIC_KEY, ILOVEPDF_SECRET_KEY);

// MongoDB Connection
const MONGO_URI =
  'mongodb+srv://2004vimal:zaq1%40wsx@cluster0.kfsrfxi.mongodb.net/SiddhaShivalayas';
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
// --- END: Configuration ---

// --- START: Routes ---
const stockRoutes = require('./routes/stock');
const patientRoutes = require('./routes/patient');

app.use('/stocks', stockRoutes);
app.use('/patients', patientRoutes);

app.get('/', (req, res) => {
  res.json('Hello World');
});

// Bill Schema
const BillSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  address: String,
  treatmentOrMedicine: String,
  date: Date,
  items: Array,
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Bill = mongoose.model('Bill', BillSchema);

// Helper function to convert buffer to stream
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// Bill Generation Endpoint
app.post('/generate-bill', async (req, res) => {
  try {
    const { id, name, phone, address, date, items, discount } = req.body;

    if (!id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const discountValue = isNaN(parseFloat(discount)) ? 0 : parseFloat(discount);
    const itemTotals = items.map(item => ({
      ...item,
      baseTotal: (parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2),
      finalAmount: (parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2),
    }));
    const subtotal = itemTotals.reduce((sum, item) => sum + parseFloat(item.baseTotal), 0);
    const finalTotal = (subtotal - (subtotal * discountValue) / 100).toFixed(2);

    const newBill = new Bill({
      id,
      name,
      phone,
      address,
      date,
      items: itemTotals,
      discount: discountValue,
    });
    await newBill.save();

    const templatePath = path.resolve(__dirname, 'bill_template.docx');
    const content = await fs.readFile(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    const displayDate = date
      ? new Date(date).toLocaleDateString('en-IN')
      : new Date().toLocaleDateString('en-IN');
    doc.setData({
      id,
      name,
      phone,
      address,
      date: displayDate,
      items: itemTotals,
      subtotal: subtotal.toFixed(2),
      discount: discountValue.toFixed(2),
      total: finalTotal,
    });
    doc.render();
    const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });

    // **FIX:** Use createTask and addFileByStream for buffers
    const task = await ilovepdf.createTask('officepdf');
    const docxStream = bufferToStream(docxBuffer);
    await task.addFileByStream(`bill-${id}.docx`, docxStream);
    await task.process();
    const pdfData = await task.download();

    res.setHeader('Content-Disposition', `attachment; filename=bill-${id}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('Error during bill generation:', err);
    res.status(500).json({ error: 'Internal server error.', message: err.message });
  }
});

// Download a specific bill by ID as PDF
app.get('/bills/download/:billId', async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).send('Bill not found');

    const templatePath = path.resolve(__dirname, 'bill_template.docx');
    const content = await fs.readFile(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal - (subtotal * bill.discount) / 100;
    const displayDate = bill.date
      ? new Date(bill.date).toLocaleDateString('en-IN')
      : new Date(bill.createdAt).toLocaleDateString('en-IN');

    doc.setData({
      id: bill.id,
      name: bill.name,
      phone: bill.phone,
      address: bill.address,
      date: displayDate,
      items: bill.items,
      subtotal: subtotal.toFixed(2),
      discount: bill.discount.toFixed(2),
      total: total.toFixed(2),
    });

    doc.render();
    const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });

    // **FIX:** Use createTask and addFileByStream for buffers
    const task = await ilovepdf.createTask('officepdf');
    const docxStream = bufferToStream(docxBuffer);
    await task.addFileByStream(`bill-${billId}.docx`, docxStream);
    await task.process();
    const pdfData = await task.download();

    res.setHeader('Content-Disposition', `attachment; filename=bill-${billId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('Error downloading bill:', err);
    res.status(500).json({ error: 'Internal server error.', message: err.message });
  }
});

// ... (The rest of your routes: /bills-history, /bills/:billId (DELETE, PUT) remain the same)
app.get('/bills-history', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bill history.' });
  }
});

app.delete('/bills/:billId', async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findByIdAndDelete(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting the bill.' });
  }
});

app.put('/bills/:billId', async (req, res) => {
  try {
    const { billId } = req.params;
    const { items, discount } = req.body;
    const updatedBill = await Bill.findByIdAndUpdate(billId, { items, discount }, { new: true });
    if (!updatedBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating the bill.' });
  }
});
// --- END: Routes ---

// --- START: Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// --- END: Server ---

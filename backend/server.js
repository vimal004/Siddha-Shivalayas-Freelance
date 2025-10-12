const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs').promises;
const path = require('path');
const ILovePDFApi = require('ilovepdf-sdk');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize iLovePDF SDK with hardcoded keys
const ilovepdf = new ILovePDFApi(
  'project_public_0f6e1a7f5c6ebbd83cd869b99afe325b_MIke497da1ee9b7a763eb9eb296487395116b',
  'secret_key_34cdae62c413fa81474dd25d046f029e_kKaGBd4f783ba1b08c961929ffca2cb946d21'
);

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://2004vimal:zaq1%40wsx@cluster0.kfsrfxi.mongodb.net/SiddhaShivalayas', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const stockRoutes = require('./routes/stock');
const patientRoutes = require('./routes/patient');

app.use('/stocks', stockRoutes);
app.use('/patients', patientRoutes);

app.get('/', (req, res) => {
  res.json('Hello World');
});

// Bill Schema
const BillSchema = new mongoose.Schema({
  id: { type: String, required: false },
  name: { type: String, required: false },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  treatmentOrMedicine: { type: String, required: false },
  date: { type: Date, required: false },
  items: [
    {
      description: { type: String, required: false },
      price: { type: Number, required: false },
      HSN: { type: String, required: false },
      quantity: { type: Number, required: false },
      GST: { type: Number, required: false },
      baseTotal: { type: Number, required: false },
      gstAmount: { type: Number, required: false },
      finalAmount: { type: Number, required: false },
    },
  ],
  discount: { type: Number, default: 0, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Bill = mongoose.model('Bill', BillSchema);

// Bill Generation Endpoint
app.post('/generate-bill', async (req, res) => {
  const { id, name, phone, address, treatmentOrMedicine, date, items, discount } = req.body;

  if (!id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send('Error: Missing required fields.');
  }

  const discountValue = isNaN(discount) ? 0 : parseFloat(discount);

  const itemTotals = items.map(item => {
    const itemPrice = parseFloat(item.price);
    const itemQuantity = parseFloat(item.quantity);
    const baseTotal = itemPrice * itemQuantity;
    return {
      ...item,
      baseTotal: baseTotal.toFixed(2),
      finalAmount: baseTotal.toFixed(2),
    };
  });

  const subtotal = itemTotals.reduce((sum, item) => sum + parseFloat(item.baseTotal), 0);
  const finalTotal = (subtotal - (subtotal * discountValue) / 100).toFixed(2);

  const newBill = new Bill({
    id,
    name,
    phone,
    address,
    treatmentOrMedicine,
    date,
    items: itemTotals,
    discount: discountValue,
  });

  try {
    await newBill.save();

    const templatePath = path.resolve(__dirname, 'bill_template.docx');
    const content = await fs.readFile(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.setData({
      id,
      name,
      phone,
      address,
      treatmentOrMedicine,
      date,
      items: itemTotals,
      subtotal: subtotal.toFixed(2),
      discount: discountValue.toFixed(2),
      total: finalTotal,
    });

    doc.render();
    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // Convert DOCX to PDF using iLovePDF
    const task = ilovepdf.newTask('officepdf');
    await task.addFile(buf, `generated-bill-${id}.docx`);
    await task.process();
    const pdfData = await task.download();

    res.setHeader('Content-Disposition', `attachment; filename=generated-bill-${id}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('Error during bill generation:', err);
    return res.status(500).send('Internal server error during bill generation');
  }
});

// Download a specific bill by ID as PDF
app.get('/bills/download/:billId', async (req, res) => {
  const { billId } = req.params;
  try {
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).send('Bill not found');

    const templatePath = path.resolve(__dirname, 'bill_template.docx');
    const content = await fs.readFile(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal - (subtotal * bill.discount) / 100;

    doc.setData({
      id: bill.id,
      name: bill.name,
      phone: bill.phone,
      address: bill.address,
      date: bill.date.toLocaleDateString(),
      items: bill.items,
      subtotal: subtotal.toFixed(2),
      discount: bill.discount.toFixed(2),
      total: total.toFixed(2),
    });

    doc.render();
    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // Convert DOCX to PDF using iLovePDF
    const task = ilovepdf.newTask('officepdf');
    await task.addFile(buf, `bill-${billId}.docx`);
    await task.process();
    const pdfData = await task.download();

    res.setHeader('Content-Disposition', `attachment; filename=bill-${billId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('Error generating bill:', err);
    res.status(500).send('Internal server error');
  }
});

// Other routes...
app.get('/bills-history', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bill history:', error);
    res.status(500).json({ error: 'Error fetching bill history.' });
  }
});

app.delete('/bills/:billId', async (req, res) => {
  const { billId } = req.params;

  try {
    const bill = await Bill.findByIdAndDelete(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully.' });
  } catch (error) {
    console.error('Error deleting the bill:', error);
    res.status(500).json({ error: 'Error deleting the bill.' });
  }
});

app.put('/bills/:billId', async (req, res) => {
  const { billId } = req.params;
  const { items, discount } = req.body;

  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      {
        items,
        discount,
      },
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill updated successfully.' });
  } catch (error) {
    console.error('Error updating the bill:', error);
    res.status(500).json({ error: 'Error updating the bill.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Start of the updated file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert');
const util = require('util');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json());

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

// Cache the template content to avoid reading it multiple times
const templatePath = path.resolve(__dirname, 'bill_template.docx');
let content;
try {
  content = fs.readFileSync(templatePath, 'binary');
} catch (err) {
  console.error('Error loading template file:', err);
  process.exit(1);
}

// Bill Schema (Model for storing bills)
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

// Optimized Bill Generation Endpoint
app.post('/generate-bill', async (req, res) => {
  const { id, name, phone, address, treatmentOrMedicine, date, items, discount } = req.body;

  if (!id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send('Error: Missing required fields.');
  }

  const discountValue = isNaN(discount) ? 0 : parseFloat(discount);
  const itemTotals = items.map(item => {
    const itemPrice = parseFloat(item.price);
    const itemQuantity = parseFloat(item.quantity);
    const gstRate = parseFloat(item.GST || 0) / 100;
    const baseTotal = itemPrice * itemQuantity;
    const gstAmount = baseTotal * gstRate;
    const finalAmount = baseTotal;

    return {
      ...item,
      baseTotal: baseTotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    };
  });

  const subtotal = itemTotals.reduce((sum, item) => sum + parseFloat(item.baseTotal), 0);
  const totalGST = itemTotals.reduce((sum, item) => sum + parseFloat(item.gstAmount), 0);
  const finalTotal = (subtotal - (subtotal * discountValue) / 100).toFixed(2);

  const newBill = new Bill({
    id,
    name,
    phone,
    address,
    treatmentOrMedicine,
    date,
    items: itemTotals,
    subtotal: subtotal.toFixed(2),
    totalGST: totalGST.toFixed(2),
    discount: discountValue.toFixed(2),
    total: finalTotal,
  });

  try {
    await newBill.save();

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData({
      id: id || 'N/A',
      name: name || 'N/A',
      phone: phone || 'N/A',
      address: address || 'N/A',
      treatmentOrMedicine: treatmentOrMedicine || 'N/A',
      date: date || new Date().toISOString(),
      items: itemTotals || [],
      subtotal: subtotal.toFixed(2) || '0.00',
      totalGST: totalGST.toFixed(2) || '0.00',
      discount: discountValue.toFixed(2) || '0.00',
      total: finalTotal || '0.00',
    });

    doc.render();
    const docxBuf = doc.getZip().generate({ type: 'nodebuffer' });

    const convertAsync = util.promisify(libre.convert);
    const pdfBuf = await convertAsync(docxBuf, '.pdf', undefined);

    res.setHeader('Content-Disposition', `attachment; filename=generated-bill-${id}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuf);
  } catch (err) {
    console.error('Error during bill generation or conversion:', err);
    return res.status(500).send('Internal server error during bill generation');
  }
});

// New API: Fetch all bill history
app.get('/bills-history', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bill history:', error);
    res.status(500).json({ error: 'Error fetching bill history.' });
  }
});

app.delete('/bills', async (req, res) => {
  try {
    const response = await Bill.deleteMany();
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

// New API: Fetch a specific bill by ID and download as PDF
app.get('/bills/download/:billId', async (req, res) => {
  const { billId } = req.params;
  try {
    const bill = await Bill.findOne({ _id: billId });
    if (!bill) return res.status(404).send('Bill not found');

    const templatePath = path.resolve(__dirname, 'bill_template.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Recalculate totals as they might not be stored directly in the database in all cases
    const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalGST = bill.items.reduce(
      (sum, item) => sum + (item.price * item.quantity * (item.GST || 0)) / 100,
      0
    );
    const finalTotal = subtotal - (subtotal * bill.discount) / 100;

    doc.setData({
      id: bill.id,
      name: bill.name,
      phone: bill.phone,
      address: bill.address,
      treatmentOrMedicine: bill.treatmentOrMedicine,
      date: bill.createdAt.toISOString().split('T')[0], // format date for readability
      items: bill.items.map(item => ({
        ...item._doc, // Use _doc to access the raw Mongoose object
        baseTotal: (item.price * item.quantity).toFixed(2),
        gstAmount: ((item.price * item.quantity * (item.GST || 0)) / 100).toFixed(2),
        finalAmount: (item.price * item.quantity).toFixed(2),
      })),
      subtotal: subtotal.toFixed(2),
      totalGST: totalGST.toFixed(2),
      discount: bill.discount.toFixed(2),
      total: finalTotal.toFixed(2),
    });

    doc.render();
    const docxBuf = doc.getZip().generate({ type: 'nodebuffer' });

    const convertAsync = util.promisify(libre.convert);
    const pdfBuf = await convertAsync(docxBuf, '.pdf', undefined);

    res.setHeader('Content-Disposition', `attachment; filename=bill-${billId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuf);
  } catch (err) {
    console.error('Error generating bill:', err);
    res.status(500).send('Internal server error');
  }
});

// New API: Delete a specific bill by ID
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
    const updatedBill = await Bill.findByIdAndUpdate(billId, {
      items,
      discount,
    });

    if (!updatedBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill updated successfully.' });
  } catch (error) {
    console.error('Error updating the bill:', error);
    res.status(500).json({ error: 'Error updating the bill.' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret'; // Change this in production

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Vnr_Admission_Bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// User schema/model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
});
const User = mongoose.model('User', userSchema);

// Query schema/model
const querySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  question: String,
  response: String,
  status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  category: String,
  createdAt: { type: Date, default: Date.now },
  answeredAt: Date,
});
const Query = mongoose.model('Query', querySchema);

// Knowledge base schema/model
const knowledgeSchema = new mongoose.Schema({
  category: String,
  keywords: [String],
  response: String,
  updated: { type: Date, default: Date.now },
});
const Knowledge = mongoose.model('Knowledge', knowledgeSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Register endpoint
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Chatbot endpoint using FAQ data from MongoDB
app.post('/ask', async (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  try {
    const faqDoc = await db.collection('FAQs').findOne({ college: 'VNR VJIET' });
    if (!faqDoc || !faqDoc.admission_chatbot_data || !faqDoc.admission_chatbot_data.faq_data) {
      return res.json({ reply: "I'm sorry, I couldn't find any FAQ data." });
    }
    // Find best match by keyword
    const faqs = faqDoc.admission_chatbot_data.faq_data;
    let bestMatch = null;
    for (const faq of faqs) {
      if (faq.keywords.some(kw => userMessage.includes(kw))) {
        bestMatch = faq;
        break;
      }
    }
    if (bestMatch) {
      return res.json({ reply: bestMatch.answer });
    } else {
      return res.json({ reply: "I'm sorry, I couldn't understand that. Please rephrase your question." });
    }
  } catch (err) {
    return res.status(500).json({ reply: 'Error fetching FAQ data.' });
  }
});

// Save student query (from chat)
app.post('/query', async (req, res) => {
  const { userId, name, email, question, response, category } = req.body;
  try {
    const query = new Query({
      user: userId,
      name,
      email,
      question,
      response,
      category,
      status: response ? 'answered' : 'pending',
      answeredAt: response ? new Date() : undefined,
    });
    await query.save();
    res.json({ message: 'Query saved', query });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save query.' });
  }
});

// List/search all queries (admin)
app.get('/queries', async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queries.' });
  }
});

// Update query (mark as answered, add response)
app.patch('/query/:id', async (req, res) => {
  try {
    const { response, status } = req.body;
    const update = { };
    if (response) {
      update.response = response;
      update.status = 'answered';
      update.answeredAt = new Date();
    }
    if (status) update.status = status;
    const query = await Query.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(query);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update query.' });
  }
});

// Knowledge base endpoints
app.get('/knowledge', async (req, res) => {
  try {
    const knowledge = await Knowledge.find().sort({ updated: -1 });
    res.json(knowledge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch knowledge base.' });
  }
});

app.post('/knowledge', async (req, res) => {
  const { category, keywords, response } = req.body;
  try {
    const knowledge = new Knowledge({ category, keywords, response });
    await knowledge.save();
    res.json({ message: 'Knowledge added', knowledge });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add knowledge.' });
  }
});

app.patch('/knowledge/:id', async (req, res) => {
  try {
    const { category, keywords, response } = req.body;
    const update = { category, keywords, response, updated: new Date() };
    const knowledge = await Knowledge.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(knowledge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update knowledge.' });
  }
});

app.delete('/knowledge/:id', async (req, res) => {
  try {
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Knowledge deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete knowledge.' });
  }
});

// Analytics endpoint
app.get('/analytics', async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();
    const pending = await Query.countDocuments({ status: 'pending' });
    const answered = await Query.countDocuments({ status: 'answered' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    // Query categories
    const categoriesAgg = await Query.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // Response time (average, fastest)
    const answeredQueries = await Query.find({ status: 'answered', answeredAt: { $exists: true } });
    let avgResponse = 0, fastest = 0;
    if (answeredQueries.length > 0) {
      const times = answeredQueries.map(q => (q.answeredAt - q.createdAt) / 1000);
      avgResponse = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
      fastest = Math.min(...times).toFixed(1);
    }
    res.json({
      totalQueries,
      pending,
      answered,
      totalStudents,
      categories: categoriesAgg.map(c => ({ name: c._id, count: c.count })),
      response: {
        avg: avgResponse,
        fastest,
        success: totalQueries ? Math.round((answered / totalQueries) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// Optional: Handle default GET request (just to avoid 404 confusion)
app.get('/', (req, res) => {
  res.send('VNR Admission Chatbot backend is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

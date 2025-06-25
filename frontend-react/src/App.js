import React, { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';

// Sample/mock data for admin dashboard
const sampleQueries = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    date: '1/15/2024',
    category: 'Admission Process',
    question: 'What is the last date for B.Tech admission?',
    response: 'The last date for B.Tech admission is June 30, 2024.',
    status: 'answered',
  },
  {
    id: 2,
    name: 'Priya Singh',
    email: 'priya@example.com',
    date: '1/16/2024',
    category: 'Eligibility',
    question: 'Is JEE Main required for admission?',
    response: '',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    email: 'amit@example.com',
    date: '1/17/2024',
    category: 'Fee Structure',
    question: 'What is the fee for CSE?',
    response: 'The fee for B.Tech CSE is ₹1,35,000 per year.',
    status: 'answered',
  },
];
const sampleKnowledge = [
  {
    id: 1,
    category: 'Eligibility',
    keywords: ['eligibility', 'criteria', 'marks', 'percentage'],
    updated: '1/10/2024',
    response: 'For B.Tech admissions: JEE Main qualified with minimum 75% in 12th grade.',
  },
];
const sampleAnalytics = {
  categories: [
    { name: 'Eligibility', percent: 100 },
    { name: 'Admission Process', percent: 80 },
    { name: 'Fees & Scholarships', percent: 60 },
    { name: 'Courses', percent: 40 },
    { name: 'Placement', percent: 20 },
  ],
  response: {
    avg: 2.3,
    success: 98,
    fastest: 1.2,
  },
};

function App() {
  const [activeTab, setActiveTab] = useState('signin');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'student');
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  const [inputName, setInputName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content:
        "Hello! Welcome to VNR VJIET Admission Support. I'm here to help you with all your admission-related queries. You can ask me about eligibility criteria, application deadlines, course details, fees, placement records, and much more!",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' or 'chat'
  const [dashboardTab, setDashboardTab] = useState('queries'); // 'queries', 'knowledge', 'analytics'

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      // Auto-login after register
      await handleLogin(e, true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e, fromRegister = false) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);
      setUserName(data.name);
      setRole(data.role);
      setIsLoggedIn(true);
      setInputName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      if (!fromRegister) {
        setMessages([
          {
            sender: 'bot',
            content:
              "Hello! Welcome to VNR VJIET Admission Support. I'm here to help you with all your admission-related queries. You can ask me about eligibility criteria, application deadlines, course details, fees, placement records, and much more!",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setInputName('');
    setRole('student');
    setChatInput('');
    setMessages([
      {
        sender: 'bot',
        content:
          "Hello! Welcome to VNR VJIET Admission Support. I'm here to help you with all your admission-related queries. You can ask me about eligibility criteria, application deadlines, course details, fees, placement records, and much more!",
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
  };

  // Chat send handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = {
      sender: 'user',
      content: chatInput,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setChatInput('');
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        {
          sender: 'bot',
          content: data.reply,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        {
          sender: 'bot',
          content: 'Sorry, there was a problem getting a response.',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  // Quick question button handler
  const handleQuickQuestion = (text) => {
    setChatInput(text);
  };

  // Role selector for forms
  const roleSelector = (
    <div className="role-selector">
      <label>
        <input
          type="radio"
          name="role"
          value="student"
          checked={role === 'student'}
          onChange={() => setRole('student')}
        />
        Student
      </label>
      <label>
        <input
          type="radio"
          name="role"
          value="admin"
          checked={role === 'admin'}
          onChange={() => setRole('admin')}
        />
        Admin
      </label>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="auth-bg">
        <div className="auth-container">
          <div className="auth-header">
            <img src="/logo192.png" alt="logo" className="auth-logo" />
            <h1 className="auth-title">VNR VJIET</h1>
            <h2 className="auth-subtitle">Admission Support Chatbot</h2>
            <p className="auth-desc">Get instant answers to your admission queries</p>
          </div>
          <div className="auth-card">
            <h2 className="welcome-title">Welcome Back</h2>
            <p className="welcome-desc">Access your personalized admission support dashboard</p>
            <div className="tab-switch">
              <button
                className={activeTab === 'signin' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('signin')}
                type="button"
              >
                Sign In
              </button>
              <button
                className={activeTab === 'register' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('register')}
                type="button"
              >
                Register
              </button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            {activeTab === 'signin' ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <label>Email Address</label>
                <div className="input-group">
                  <span className="input-icon">📧</span>
                  <input type="email" placeholder="your-email@vnr.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <label>Password</label>
                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {roleSelector}
                <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <label>Full Name</label>
                <div className="input-group">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={inputName}
                    onChange={e => setInputName(e.target.value)}
                    required
                  />
                </div>
                <label>Email Address</label>
                <div className="input-group">
                  <span className="input-icon">📧</span>
                  <input type="email" placeholder="your-email@vnr.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <label>Password</label>
                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <label>Confirm Password</label>
                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                {roleSelector}
                <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard UI
  if (role === 'admin' && adminTab === 'dashboard') {
    return (
      <div className="admin-bg">
        <header className="admin-header">
          <div className="admin-header-left">
            <span className="admin-logo">🛡️</span>
            <div>
              <div className="admin-title">Admin Dashboard</div>
              <div className="admin-desc">VNR VJIET Admission Management</div>
            </div>
          </div>
          <div className="admin-header-right">
            <button className="switch-chat-btn" onClick={() => setAdminTab('chat')}>💬 Switch to Chat</button>
            <span className="admin-welcome">Welcome, {userName || 'Admin User'}</span>
            <button className="chat-logout-btn" onClick={handleLogout}>↩ Logout</button>
          </div>
        </header>
        <main className="admin-main">
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="admin-stat-title">Total Queries</div>
              <div className="admin-stat-value">3</div>
              <span className="admin-stat-icon">💬</span>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-title">Pending</div>
              <div className="admin-stat-value">1</div>
              <span className="admin-stat-icon">📊</span>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-title">Answered</div>
              <div className="admin-stat-value">2</div>
              <span className="admin-stat-icon">🛡️</span>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-title">Total Students</div>
              <div className="admin-stat-value">156</div>
              <span className="admin-stat-icon">👥</span>
            </div>
          </div>
          <div className="admin-tabs-row">
            <button className={dashboardTab === 'queries' ? 'admin-tab active' : 'admin-tab'} onClick={() => setDashboardTab('queries')}>Student Queries</button>
            <button className={dashboardTab === 'knowledge' ? 'admin-tab active' : 'admin-tab'} onClick={() => setDashboardTab('knowledge')}>Knowledge Base</button>
            <button className={dashboardTab === 'analytics' ? 'admin-tab active' : 'admin-tab'} onClick={() => setDashboardTab('analytics')}>Analytics</button>
          </div>
          {dashboardTab === 'queries' && (
            <section className="admin-queries-section">
              <div className="admin-section-title">Recent Student Queries</div>
              <div className="admin-section-desc">Manage and respond to student admission queries</div>
              <input className="admin-search" placeholder="Search queries..." />
              <div className="admin-queries-list">
                {sampleQueries.map(q => (
                  <div className="admin-query-card" key={q.id}>
                    <div className="admin-query-header">
                      <span className="admin-query-name">{q.name}</span>
                      {q.status === 'answered' ? (
                        <span className="admin-query-status answered">answered</span>
                      ) : (
                        <span className="admin-query-status pending">pending</span>
                      )}
                    </div>
                    <div className="admin-query-email">{q.email}</div>
                    <div className="admin-query-date">{q.date} - {q.category}</div>
                    <div className="admin-query-q"><b>Question:</b> {q.question}</div>
                    {q.response && <div className="admin-query-a"><b>Response:</b> {q.response}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {dashboardTab === 'knowledge' && (
            <section className="admin-knowledge-section">
              <div className="admin-section-title">Add New Knowledge</div>
              <div className="admin-section-desc">Add new information to the chatbot's knowledge base</div>
              <div className="admin-knowledge-form-row">
                <input className="admin-knowledge-input" placeholder="Category" />
                <input className="admin-knowledge-input" placeholder="Keywords (comma-separated)" />
              </div>
              <textarea className="admin-knowledge-textarea" placeholder="Enter the response that the chatbot should give..." />
              <button className="admin-knowledge-btn">+ Add Knowledge</button>
              <div className="admin-section-title" style={{marginTop: '2rem'}}>Existing Knowledge Base</div>
              <div className="admin-section-desc">Manage existing chatbot responses</div>
              <div className="admin-knowledge-list">
                {sampleKnowledge.map(k => (
                  <div className="admin-knowledge-card" key={k.id}>
                    <div className="admin-knowledge-header">{k.category}</div>
                    <div className="admin-knowledge-keywords">Keywords: {k.keywords.join(', ')}</div>
                    <div className="admin-knowledge-updated">Last updated: {k.updated}</div>
                    <div className="admin-knowledge-response"><b>Response:</b> {k.response}</div>
                    <div className="admin-knowledge-actions">
                      <button className="admin-knowledge-edit">✏️</button>
                      <button className="admin-knowledge-delete">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {dashboardTab === 'analytics' && (
            <section className="admin-analytics-section">
              <div className="admin-stats-row" style={{marginBottom: '2rem'}}>
                <div className="admin-analytics-card">
                  <div className="admin-analytics-title">Query Categories</div>
                  <div className="admin-analytics-bars">
                    {sampleAnalytics.categories.map(cat => (
                      <div className="admin-analytics-bar-row" key={cat.name}>
                        <span>{cat.name}</span>
                        <div className="admin-analytics-bar-bg">
                          <div className="admin-analytics-bar" style={{width: cat.percent + '%'}}></div>
                        </div>
                        <span className="admin-analytics-bar-val">{cat.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-analytics-card">
                  <div className="admin-analytics-title">Response Time</div>
                  <div className="admin-analytics-metrics">
                    <div className="admin-analytics-metric"><span className="admin-analytics-metric-val">{sampleAnalytics.response.avg}s</span> Average Response Time</div>
                    <div className="admin-analytics-metric"><span className="admin-analytics-metric-val">{sampleAnalytics.response.success}%</span> Success Rate</div>
                    <div className="admin-analytics-metric"><span className="admin-analytics-metric-val">{sampleAnalytics.response.fastest}s</span> Fastest Response</div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  // In admin chat view, add a button to switch back to dashboard
  if (role === 'admin' && adminTab === 'chat') {
    return (
      <div className="chat-bg">
        <header className="chat-header">
          <div className="chat-header-left">
            <img src="/logo192.png" alt="logo" className="chat-logo" />
            <div>
              <div className="chat-title">VNR VJIET Admission Bot</div>
              <div className="chat-desc">Get instant answers to your admission queries</div>
            </div>
          </div>
          <div className="chat-header-right">
            <div className="chat-user-info">
              <span className="chat-user-name">{userName || 'Admin User'}</span>
              <span className="chat-user-role">Admin</span>
              <span className="chat-user-icon">👤</span>
            </div>
            <button className="admin-panel-btn active" onClick={() => setAdminTab('dashboard')}>Admin Panel</button>
            <button className="chat-logout-btn" onClick={handleLogout}>↩ Logout</button>
          </div>
        </header>
        <main className="chat-main">
          <section className="chat-card">
            <div className="chat-title-row">
              <span className="chat-assistant-icon">📋</span>
              <span className="chat-assistant-title">Chat with VNR Admission Assistant</span>
            </div>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender}`} style={{alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                  <div className="chat-message-content">
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </div>
                  <div className="chat-message-time">{msg.time}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="chat-quick-questions">
            <div className="quick-questions-title">Quick Questions:</div>
            <div className="quick-questions-list">
              <button className="quick-question-btn" onClick={() => handleQuickQuestion('What are the eligibility criteria?')}>What are the eligibility criteria?</button>
              <button className="quick-question-btn" onClick={() => handleQuickQuestion('Tell me about the courses offered')}>Tell me about the courses offered</button>
              <button className="quick-question-btn" onClick={() => handleQuickQuestion('What is the fee structure?')}>What is the fee structure?</button>
            </div>
          </section>
          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              className="chat-input"
              placeholder="Ask me anything about VNR VJIET admissions..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button className="chat-send-btn" type="submit">➤</button>
          </form>
        </main>
      </div>
    );
  }

  // Student chat UI
  return (
    <div className="chat-bg">
      <header className="chat-header">
        <div className="chat-header-left">
          <img src="/logo192.png" alt="logo" className="chat-logo" />
          <div>
            <div className="chat-title">VNR VJIET Admission Bot</div>
            <div className="chat-desc">Get instant answers to your admission queries</div>
          </div>
        </div>
        <div className="chat-header-right">
          <div className="chat-user-info">
            <span className="chat-user-name">{userName || 'John Student'}</span>
            <span className="chat-user-role">Student</span>
            <span className="chat-user-icon">👤</span>
          </div>
          <button className="chat-logout-btn" onClick={handleLogout}>↩ Logout</button>
        </div>
      </header>
      <main className="chat-main">
        <section className="chat-card">
          <div className="chat-title-row">
            <span className="chat-assistant-icon">📋</span>
            <span className="chat-assistant-title">Chat with VNR Admission Assistant</span>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`} style={{alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                <div className="chat-message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
                <div className="chat-message-time">{msg.time}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="chat-quick-questions">
          <div className="quick-questions-title">Quick Questions:</div>
          <div className="quick-questions-list">
            <button className="quick-question-btn" onClick={() => handleQuickQuestion('What are the eligibility criteria?')}>What are the eligibility criteria?</button>
            <button className="quick-question-btn" onClick={() => handleQuickQuestion('Tell me about the courses offered')}>Tell me about the courses offered</button>
            <button className="quick-question-btn" onClick={() => handleQuickQuestion('What is the fee structure?')}>What is the fee structure?</button>
          </div>
        </section>
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            className="chat-input"
            placeholder="Ask me anything about VNR VJIET admissions..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
          />
          <button className="chat-send-btn" type="submit">➤</button>
        </form>
      </main>
    </div>
  );
}

export default App;

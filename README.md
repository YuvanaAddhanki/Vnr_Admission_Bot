# VNR VJIET Admission Chatbot

A full-stack web application for VNR VJIET Admission Support, featuring a chatbot for student FAQs and a powerful admin dashboard for managing queries, knowledge base, and analytics.

## Features
- **Student/Applicant:**
  - Register and login (student role)
  - Chatbot answers admission-related FAQs using MongoDB data
  - Quick question buttons for common queries
- **Admin:**
  - Register and login (admin role)
  - Admin dashboard with:
    - Student Queries: View, search, and respond to student questions
    - Knowledge Base: Add, edit, delete chatbot knowledge entries
    - Analytics: View real-time stats (queries, response times, categories, etc.)
  - Switch between dashboard and chat interface

## Tech Stack
- **Frontend:** ReactJS, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcrypt

## Setup Instructions

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vnr-admission-chatbot.git
cd vnr-admission-chatbot
```

### 2. Install Dependencies
#### Backend
```bash
cd backend
npm install
```
#### Frontend
```bash
cd ../frontend-react
npm install
```

### 3. Configure MongoDB
- Make sure MongoDB is running locally (default: `mongodb://localhost:27017/`)
- The database name is `Vnr_Admission_Bot` (can be changed in `backend/server.js`)

### 4. Start the Application
#### Backend
```bash
cd backend
node server.js
```
#### Frontend (in a new terminal)
```bash
cd frontend-react
npm start
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage
- Register as a student or admin.
- Students can chat with the bot and get instant answers.
- Admins can manage queries, knowledge base, and view analytics from the dashboard.

## Project Structure
```
vnr-admission-chatbot/
  backend/           # Express server, API, MongoDB models
  frontend-react/    # React app (UI for students & admin)
  README.md
  package.json
```

## Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

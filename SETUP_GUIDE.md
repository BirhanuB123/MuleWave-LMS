# Quick Setup Guide for MuleWave LMS

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check
```bash
# Verify Node.js installation
node --version  # Should be v14 or higher

# Verify MongoDB installation
mongod --version

# Verify npm
npm --version
```

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mulewave-lms
JWT_SECRET=mulewave_secret_key_2024_change_in_production
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 🎯 First Steps After Setup

### 1. Create Your First Account

Go to http://localhost:3000/register and create an account:
- Choose "Learn" for Student account
- Choose "Teach" for Instructor account

### 2. As a Student

1. Browse courses at `/courses`
2. Filter by category, level, or search
3. Click on a course to view details
4. Enroll in free courses or purchase with PayPal sandbox

### 3. As an Instructor

1. Go to "Instructor Dashboard"
2. Click "Create New Course"
3. Fill in course details:
   - Basic information
   - Learning outcomes
   - Requirements
   - Course lectures

### 4. Testing Payments (PayPal Sandbox)

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Login with your PayPal account
3. Navigate to: Dashboard → My Apps & Credentials
4. Create a REST API app in Sandbox mode
5. Copy Client ID and Secret to `.env` file
6. Use sandbox test accounts for purchases

## 📊 Test Data

### Sample Course Structure

```json
{
  "title": "Complete Web Development Bootcamp",
  "shortDescription": "Learn web development from scratch",
  "description": "A comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and MongoDB",
  "category": "Technology",
  "level": "Beginner",
  "price": 49.99,
  "duration": "40 hours",
  "thumbnail": "https://via.placeholder.com/400x200?text=Web+Dev",
  "learningOutcomes": [
    "Build responsive websites",
    "Create full-stack applications",
    "Master React and Node.js"
  ],
  "requirements": [
    "Basic computer skills",
    "No coding experience required"
  ],
  "lectures": [
    {
      "title": "Introduction to Web Development",
      "description": "Overview of web technologies",
      "videoUrl": "https://www.youtube.com/embed/sample",
      "duration": "20 min"
    }
  ]
}
```

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Error

**Error:** `MongoNetworkError: failed to connect to server`

**Solution:**
```bash
# Check if MongoDB is running
# Mac
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Restart if needed
brew services restart mongodb-community  # Mac
sudo systemctl restart mongod            # Linux
```

### Issue 2: Port 5000 Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill the process
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue 3: JWT Token Errors

**Error:** `JsonWebTokenError: invalid token`

**Solution:**
- Clear browser localStorage
- Re-login to get a fresh token
- Check that JWT_SECRET matches in `.env`

### Issue 4: PayPal Payment Not Working

**Common Causes:**
- Using production credentials in sandbox mode
- Incorrect redirect URLs
- Missing environment variables

**Solution:**
```bash
# Verify PayPal configuration
echo $PAYPAL_MODE        # Should be 'sandbox'
echo $PAYPAL_CLIENT_ID   # Should start with 'A...'
```

## 🎨 Customization Tips

### Change Theme Colors

Edit `frontend/src/index.css`:
```css
:root {
  --primary: #6366f1;      /* Main brand color */
  --secondary: #8b5cf6;    /* Secondary color */
  --success: #10b981;      /* Success messages */
  --danger: #ef4444;       /* Error messages */
}
```

### Modify Course Categories

Edit categories in:
- `frontend/src/pages/CreateCourse.js`
- `frontend/src/pages/EditCourse.js`
- `frontend/src/pages/Courses.js`
- `backend/models/Course.js`

### Add New User Roles

1. Update User model: `backend/models/User.js`
2. Add role to enum: `role: { enum: ['student', 'instructor', 'admin', 'yourRole'] }`
3. Update middleware: `backend/middleware/auth.js`

## 📱 Development Workflow

### Recommended VS Code Extensions
- ESLint
- Prettier
- MongoDB for VS Code
- REST Client
- GitLens

### Code Structure Best Practices
1. Keep components small and reusable
2. Use meaningful variable names
3. Add comments for complex logic
4. Follow React hooks rules
5. Validate all user inputs

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a secure random string
- [ ] Update MongoDB URI to production database
- [ ] Switch PayPal to live mode
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure backup strategy
- [ ] Set up monitoring (e.g., PM2)
- [ ] Optimize images and assets
- [ ] Enable compression
- [ ] Set up CDN for static files

## 📚 Learning Resources

### React
- [Official React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)

### Node.js & Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### MongoDB
- [MongoDB University](https://university.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com/docs/guide.html)

### PayPal Integration
- [PayPal Developer Docs](https://developer.paypal.com/docs/api/overview/)

## 💡 Pro Tips

1. **Use MongoDB Compass** for visual database management
2. **Install Postman** for API testing
3. **Use React Developer Tools** browser extension
4. **Enable hot reload** for faster development
5. **Keep dependencies updated** with `npm update`
6. **Use environment variables** for all configuration
7. **Write meaningful commit messages**
8. **Test on multiple browsers** before deployment

## 🆘 Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Search existing [GitHub Issues](https://github.com/yourusername/mulewave-lms/issues)
- Create a new issue with detailed information
- Join our community Discord (link here)

---

**Happy Coding! 🎉**


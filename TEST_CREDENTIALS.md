# 🔐 TEST CREDENTIALS - MuleWave LMS

## 📋 **Pre-configured Test Accounts**

Your platform already has test credentials configured in `backend/seedData.js`!

---

## 👥 **USER ACCOUNTS**

### **1. INSTRUCTOR ACCOUNT** 👨‍🏫
```
📧 Email: birhanu@mulewave.com
🔑 Password: password123
👤 Role: Instructor
📝 Name: Birhanu Getu
```

**What you can do:**
- ✅ Create new courses
- ✅ Edit existing courses
- ✅ View instructor dashboard
- ✅ Manage course content (lectures, assignments, quizzes)
- ✅ Grade student submissions
- ✅ View analytics
- ✅ Post announcements
- ✅ Manage discussions

---

### **2. STUDENT ACCOUNT** 🎓
```
📧 Email: john@gmail.com
🔑 Password: password123
👤 Role: Student
📝 Name: John Doe
```

**What you can do:**
- ✅ Browse and enroll in courses
- ✅ View enrolled courses
- ✅ Watch lectures
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Participate in discussions
- ✅ View grades and progress
- ✅ Access calendar and to-do list
- ✅ Use the modern Halo-style dashboard

---

## 🚀 **HOW TO USE THESE CREDENTIALS**

### **Method 1: Already Seeded** (If you ran seedData.js)
Just login directly:
1. Go to: `http://localhost:3000/login`
2. Use one of the credentials above
3. Click "Sign In"

### **Method 2: Run Seed Script** (If database is empty)
```bash
# Make sure MongoDB is running first!
cd backend
node seedData.js
```

This will:
- ✅ Create the instructor account
- ✅ Create the student account
- ✅ Create 6 sample courses (including 1 FREE course)
- ✅ Link courses to the instructor

---

## 📚 **PRE-LOADED COURSES**

The seed script creates these courses:

### **1. Complete Web Development Bootcamp 2025**
- **Price**: $49.99
- **Level**: Beginner
- **Duration**: 40 hours
- **4 lectures included**

### **2. React JS - The Complete Guide 2025**
- **Price**: $39.99
- **Level**: Intermediate
- **Duration**: 30 hours
- **3 lectures included**

### **3. Python for Data Science and Machine Learning**
- **Price**: $59.99
- **Level**: Beginner
- **Duration**: 50 hours
- **2 lectures included**

### **4. Digital Marketing Masterclass 2024**
- **Price**: $44.99
- **Level**: All Levels
- **Duration**: 25 hours
- **2 lectures included**

### **5. UI/UX Design - Complete User Experience Course**
- **Price**: $34.99
- **Level**: Beginner
- **Duration**: 20 hours
- **2 lectures included**

### **6. FREE Introduction to Programming** 🎁
- **Price**: FREE ($0)
- **Level**: Beginner
- **Duration**: 5 hours
- **2 lectures included**

---

## 🎯 **TESTING SCENARIOS**

### **Test as STUDENT** (john@gmail.com)

#### Scenario 1: Enroll in FREE Course
1. Login as student
2. Browse courses
3. Click on "FREE Introduction to Programming"
4. Click "Enroll for Free"
5. Go to "My Courses"
6. Start learning!

#### Scenario 2: Purchase a Paid Course
1. Login as student
2. Browse courses
3. Select a paid course
4. Click "Buy Now"
5. Complete PayPal payment (use sandbox account)
6. Course added to "My Courses"

#### Scenario 3: Test New Dashboard
1. Login as student
2. Automatically redirected to `/dashboard`
3. See modern Halo-style dashboard
4. Try:
   - ✅ View course cards with progress
   - ✅ Click accessibility button (bottom-right)
   - ✅ Click "Calendar" button
   - ✅ Click "To-Do" button
   - ✅ Click "Notifications" button

#### Scenario 4: Complete Course Activities
1. Go to enrolled course
2. Watch lectures
3. Take quizzes
4. Submit assignments
5. Join discussions
6. Track progress

---

### **Test as INSTRUCTOR** (birhanu@mulewave.com)

#### Scenario 1: Create New Course
1. Login as instructor
2. Go to Instructor Dashboard
3. Click "Create Course"
4. Fill course details
5. Add lectures, assignments, quizzes
6. Publish course

#### Scenario 2: Manage Students
1. View enrolled students
2. Grade assignments
3. Provide feedback
4. Track student progress

#### Scenario 3: Course Management
1. Edit existing courses
2. Add new lectures
3. Create announcements
4. Manage discussions
5. Set up gradebook

---

## 🔧 **CREATE ADDITIONAL TEST ACCOUNTS**

### **Manual Registration:**
1. Go to: `http://localhost:3000/register`
2. Fill in the form
3. Choose role: Student or Instructor
4. Submit

### **Using API (Postman/curl):**

**Create Student:**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "password123",
    "role": "student"
  }'
```

**Create Instructor:**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Mike",
    "lastName": "Johnson",
    "email": "mike@example.com",
    "password": "password123",
    "role": "instructor"
  }'
```

---

## 🔐 **ADMIN ACCOUNT** (Create if needed)

To create an admin account, you need to:

### **Option 1: Modify seedData.js**
Add this to `seedData.js` after line 45:

```javascript
// Create admin user
const admin = await User.create({
  firstName: 'Admin',
  lastName: 'MuleWave',
  email: 'admin@mulewave.com',
  password: 'admin123',
  role: 'admin',
  bio: 'System Administrator'
});

console.log('📧 Admin: admin@mulewave.com / admin123');
```

Then run:
```bash
node backend/seedData.js
```

### **Option 2: Manually via MongoDB**
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "birhanu@mulewave.com" },
  { $set: { role: "admin" } }
)
```

---

## 💳 **PAYPAL TESTING**

For testing payments, use PayPal Sandbox accounts:

### **Test Buyer Account** (Use this to buy courses)
1. Go to: https://developer.paypal.com
2. Create sandbox buyer account
3. Use those credentials during checkout

### **Common Test Cards:**
```
Visa: 4032035985764397
Expiry: Any future date
CVV: Any 3 digits
```

---

## 🧪 **TESTING CHECKLIST**

### **Authentication:**
- [ ] Login as student
- [ ] Login as instructor
- [ ] Login as admin (if created)
- [ ] Logout
- [ ] Register new account

### **Student Features:**
- [ ] Browse courses
- [ ] Enroll in free course
- [ ] Purchase paid course (PayPal)
- [ ] View enrolled courses
- [ ] Watch lectures
- [ ] Submit assignment
- [ ] Take quiz
- [ ] Post in discussion
- [ ] View grades
- [ ] Check calendar
- [ ] Manage to-do list
- [ ] View notifications
- [ ] Use accessibility menu

### **Instructor Features:**
- [ ] Create new course
- [ ] Edit course
- [ ] Add lectures
- [ ] Create assignments
- [ ] Create quizzes
- [ ] Grade submissions
- [ ] Post announcements
- [ ] View analytics
- [ ] Manage students

### **New Features:**
- [ ] Modern dashboard loads
- [ ] Course cards display
- [ ] Analytics cards show data
- [ ] Calendar page works
- [ ] To-do page works
- [ ] Notifications page works
- [ ] Accessibility menu works
- [ ] OAuth callback (if configured)

---

## 📝 **QUICK REFERENCE**

### **All Test Credentials at a Glance:**

| Role | Email | Password | Name |
|------|-------|----------|------|
| 👨‍🏫 Instructor | birhanu@mulewave.com | password123 | Birhanu Getu |
| 🎓 Student | john@gmail.com | password123 | John Doe |
| 👑 Admin | admin@mulewave.com* | admin123* | Admin MuleWave |

*Admin account needs to be created manually (see above)

---

## 🚀 **QUICK START**

### **1. Run the Seed Script:**
```bash
cd backend
node seedData.js
```

### **2. Start Your App:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### **3. Login:**
```
URL: http://localhost:3000/login

Student: john@gmail.com / password123
Instructor: birhanu@mulewave.com / password123
```

### **4. Explore:**
- 🎓 Student → See modern dashboard, enroll in courses
- 👨‍🏫 Instructor → Create/manage courses
- 🎨 Try accessibility features
- 📅 Use calendar and to-do lists

---

## 🆘 **TROUBLESHOOTING**

### **Issue: "Invalid credentials"**
**Solution**: Run the seed script first:
```bash
cd backend
node seedData.js
```

### **Issue: "No courses showing"**
**Solution**: Seed script creates 6 courses automatically. Run it!

### **Issue: "Can't login"**
**Solution**: 
1. Check MongoDB is running
2. Check backend server is running on port 3001
3. Verify email/password is correct

---

## 🎉 **YOU'RE ALL SET!**

Use these credentials to test all features of your MuleWave LMS!

**Recommended Testing Flow:**
1. ✅ Login as student → Test modern dashboard
2. ✅ Enroll in FREE course
3. ✅ Try calendar/todo/notifications
4. ✅ Use accessibility menu
5. ✅ Login as instructor → Create course
6. ✅ Test all CRUD operations

**Happy Testing!** 🚀

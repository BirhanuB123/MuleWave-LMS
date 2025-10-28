const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data (optional - comment out if you don't want to clear)
    await Course.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample instructor
    const instructor = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'instructor@mulewave.com',
      password: 'password123',
      role: 'instructor',
      bio: 'Experienced software engineer with 10+ years of teaching experience. Passionate about making complex topics easy to understand.'
    });

    // Create sample student
    const student = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'student@mulewave.com',
      password: 'password123',
      role: 'student'
    });

    console.log('✅ Created sample users');
    console.log('📧 Instructor: instructor@mulewave.com / password123');
    console.log('📧 Student: student@mulewave.com / password123');

    // Create sample courses
    const courses = [
      {
        title: 'Complete Web Development Bootcamp 2024',
        shortDescription: 'Learn full-stack web development from scratch - HTML, CSS, JavaScript, React, Node.js, and MongoDB',
        description: `Master web development with this comprehensive bootcamp! This course covers everything you need to become a professional full-stack developer.

What you'll learn:
• Frontend development with HTML5, CSS3, and modern JavaScript
• Responsive design and CSS frameworks
• React.js for building dynamic user interfaces
• Backend development with Node.js and Express
• Database management with MongoDB
• RESTful API design and implementation
• Authentication and security best practices
• Deployment to production

This course includes hands-on projects, real-world examples, and lifetime access to all materials. Perfect for beginners and those looking to level up their skills!`,
        instructor: instructor._id,
        category: 'Technology',
        level: 'Beginner',
        price: 49.99,
        duration: '40 hours',
        language: 'English',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
        requirements: [
          'Basic computer skills',
          'No coding experience required',
          'A computer with internet connection',
          'Willingness to learn and practice'
        ],
        learningOutcomes: [
          'Build responsive websites from scratch',
          'Create full-stack web applications',
          'Master React and Node.js',
          'Work with databases and APIs',
          'Deploy applications to the cloud',
          'Implement user authentication',
          'Follow industry best practices'
        ],
        lectures: [
          {
            title: 'Welcome to the Course',
            description: 'Introduction to the course structure and what you will learn',
            videoUrl: 'https://www.youtube.com/embed/qz0aGYrrlhU',
            duration: '10 min',
            order: 0
          },
          {
            title: 'HTML Fundamentals',
            description: 'Learn the basics of HTML5 and semantic markup',
            videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg',
            duration: '45 min',
            order: 1
          },
          {
            title: 'CSS Styling and Layout',
            description: 'Master CSS for beautiful, responsive designs',
            videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
            duration: '60 min',
            order: 2
          },
          {
            title: 'JavaScript Basics',
            description: 'Introduction to JavaScript programming',
            videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            duration: '90 min',
            order: 3
          }
        ],
        isPublished: true
      },
      {
        title: 'React JS - The Complete Guide 2024',
        shortDescription: 'Master React including Hooks, Context API, Redux, and Next.js. Build modern web applications.',
        description: `Become a React expert with this comprehensive course! Learn everything from basics to advanced concepts.

Course Highlights:
• React fundamentals and component architecture
• State management with Hooks and Redux
• Building reusable components
• React Router for navigation
• Performance optimization techniques
• Testing React applications
• Next.js for server-side rendering
• Real-world project development

This course is constantly updated with the latest React features and best practices. Join thousands of students who have mastered React!`,
        instructor: instructor._id,
        category: 'Technology',
        level: 'Intermediate',
        price: 39.99,
        duration: '30 hours',
        language: 'English',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        requirements: [
          'Basic HTML, CSS, and JavaScript knowledge',
          'Understanding of ES6 JavaScript features',
          'Familiarity with command line basics'
        ],
        learningOutcomes: [
          'Build modern React applications',
          'Master React Hooks and Context API',
          'Implement state management with Redux',
          'Create responsive user interfaces',
          'Optimize React app performance',
          'Test React components effectively'
        ],
        lectures: [
          {
            title: 'Introduction to React',
            description: 'Understanding React and its ecosystem',
            videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM',
            duration: '20 min',
            order: 0
          },
          {
            title: 'Components and JSX',
            description: 'Building your first React components',
            videoUrl: 'https://www.youtube.com/embed/0sSJeokrcSg',
            duration: '35 min',
            order: 1
          },
          {
            title: 'State and Props',
            description: 'Managing component state and passing data',
            videoUrl: 'https://www.youtube.com/embed/IYvD9oBCuJI',
            duration: '40 min',
            order: 2
          }
        ],
        isPublished: true
      },
      {
        title: 'Python for Data Science and Machine Learning',
        shortDescription: 'Complete Python bootcamp for data science, machine learning, and AI. Includes NumPy, Pandas, Matplotlib, and Scikit-learn.',
        description: `Master Python for data science and machine learning with this hands-on course!

What's Included:
• Python programming fundamentals
• NumPy for numerical computing
• Pandas for data manipulation
• Data visualization with Matplotlib and Seaborn
• Machine Learning with Scikit-learn
• Deep Learning introduction
• Real-world data science projects
• Career guidance and interview prep

Perfect for aspiring data scientists and anyone interested in AI and machine learning!`,
        instructor: instructor._id,
        category: 'Technology',
        level: 'Beginner',
        price: 59.99,
        duration: '50 hours',
        language: 'English',
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
        requirements: [
          'No prior programming experience required',
          'Basic mathematics knowledge helpful',
          'Computer with Python installed'
        ],
        learningOutcomes: [
          'Master Python programming',
          'Analyze data with Pandas and NumPy',
          'Create data visualizations',
          'Build machine learning models',
          'Work with real datasets',
          'Deploy ML models to production'
        ],
        lectures: [
          {
            title: 'Python Installation and Setup',
            description: 'Getting started with Python',
            videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
            duration: '15 min',
            order: 0
          },
          {
            title: 'Python Basics',
            description: 'Variables, data types, and operators',
            videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
            duration: '45 min',
            order: 1
          }
        ],
        isPublished: true
      },
      {
        title: 'Digital Marketing Masterclass 2024',
        shortDescription: 'Complete digital marketing course: SEO, Social Media, Email Marketing, Google Ads, and Analytics.',
        description: `Become a digital marketing expert with this comprehensive masterclass!

Course Content:
• SEO and content marketing strategies
• Social media marketing (Facebook, Instagram, LinkedIn)
• Email marketing automation
• Google Ads and PPC campaigns
• Marketing analytics and ROI tracking
• Conversion optimization
• Marketing funnels and customer journey
• Brand building and strategy

Learn from real campaigns and case studies. Perfect for entrepreneurs, marketers, and business owners!`,
        instructor: instructor._id,
        category: 'Marketing',
        level: 'All Levels',
        price: 44.99,
        duration: '25 hours',
        language: 'English',
        thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&h=400&fit=crop',
        requirements: [
          'No prior marketing experience needed',
          'Basic computer and internet skills',
          'Enthusiasm to learn digital marketing'
        ],
        learningOutcomes: [
          'Master SEO and content marketing',
          'Run successful social media campaigns',
          'Create effective email marketing',
          'Manage Google Ads campaigns',
          'Analyze marketing performance',
          'Build a complete marketing strategy'
        ],
        lectures: [
          {
            title: 'Introduction to Digital Marketing',
            description: 'Overview of digital marketing landscape',
            videoUrl: 'https://www.youtube.com/embed/nU-IIXBWlS4',
            duration: '25 min',
            order: 0
          },
          {
            title: 'SEO Fundamentals',
            description: 'Search engine optimization basics',
            videoUrl: 'https://www.youtube.com/embed/DvwS7cV9GmQ',
            duration: '40 min',
            order: 1
          }
        ],
        isPublished: true
      },
      {
        title: 'UI/UX Design - Complete User Experience Course',
        shortDescription: 'Learn UI/UX design from scratch. Figma, user research, wireframing, prototyping, and design systems.',
        description: `Master UI/UX design and create beautiful, user-friendly interfaces!

What You'll Learn:
• Design thinking and user research
• Wireframing and prototyping
• UI design principles and best practices
• Figma mastery
• Design systems and components
• Mobile and web design
• Usability testing
• Portfolio development

Includes real-world projects and professional feedback. Start your design career today!`,
        instructor: instructor._id,
        category: 'Design',
        level: 'Beginner',
        price: 34.99,
        duration: '20 hours',
        language: 'English',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
        requirements: [
          'No design experience required',
          'Computer with internet connection',
          'Figma account (free)'
        ],
        learningOutcomes: [
          'Design beautiful user interfaces',
          'Conduct user research effectively',
          'Create wireframes and prototypes',
          'Master Figma design tool',
          'Build a professional portfolio',
          'Understand UX principles'
        ],
        lectures: [
          {
            title: 'Introduction to UI/UX Design',
            description: 'What is UI/UX and why it matters',
            videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
            duration: '18 min',
            order: 0
          },
          {
            title: 'Design Thinking Process',
            description: 'Understanding the design thinking methodology',
            videoUrl: 'https://www.youtube.com/embed/_r0VX-aU_T8',
            duration: '30 min',
            order: 1
          }
        ],
        isPublished: true
      },
      {
        title: 'FREE Introduction to Programming',
        shortDescription: 'Start your coding journey with this free course! Learn programming basics and fundamental concepts.',
        description: `Begin your programming journey with this completely FREE introductory course!

Course Overview:
• Programming fundamentals
• Problem-solving techniques
• Introduction to algorithms
• Basic data structures
• Hands-on coding exercises
• Career guidance in tech

Perfect for absolute beginners who want to explore programming before committing to a full course!`,
        instructor: instructor._id,
        category: 'Technology',
        level: 'Beginner',
        price: 0, // FREE COURSE
        duration: '5 hours',
        language: 'English',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
        requirements: [
          'No prior experience needed',
          'Just a computer and willingness to learn'
        ],
        learningOutcomes: [
          'Understand programming basics',
          'Write your first program',
          'Learn problem-solving skills',
          'Explore different programming languages'
        ],
        lectures: [
          {
            title: 'What is Programming?',
            description: 'Introduction to the world of coding',
            videoUrl: 'https://www.youtube.com/embed/zOjov-2OZ0E',
            duration: '20 min',
            order: 0
          },
          {
            title: 'Your First Program',
            description: 'Writing and running your first code',
            videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
            duration: '30 min',
            order: 1
          }
        ],
        isPublished: true
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    
    // Update instructor's created courses
    instructor.createdCourses = createdCourses.map(course => course._id);
    await instructor.save();

    console.log(`✅ Created ${createdCourses.length} sample courses`);
    console.log('\n📚 Sample Courses:');
    createdCourses.forEach(course => {
      console.log(`   - ${course.title} ($${course.price})`);
    });

    console.log('\n✨ Seed data created successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to http://localhost:3001');
    console.log('   2. Login as instructor@mulewave.com or student@mulewave.com');
    console.log('   3. Browse and enroll in courses');
    console.log('   4. Test the PayPal payment for paid courses!');
    console.log('\n💳 PayPal Test: Use sandbox accounts from PayPal Developer Dashboard');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seed
connectDB().then(() => {
  seedData();
});


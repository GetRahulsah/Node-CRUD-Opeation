const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

// In-memory user storage
const users = [];

// Sample user (you should replace this with real user data)
const sampleUser = {
  id: 1,
  name: 'Sample User',
  email: 'sample@example.com',
  phoneNumber: '123-456-7890',
  address: '123 Main St',
  department: 'Sample Department',
  username: 'sampleuser',
  // Hashed password for "password123"
  passwordHash: '$2b$10$L8ybz8cHokfbS7nOwViFfu4yEK9dfDaF3ZDNCMQdf82Zu8A8pFFA6'
};

// Add the sample user to the users array
users.push(sampleUser);

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
};

// Display all users
app.get('/', authenticateUser, (req, res) => {
  try {
    const loggedInUser = users.find(user => user.id === req.session.userId);
    res.render('index', { users: users, user: loggedInUser });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

// CRUD operations

// Display add user form
app.get('/add', authenticateUser, (req, res) => {
  res.render('add');
});

// Handle add user form submission
app.post('/add', authenticateUser, async (req, res) => {
  try {
    const { name, email, phoneNumber, address, department } = req.body;

    // Create a new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      phoneNumber,
      address,
      department
    };

    // Save the user in the in-memory storage
    users.push(newUser);

    res.redirect('/');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Display edit user form
app.get('/edit/:id', authenticateUser, (req, res) => {
  const id = parseInt(req.params.id);
  const userToEdit = users.find(user => user.id === id);

  if (userToEdit) {
    res.render('edit', { user: userToEdit });
  } else {
    res.status(404).send('User not found');
  }
});

// Handle edit user form submission
app.post('/edit/:id', authenticateUser, (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, phoneNumber, address, department } = req.body;
  const userToEdit = users.find(user => user.id === id);

  if (userToEdit) {
    // Update user information
    userToEdit.name = name;
    userToEdit.email = email;
    userToEdit.phoneNumber = phoneNumber;
    userToEdit.address = address;
    userToEdit.department = department;

    res.redirect('/');
  } else {
    res.status(404).send('User not found');
  }
});

// Handle delete user
app.get('/delete/:id', authenticateUser, (req, res) => {
  const id = parseInt(req.params.id);
  const userToDeleteIndex = users.findIndex(user => user.id === id);

  if (userToDeleteIndex !== -1) {
    // Remove user from the in-memory storage
    users.splice(userToDeleteIndex, 1);

    res.redirect('/');
  } else {
    res.status(404).send('User not found');
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && await bcrypt.compare(password, user.passwordHash)) {
    // Set the userId in the session
    req.session.userId = user.id;
    res.redirect('/');
  } else {
    // Pass the 'error' property to the render function
    res.render('login', { error: 'Invalid username or password' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Register route
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if username is already taken
  if (users.some(user => user.username === username)) {
    res.render('register', { error: 'Username is already taken' });
    return;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = {
    id: users.length + 1,
    username,
    passwordHash
  };

  // Save the user in the in-memory storage
  users.push(newUser);

  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})
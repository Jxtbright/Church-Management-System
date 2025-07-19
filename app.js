
const express = require("express");
const path = require('path');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ejsmate = require('ejs-mate')
const mongoSanitize = require('express-mongo-sanitize');


const Member = require('./models/members');
const User = require('./models/users');
const Group = require('./models/groups');
const Church = require('./models/churches');
const Attendance = require('./models/attendance.js');

const membersRoutes = require('./routes/members');
const usersRoutes = require('./routes/users');
const groupsRoutes = require('./routes/groups');
const churchesRoutes = require('./routes/churches');
const attendanceRoutes = require('./routes/attendance');
const novalidationRoutes = require('./routes/novalidation');

const isloggedin = require('./utils/authisloggedin.js');
const { adminstatus, pastorstatus, grouppastorstatus, managerstatus } = require('./utils/authstatus.js');
const ExpressError = require('./utils/ExpressError.js');
require('dotenv').config();

const app = express();

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const port = process.env.PORT || 4000


async function connection() {
  try {
    await mongoose.connect(process.env.Database_url);
    app.listen(port, () => {
      console.log("Server is running on port 5000");
    });
  } catch (err) {
    const { status = 500, message = 'Something went wrong, please try again later.' } = err;
    console.error(`Error (${status}): ${message}`);
    // Optional: exit the process if DB connection fails
    process.exit(1);
  }
}
connection();

const store = new MongodbSession({
  uri: process.env.Database_url,
  collection: 'mySessions'
});

const sessionConfig = {
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 120 * 12),
    maxAge: 1000 * 60 * 120 * 12
  }
}

app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})
app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());



app.use('', novalidationRoutes);

app.use(isloggedin);
app.use(adminstatus);
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) { throw new ExpressError('Log out failed', 500) }
    res.redirect('/');
  });
});
app.use('/church', churchesRoutes);
app.use('/member', membersRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/user', usersRoutes);
app.use('/group', groupsRoutes);

app.use(/(.*)/, (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { status = 500, message ='Something went wrong, please try again later.'} = err;
    res.status(status).send(message)
});

// app.use((err, req, res, next) => {
//   res.status(500).send(`
//     <html>
//       <head>
//         <style>
//           body {
//             display: flex;
//             justify-content: center;
//             align-items: flex-start;
//             height: 100vh;
//             margin: 0;
//             padding-top: 40px;
//             font-family: Arial, sans-serif;
//           }
//           .message {
//             font-weight: bold;
//             font-size: 18px;
//             color: red;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="message"><h3>Server Error, please try again later.</h3></div>
//       </body>
//     </html>
//   `);
// });

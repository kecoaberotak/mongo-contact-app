const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// Ngambil koneksi db dan model
require('./utilities/db');
const Contact = require('./model/contact');

app = express();
const port = 3000;

// Setup view engine - ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public')); // biar folder public yg isinya assets bisa dipake
app.use(express.urlencoded({extended: true}));

// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
  cookie: {maxAge:  6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());


// Halaman Home
app.get('/', (req, res) => {
  const member = [
    {
      nama : 'Bruce',
      email : 'bruce@gmail.com'
    },
    {
      nama : 'Dick',
      email : 'dick@gmail.com'
    },
    {
      nama : 'Damian',
      email : 'damian@gmail.com'
    },
  ];

  res.render('index', {
    nama : 'John Doe',
    title : 'Halaman Utama',
    member : member,
    layout : 'layouts/main-layout.ejs'});
});


// Halaman About
app.get('/about', (req, res) => {
  res.render('about', {title : 'Halaman About', layout : 'layouts/main-layout.ejs'});
});


// Halaman Contact
app.get('/contact', async (req, res) => {
  const contacts = await Contact.find();

  res.render('contact', {
    title: 'Halaman Contact',
    layout: 'layouts/main-layout',
    contacts,
    msg: req.flash('msg')
  });

});


app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

app = express();
const port = 3000;

// Setup view engine - ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public')); // biar folder public yg isinya assets bisa dipake
app.use(express.urlencoded({extended: true}));

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
app.get('/contact', (req, res) => {
  const contacts = loadContacts();

  res.render('contact', 
  {
    title : 'Halaman Contact', 
    layout : 'layouts/main-layout.ejs', 
    contacts, 
    msg : req.flash('msg')});
});


app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});
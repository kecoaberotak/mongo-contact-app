const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {body, validationResult, check} = require('express-validator');

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


// Halaman About
app.get('/about', (req, res) => {
  res.render('about', {title : 'Halaman About', layout : 'layouts/main-layout.ejs'});
});


// Halaman Form Tambah Contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {title : 'Form Tambah Contact', layout : 'layouts/main-layout.ejs'});
});


// Proses Tambah Data Contact
app.post('/contact', 
[
  body('nama').custom(async value => {
    const duplikat = await Contact.findOne({nama: value});
    if(duplikat){
      throw new Error('Nama sudah ada');
    }
    return true;
  }),
  check('email', 'Email Tidak Valid').isEmail(), 
  check('nomorHp', 'Nomor HP Tidak Valid').isMobilePhone('id-ID')
] ,(req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('add-contact', 
    {
      title   : 'Form Tambah Contact', 
      layout  : 'layouts/main-layout.ejs',
      errors  : errors.array()
    });
  }else {
    // Pakai insertMany karena bentuknya udah object
    Contact.insertMany(req.body, (error, result) => {
      req.flash('msg', 'Data berhasil ditambahkan');
      res.redirect('/contact');
    });
  };
});


// Halaman Detail Contact
// Harus diletakkan paling akhir, biar route lain kebaca
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama});

  res.render('detail', {title : 'Halaman Detail Contact', layout : 'layouts/main-layout.ejs', contact});
});


app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});
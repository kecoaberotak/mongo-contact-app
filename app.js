const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {body, validationResult, check} = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// Ngambil koneksi db dan model
require('./utilities/db');
const Contact = require('./model/contact');

app = express();
const port = 3000;

// Setup Method-Override
app.use(methodOverride('_method'));


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


// Proses Hapus Contact
// Versi 1 - ga pake override
// app.get('/contact/delete/:nama', async(req, res) => {
//   const contact = await Contact.findOne({nama: req.params.nama});

//   if(!contact){
//     res.status(404);
//     res.send('<h1>404</h1>');
//   }else {
//     Contact.deleteOne({_id: contact._id}).then(result => {
//       req.flash('msg', 'Data berhasil dihapus');
//       res.redirect('/contact');
//     });
//   }
// });

// Versi 2 - pake override
app.delete('/contact', (req, res) => {
  Contact.deleteOne({nama: req.body.nama}).then(result => {
    req.flash('msg', 'Data berhasil dihapus');
    res.redirect('/contact');
  });
});


// Halaman Form Edit Data Contact
app.get('/contact/edit/:nama', async(req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama})
  res.render('edit-contact', {title : 'Form Edit Contact', layout : 'layouts/main-layout.ejs', contact});
});


// Proses Edit Data Contact
app.put('/contact', 
[
  body('nama').custom(async (value, {req}) => {
    const duplikat = await Contact.findOne({nama: value});
    if(value !== req.body.oldNama && duplikat){
      throw new Error('Nama sudah digunakan');
    }
    return true;
  }),
  check('email', 'Email Tidak Valid').isEmail(), 
  check('nomorHp', 'Nomor HP Tidak Valid').isMobilePhone('id-ID')
] ,(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('edit-contact', 
    {
      title   : 'Form Edit Contact', 
      layout  : 'layouts/main-layout.ejs',
      errors  : errors.array(),
      contact : req.body
    });
  } else {
    Contact.updateOne(
        {_id: req.body._id},
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nomorHp: req.body.nomorHp
          }
        }
      ).then(result => {
        req.flash('msg', 'Data berhasil diubah');
        res.redirect('/contact');
      });
  };
});

// Halaman Detail Contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama});

  res.render('detail', {title : 'Halaman Detail Contact', layout : 'layouts/main-layout.ejs', contact});
});


app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});
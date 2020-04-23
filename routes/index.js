var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })
mongoose.connect('mongodb://localhost:27017/images');
var PSchema = mongoose.Schema({
    name: { type: String, requied: true },
    img: { data: Buffer, contentType: String }
});
var Person = mongoose.model('Person', PSchema);
//Upload 
router.post('/uploadfile', upload.single('filesent'), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file);
});

router.post('/uploadmultiple', upload.array('filessent', 5), (req, res, next) => {
    const files = req.files
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }

    res.send(files)

});
// To Store in Database 
router.post('/uploadphoto', upload.single('picture'), (req, res) => {
    var rec = new Person;
    rec.name = req.body.name;
    rec.img.data = fs.readFileSync(req.file.path);
    rec.img.contentType = 'image/png';
    rec.save((err, result) => {
        console.log(result)

        if (err) return console.log(err)
        console.log('saved to database')
        res.send(rec);
    })
});
router.get('/img/:fname', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../uploads/' + req.params.fname));
});

router.get('/record/:id', function(req, res, next) {
    Person.findById(
        req.params.id,
        function(err, doc) {
            if (err) return next(err);
            res.contentType(doc.img.contentType);
            res.send(doc.img.data);
        });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
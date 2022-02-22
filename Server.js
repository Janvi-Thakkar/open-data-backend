const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const user = require('./user.model.js')
const bcrypt = require('bcryptjs');
const port = process.env.PORT||3100;
const connection_url = "mongodb+srv://janvi_1103:opendata@cluster0.vb1zr.mongodb.net/test";
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const conn = mongoose.createConnection(connection_url);
Grid.mongo = mongoose.mongo;

// TO AVOID CORS POLICY ERRORS
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(express.json())
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


//TO LISTEN THE PORT
app.listen(port);
mongoose.connect(connection_url, {
    dbName: "open-data"
});



app.post('/api/signin', async (req, res) => {
    let signInUser = ""
    if (req.body.email != null && req.body.email != "" && req.body.org != null && req.body.org != "" && req.body.name != null && req.body.name != "") {
        signInUser = await user.findOne({
            email: req.body.email,
        })


        if (!signInUser) {
            try {
                const RegisterUser = await user.create({
                    'org': req.body.org,
                    'name': req.body.name,
                    'email': req.body.email,
                    "contacts": [{
                    }]
                    
                })
                res.status(200).send({ status: "ok", code: 200, result: RegisterUser });
            }
            catch (error) {
                res.status(401).send({ status: error, code: 401, error: "Please Try Again" });
            }
        }
        else {
            res.status(200).send({ status: "ok", code: 200, result: signInUser });
        }


    }


    else {
        res.status(401).send({ status: error, code: 401, error: "Please Try Again"  });
    }
    return res;

})

let gridfsBucket;
let gfs;
conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');

    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
} )

    // Create storage engine
    const storage = new GridFsStorage({
        url: connection_url,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        }
    });

    const upload = multer({ storage });


    app.patch('/api/addData', async (req, res) => {

        if (req.body.type == 'link') {
            user.updateOne({ email: req.body.email }, {
                $push: {
                    data: {
                        link: req.body.url,
                        title: req.body.title,
                        desc: req.body.desc,
                        keywords: req.body.keys,
                        category: req.body.cate,
                        license: req.body.license,
                        comment: req.body.comment,
                        date: req.body.date,
                        file: req.body.file,
                        id: req.body.id
                    }
                }
            }).then(result => {
                console.log(result)
                res.status(200).json({ status: "ok", code: 200, result: result });

            }).catch(error => {

                res.status(401).json({ status: "error", code: 401, error: error });
            })
        }
        else {
            user.updateOne({ email: req.body.email }, {
                $push: {
                    data: {
                        link: req.body.url,
                        title: req.body.title,
                        desc: req.body.desc,
                        keywords: req.body.keys,
                        category: req.body.cate,
                        license: req.body.license,
                        comment: req.body.comment,
                        date: req.body.date,
                        file: req.body.file,
                        id:req.body.id
                    }
                }
            }).then(result => {
                res.status(200).json({ status: "ok", code: 200, result: result });
            }).catch(error => {
                res.status(401).json({ status: "error", code: 401, error: error });
            })
        }

    })


app.post('/api/addFileData', upload.single('file'), (req, res) => {
    res.status(200).json({ status: "ok", code: 200, result:req.file.id })
});


app.get('/api/users', async (req, res) => {

    user.find({}).then(result => {
        res.status(200).json({ status: "ok", code: 200, result: result });
    }).catch(error => {
        res.status(401).json({ status: "error", code: 401, error: error });
    })
   
})



app.get('/api/files', (req, res) => {
    conn.once('open', () => {
        // Init stream
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');

        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });
    })

    gfs.collection('uploads').findOne({ _id: mongoose.Types.ObjectId(req.query.id) }, function (err, file) {
    if (err) {
        return res.status(400).send(err);
    }
    else if (!file) {
        return res.status(404).send('Error on the database looking for the file.');
    }

    //res.set('Content-Type', file.contentType);
    //res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        let mimeType = file.contentType;
        if (!mimeType) {
            mimeType = mime.lookup(file.filename);
        }
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': 'attachment; filename=' + file.filename
        });
        console.log(file)
        var readstream = gridfsBucket.openDownloadStream(mongoose.Types.ObjectId(req.query.id));

    readstream.on("error", function (err) {
        res.end();
    });
     
    readstream.pipe(res);
});
})




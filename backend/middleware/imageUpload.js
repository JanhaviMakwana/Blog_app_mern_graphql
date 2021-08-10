const multer = require('multer');
const fs = require('fs');

const fileStorage = multer.diskStorage({

    destination: (req, file, cb) => {
    
        const dest = `images`
        fs.access(dest, error => {
            if (error) {
                return fs.mkdir(dest, (error) => {
                  
                    cb(error, dest);
                })
            } else {
        
                return cb(null, dest);
            }
        })

    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

module.exports = app => {
    app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
};
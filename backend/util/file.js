
const path = require('path');
const fs = require('fs');

clearImage = filePath => {
    filepath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('err'));
}

exports.clearImage = clearImage;
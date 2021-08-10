const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');


const config = require('./config/config');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const {clearImage} = require('./util/file');

const app = express();

app.use(express.json()); //application/json

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT ,POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

require('./middleware/imageUpload')(app);
app.use(auth);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated!');
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!' });
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    console.log(req.file.path);
    return res.status(201).json({ message: 'File stored.', filePath: req.file.path });
});



app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An Error occurred !';
        const code = err.originalError.code || 500;
        return { message: message, status: code, data: data }
    }
}))


app.use((error, req, res, next) => {
    const status = error.stausCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(config.appPort);
    })
    .catch(err => {
        console.log(err);
    })





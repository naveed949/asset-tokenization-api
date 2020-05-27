const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser')
const erc20Routes = require('./router/erc20');
const port = 3000;
var app = express();


app.use(express.json());
// app.use( bodyParser.json() );
app.use(logger('dev'));
app.use("/api",erc20Routes);
app.listen(port, () => console.log(`Asset-Tokenization API service listening at port ${port}`))
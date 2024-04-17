const express = require('express');
const app = express();
const cors = require('cors'); //not sure I need this yet
const bodyParser = require('body-parser'); //not sure I need this yet
fs = require('fs'); //not sure I need this yet
	  
app.set('port', process.env.PORT || 3000);

// Add middleware for handling CORS requests from index.html
app.use(cors());

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

app.get('/', (req, res) => {
 res.send('Welcome to Daintree!');
});

// Add and use the api and routes
const apiRouter = require('./routes/api');
app.use('/', apiRouter);

app.listen(3000,()=>{
 console.log('Express server started at port 3000');
});
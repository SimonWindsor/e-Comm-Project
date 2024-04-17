const express = require('express');
const app = express();
fs = require('fs'); //not sure I need this yet
	  
app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
 response.send('Welcome to Daintree!');
});

// Add and use the api and routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

app.listen(3000,()=>{
 console.log('Express server started at port 3000');
});
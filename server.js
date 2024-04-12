const express = require('express');
app = express();
fs = require('fs');
	  
server.set('port', process.env.PORT || 3000);

server.get('/', (request,response) => {
 response.send('Welcome to eCom!');
});

server.listen(3000,()=>{
 console.log('Express server started at port 3000');
});
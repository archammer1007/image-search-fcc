var express = require('express');
var routes = require('./app/routes/imgsearch.js');
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/clementinejs'

var app = express();
mongo.connect(url, function(err, db){
    
    if (err){
        console.log('error');
        console.error(err);
    }
    else{
        console.log('connected to server');
    }
    
    routes(app,db);
    
    
});

app.listen(8080, function(){
	console.log('Listening on port 8080');
});
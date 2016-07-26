module.exports = function(app,db){
	require('dotenv').load();
	var searches = db.collection('searches');
	console.log(process.env.AUTH_KEY);
	//first argument for program should be a bing authentication key, which will be encoded and sent with the search request
	var authkey = new Buffer([process.env.AUTH_KEY,process.env.AUTH_KEY].join(':')).toString('base64');
	var request = require('request').defaults({
  		headers : {
    		'Authorization' : 'Basic ' + authkey
  		}
	});

	app.get('/latest', retrieveLatest)
	
	app.get('/', function(req,res){
		res.sendFile(process.cwd() + '/public/index.html');
	})
	
	app.get('/:query', findImages)
	
	//retrieves the list of recent searches from mongo and sends it to the client
	function retrieveLatest(req,res){
		console.log('request for latest searches');
		
		searches.findOne({id: 1}, function(err, doc){
			if (err){
				console.log('error finding latest searches')
			}
			var searchlist = doc.latest;
			console.log('sending latest searches to client');
			res.send(searchlist);
		})
		
	}
	
	//sends an image search request to bing with query and offset specified by client
	function findImages(req,res){
		var query = req.params.query;
		var offset = req.query.offset ? parseInt(req.query.offset) : 0;
		console.log('query received for ' + query + ' with offset of ' + offset);
		//save the search in the list of most recent searches
		saveSearch(query);
		//each offset skips 10 search returns
		var skip = offset * 10;
		
		var url = 'https://api.datamarket.azure.com/Bing/Search/Image?$format=json'+
			'&Query=' + "'" + query + "'" +
			'&$skip=' + skip +
			//search returns 10 results at a time
			'&$top=10'
		request.get(url, function (error, result) {
        	console.log(error);
        	var body = JSON.parse(result.body);
        	console.log('sending result to user');
        	var results = body.d.results;
        	results.filter(trimData);
        	//console.log(results);
        	res.send(results);
    	})
		
	}

	
	//saves a search to the db
	//after saving, keeps only the 10 latest searches, using method found at https://docs.mongodb.org/manual/tutorial/limit-number-of-elements-in-updated-array/
	function saveSearch(search){
		var date = new Date().toISOString();
		console.log("saving search for " + search + " at " + date);
		searches.update(
			{id: 1},
			{
				$push: {
					latest:{
						$each: [{search: search, time: date}],
						$sort: {time:1},
						$slice: -10
					}
				}
			},
			{upsert: true}
		)
	}
	
	//trims the bing search results
	function trimData(imgObj){
		delete imgObj.__metadata
		delete imgObj.ID
		delete imgObj.DisplayUrl
		delete imgObj.Width
		delete imgObj.Height
		delete imgObj.FileSize
		delete imgObj.ContentType
		delete imgObj.Thumbnail
	}

}
module.exports = function(app,db){
	
	var searches = db.collection('searches');
	

	app.get('/latest', retrieveLatest)
	
	app.get('/', function(req,res){
		res.send('hello');
	})
	
	app.get('/:query', findImages)
	
	//retrieves the list of 10 most recent searches and sends it to the client
	function retrieveLatest(req,res){
		console.log('request for latest searches');
		
		searches.findOne({id: 1}, function(err, doc){
			if (err){
				throw err;
			}
			var searchlist = doc.latest;
			console.log(searchlist);
			res.send(searchlist);
		})
		
	}
	
	function findImages(req,res){
		var query = req.params.query;
		var offset = req.query.offset ? parseInt(req.query.offset) : 0;
		console.log('query received for ' + query + ' with offset of ' + offset);
		saveSearch(query);
		//do search with offset (bing uses skip?)
		
		//add query to searches (cap to 10? most recent - should be able to sort by date?)
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
	
	//to do: register with bing search engine
	//create query for images only
	//store results and update collection to only keep latest 10 results
	
}
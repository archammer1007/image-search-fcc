module.exports = function(app,db){
	
	var searches = db.collection('searches');
	
	app.get('/latest', retrieveLatest)
	
	app.get('/:query', findImages)
	
	function retrieveLatest(req,res){
		console.log('latest');
	}
	
	function findImages(req,res){
		var query = req.params.query;
		var offset = req.query.offset ? parseInt(req.query.offset) : 0;
		console.log('query received for ' + query + ' with offset of ' + offset);
	}
	
}
var ds18 = require ('ds18b20');
var id = '';
var redis = require('redis');
var client = redis.createClient({host: 'localhost' , port: '6379'});

//redis ready
client.on("ready", function(){
	console.log("Redis is ready");
})
// error handling
client.on("error", function(err) {
	console.log("Err: " + err);
});
//get sensor ID
ds18.sensors(function (err, ids){
	console.log ("Ids: " + ids);
	id = ids;
});

//get data reading from the sensor
setInterval(function(){
	ds18.temperature('28-03219779933a', function(err, value){
		data = value;
		console.log(new Date());
		console.log("Current Celcius is: ",data);
		fahren = data * 9/5 + 32;
		console.log("Current Fahrenheit is: ", fahren);
	});

}, 1000);
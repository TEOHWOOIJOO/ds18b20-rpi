//init
var sensor = require ('ds18b20');
var isLoaded = sensor.isDriverLoaded();
var io = require ('socket.io')(http);

//redis init
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


//identify sensor
if (isLoaded){

	var listOfdeviceID = sensor.list();
		console.log("Device found: " + listOfdeviceID);

	if(lsitOfdeviceID.length == 0){
		console.log("No device is found." + "Exiting...");
		process.exit();
	}
	//get temperature data from sensor
	var mainSensor = listOfdeviceID[0];
		sensor.get(mainSensor, function(err,data){
		console.log("The temperature is " + data + "C", data);
	});

} else {
	console.log("device is not loaded!");
};


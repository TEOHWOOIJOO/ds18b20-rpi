var sensor = require ('ds18b20');

var sensorId = '28-03219779933a ';

	function writeMsg(res){
		sensor.get(sensorId, function (err, temp){
			if(err){
				console.log("error" + err);
				return;	
			}
			res.write("the temp is: " + temp + '\n\n');
		});	
	}
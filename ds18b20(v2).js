var fs = require ('fs');
var sys = require('sys');


//read current temp
function readTemp(callback){
	fs.readFile('/sys/bus/w1/devices/28-03219779933a/w1_slave',function(err,buffer){
		if(err){
			console.error(err);
			process.exit(1);
		}

	//read data from file
	var data = buffer.toString('ascii').split(" "); //split bus space

	//extract temp from string
	var temp = parseFloat(data[data.length - 1].split("=")[1])/1000.0;

	//rounding decimal
	temp = Math.round(temp * 10) / 10;

		callback(data);
	});
};
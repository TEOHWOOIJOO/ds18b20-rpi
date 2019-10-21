const sensor = require('ds18b20');

const tempC = sensor.readSimpleC();
sensor.readSimpleC = require ('/sys/bus/w1/devices/28-03219779933a/w1_slave ');
console.log(`${tempC} degC`);
 
// round temperature reading to 1 digit
const tempC = sensor.readSimpleC(1);
console.log(`${tempC} degC`);
 
 

// async version
function sensor.readSimpleC((err, temp) => {
    if (err) {
        console.log(err);
    } else {
    console.log(`${temp} degC`);
    }
});
 
// round temperature reading to 1 digit
sensor.readSimpleC(1, (err, temp) => {
    if (err) {
        console.log(err);
    } else {
    console.log(`${temp} degC`);
    }
});
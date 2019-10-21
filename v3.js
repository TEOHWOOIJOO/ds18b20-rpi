const sensor = require('ds18b20');

const tempC = sensor.readSimpleC();
console.log(`${tempC} degC`);
 
// round temperature reading to 1 digit
const tempC = sensor.readSimpleC(1);
console.log(`${tempC} degC`);
 
 
// async version
sensor.readSimpleC((err, temp) => {
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
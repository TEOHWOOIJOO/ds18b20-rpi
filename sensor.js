/*
 * file: sensor.js
 * author: TEOH WOOI JOO
 *
 * description: Direct to firebase RTDB
*/

// [Start Include lib]
var ds18 = require ('ds18b20');
var id = '';
var redis = require('redis');
var client = redis.createClient({host: 'localhost' , port: '6379'});
var firebase = require('firebase-admin');

// npm @date-time #to get a nice timestamp format
const date = require('date-time');
// [End Include Lib]

//global veriable for temperature
var cel = 0.0;
var fah = 0.0;

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
//firebase credential declaration
const firebaseConfig = {
  apiKey: "AIzaSyAveLds-NKQXtjEklUmnopr2gtsovzUo4o",
  authDomain: "rasp-pi12345.firebaseapp.com",
  databaseURL: "https://rasp-pi12345.firebaseio.com",
  projectId: "rasp-pi12345",                                                                                                                               43        43,29         Top
  appId: "1:454450314706:web:ef88b66cbb8a616b9f9c0b"
};

var serviceAccount = require("./rasp-pi12345-firebase-adminsdk-jremy-753fa43534.json");

//initialize firebae
firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://rasp-pi12345.firebaseio.com"
});

//firebase RTDB declaration
var db = firebase.database();

//get data reading from the sensor
 setInterval(function(){
        ds18.temperature('28-03219779933a', function(err, value){
                data = parseFloat(value).toFixed(1);
                console.log(new Date().toString("hh:mm tt"));
                console.log("Current Celcius is: ",data);
                cel = data;

//get Fahrenheit temperature
        fahren = (data * 9/5 + 32);
                console.log("Current Fahrenheit is: ", fahren);
                fah = fahren;
         });
}, 1000 * 3); //Display data on console every 3 seconds.

//Storing temperature data into Firebase RTDB
setInterval(function(){
        var ref = db.ref('/rasp-pi12345/temperature');
                 ref.once("value", function(snapshot){
                        console.log(snapshot.val());
                        });

        var tempRef = ref.child(date());

                tempRef.set({
                        Celcius: cel,
                        Fahrenheit: fah
                });
},(1000 * 60) * (60 * 2)); //Push data to Firebase RTDB every 2 hours.                                                                                                                         2         52,1-8        93%

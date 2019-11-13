var fs = require('fs');
var jwt = require('jsonwebtoken');
var mqtt = require('mqtt');
var ds18 = require('ds18b20');
var id = '';

var redis = require('redis');
var redisClient = redis.createClient({host: 'localhost', port:'6379'});
var redisTopic = "test-water-redis";

//redis ready
client.on("ready",function(){
    console.log("Redis is ready");
})
//error handling
client.on("error", function(err){
    console.log("Error: " + err);
});

//get sensor ID
ds18.sensors(function (err,ids){
    console.log("IDs: " + ids);
    id = ids;
});


const projectId = 'rasp-pi12345';
const deviceId = 'pi1';
const registryId = 'test-water';
const region = 'asia-east1';
const algorithm = 'RS256';
const privateKeyFile = './rsa_private.pem';
const mqttBridgeHostname = 'mqtt.googleapis.com';

// It turns out that WOU blocks port 8883, kindly 
// use port 443 when you perform testing inside the campus.
const mqttBridgePort = 443; // port: 8883, 443

const messageType = 'events';
const numMessages = 5;


//get data reading from the sensor
setInterval(function(){
    ds18.temperature('28-03219779933a', function(err, value){
        data = value;
        data = parseFloat(data).toFixed(1);
        console.log(new Date().toString("hh:mm tt"));
        console.log("Current Celcius is: ",data);
//get Fahrenheit temperature
    fahren = (data * 9/5 + 32);
        console.log("Current Fahrenheit is: ", fahren);
    });


}, 1000);
// Whether an asynchronous publish chain is in progress.
let publishChainInProgress = false;

// mattClientId - a unique string that identifies device. 
const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
// [START iot_mqtt_jwt]
const createJwt = (projectId, privateKeyFile, algorithm) => {
    // Create a JWT to authenticate this device. The device will be disconnected
    // after the token expires, and will have to reconnect with a new token. The
    // audience field should always be set to the GCP project id.
    const token = {
      iat: parseInt(Date.now() / 1000),
      exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
      aud: projectId,
    };
    const privateKey = fs.readFileSync(privateKeyFile);
    return jwt.sign(token, privateKey, {algorithm: algorithm});
};
// [END iot_mqtt_jwt]

// Once all of the messages have been published, the connection to 
// Google Cloud IoT will be closed, and the process will exit. See
// the publishAsynch method.
const publishAsync = function(mqttTopic, client, iatTime, messageSent, numMessages, connectionArgs) {
    var payload = `${redisTopic}/val:${messageSent}`;
    console.log("Publishing message: " + payload);

    // Publish payload to the MQTT Topic. qos=1 means at least once delivery. 
    // Cloud IoT Core also supports qos=0 for at most once delivery.
    client.publish(mqttTopic, payload, {qos: 0}, function(err) {
        if(!err) {
            console.log("payload published.");
        } else {
            console.log("payload-publish err: " + err);
        }
    });
};

// With Google Cloud IoT Core, the username field is ignored, however it must 
// be non-empty. The password field is used to transmit a JWT to authorize the
// device. the "mqtts" protocol causes the library to connect using SSL, which
// is required for Cloud IoT Core. 
const connectionArgs = {
    host: mqttBridgeHostname,
    port: mqttBridgePort,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    secureProtocol: 'TLSv1_2_method',
};

// Create a client, and connect to the Google IoT Core.
const iatTime = parseInt(Date.now() / 1000);
const client = mqtt.connect(connectionArgs);

// Subscribe to /devices/${deviceId}config topic to receive config updates.
// Config updates are recommended to use QoS 1 (at least one delivery).
client.subscribe(`/devices/${deviceId},config`, {qos: 0});

// Subscribe to the /devices/${device-id}/commands/# topic to receive all 
// commands or to the /devices/${deviceId}/commands/<subfolder> to just 
// receive message published to a specific commands folder. We recommend you
// use QoS = (at most one delivery).
client.subscribe(`/devices/${deviceId}/commands/#`, {qos: 0});

// The MQTT topic that the device will publish data into. The MQTT topic name 
// is required to be in the format below. The topic name must end in 'state'
// to publish state and 'events' to publish telemetry. Note that this is not 
// the same as the device registry's Cloud Pub/Sub topic. 
const mqttTopic = `/devices/${deviceId}/${messageType}`;

client.on('connect', function(success) {
    console.log("connected.");
    publishChainInProgress = true;

    if(!success) {
        console.log("Client not connected.");
    } else if(publishChainInProgress) {
        // publish to gcloud-iot-core
        setInterval(function() {
        redisClient.get(redisTopic, function(err, reply) {
            publishAsync(mqttTopic, client, iatTime, reply, numMessages, connectionArgs);
        });
        }, 1000 * 60);
    }
});

client.on('close', function() {
    console.log("close.");
});

client.on('error', function(err) {
    console.log("err: " + err);
});

client.on('message', function(topic, message) {
    let messageStr = 'Message Recieved: ';
    if(topic == `/devices/${deviceId}/config`) {
        messageStr = 'Config message received: ';
    } else if(topic.startsWith(`/devices/${deviceId}/commands`)) {
        messageStr = 'Command message received.'
    };

    messageStr = Buffer.from(message, 'base64').toString('ascii');
    console.log(messageStr);
});

client.on('packetsend', function() {
    // Note: logging packet send is very verbose
});
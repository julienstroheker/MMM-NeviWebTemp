/* Magic Mirror
 * Module: MMM-NeviWebTemp
 *
 * By Julien Stroheker
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');


module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-NeviWebTemp helper started ...');
  },

//{'dataServer' 'email' 'password' 'gatewayname' 'room'});
  getTemp: function(api_url) {
    var self = this;
    var uri = api_url.dataServer;
    var path = uri+'api/login';
    var result = {"gatewayID": 1, "gatewayName": "", "thermostats": []};

    dataPayload = {'email': api_url.email, 'password': api_url.password, 'stayConnected': '0'};

    request({url: path, method: 'POST', form: dataPayload}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        if((JSON.parse(body).session)!=null) {
          var sessionId = JSON.parse(body).session;
          var path = uri+'api/gateway';
          var dataHeaders = {'Session-Id': sessionId};

          request({url: path, method: 'GET', headers: dataHeaders}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
              var gatewayId = JSON.parse(body)[0].id;
              result.gatewayID = gatewayId;
              result.gatewayName = JSON.parse(body)[0].name;
              var path = uri+'api/device';
              var params = {'gatewayId': gatewayId};

              request({url: path, method: 'GET', headers: dataHeaders, qs: params}, function(error, response, body) {
                if (!error && response.statusCode == 200) {

                  JSON.parse(body).forEach(function(device) {
                    var thermoinfos = { "name": "", id: null, "active" : null, "setpoint" : null, "temperature" : null };
                    var path = uri+'api/device/' + device.id + '/data?force=1';
                    thermoinfos.name = device.name;
                    thermoinfos.active = device.active;
                    thermoinfos.id = device.id;
                    
                    request({url: path, method: 'GET', headers: dataHeaders}, function(error, response, body) {
                      if (!error && response.statusCode == 200) {
                        
                        thermoinfos.temperature = JSON.parse(body).temperature;
                        thermoinfos.setpoint = JSON.parse(body).setpoint;
                        result.thermostats.push(thermoinfos);
                      }
                      else
                      {
                        console.log("Error to fetch infos from devices");
                      }
                    });
                  }, this);
                  setTimeout(function() {self.sendSocketNotification('NEVI_MYTEMP', result); }, 2000);                  
                }
                else
                {
                  console.log("Error with the devices");
                }
              });
            }
            else
            {
              console.log("Error with the gateway");
            }
          }); 
        }
        else
        {
          console.log("Error with session ID");
        }
      }
    });
  },

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'NEVI_TEMP') {
      this.getTemp(payload);
    } 
  }
});
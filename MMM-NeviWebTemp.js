/* global Module */

/* Magic Mirror
 * Module: MMM-NeviWebTemp
 *
 * By Julien Stroheker
 * MIT Licensed.
 */

Module.register('MMM-NeviWebTemp', {

    defaults: {
        email: 'julienstroheker@gmail.com',
        password: 'pass@word1',
        gatewayname: 'Maison',
        dataServer: 'https://neviweb.com/',
        interval: 300000, //all modules use milliseconds
    },

    start: function() {
        Log.info('Starting module: ' + this.name);
        if (this.data.classes === 'MMM-NeviWebTemp') {
          this.data.classes = 'bright medium';
        }
        this.symbols = {
            'bed': 'fa fa-bed',
            'home': 'fa fa-home',
            'office': 'fa fa-briefcase'
        };
        this.loaded = false;
        this.gatewayID = '';
        this.gatewayName = '';
        this.thermostats = [];
        this.updateTemp(this);
    },

    updateTemp: function(self) {
        self.sendSocketNotification('NEVI_TEMP', {'dataServer':self.config.dataServer, 'email':self.config.email, 'password':self.config.password, 'gatewayname':self.config.gatewayname});
        setTimeout(self.updateTemp, self.config.interval, self);
    },

    getStyles: function() {
        return ['temp.css', 'font-awesome.css'];
    },

    getDom: function() {

      var wrapper = document.createElement("table");
      wrapper.className = "small";
      if (!this.loaded) {
            wrapper.innerHTML = 'Loading Temperature...';
            wrapper.className = "small dimmed";
            return wrapper;
        }
      this.thermostats.forEach(function(element) {
        var eventWrapper = document.createElement("tr");
        eventWrapper.className = "normal";

        var activeWrapper = document.createElement("td");
        activeWrapper.className = "symbol";
        var symbolActive = document.createElement("span");
        if (element.active === 1){symbolActive.className = 'fa fa-bolt';}
        else {symbolActive.className = '';}
        activeWrapper.appendChild(symbolActive);
        eventWrapper.appendChild(activeWrapper);

        var symbolWrapper = document.createElement("td");
        symbolWrapper.className = "symbol";
				var symbol = document.createElement("span");
        if (element.name === "Salon"){symbol.className = 'fa fa-television';}
        else if (element.name === "Bureau"){symbol.className = 'fa fa-briefcase';}
        else if (element.name === "Chambre" || element.name === "Chambre Guest"){symbol.className = 'fa fa-bed';}
        else {symbol.className = 'fa fa-home';}
        symbolWrapper.appendChild(symbol);
				eventWrapper.appendChild(symbolWrapper);

        

        var titleWrapper = document.createElement("td");
        titleWrapper.innerHTML = element.name + ' : ' + element.temperature + '°C';
        titleWrapper.className = "titleNevi bright";
        eventWrapper.appendChild(titleWrapper);

        wrapper.appendChild(eventWrapper);

      });

      return wrapper;


        /*var wrapper = document.createElement("div");

        var tempInfo = document.createElement('div'); //support for config.changeColor
        if (!this.loaded) {
            wrapper.innerHTML = 'Loading Temperature...';
            return wrapper;
        }
        //symbol
        var symbol = document.createElement('span');
        symbol.className = this.symbols['home'] + ' symbol';
        tempInfo.appendChild(symbol);

        var tempText = document.createElement('div');
        tempText.className = 'dimmed small';
        tempText.innerHTML = this.thermostats[0].name +' : ' + this.thermostats[0].temperature + '°C' ;
        tempInfo.appendChild(tempText);
        wrapper.appendChild(tempInfo);
        return wrapper;*/
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'NEVI_MYTEMP') {
            Log.info('received NEVI_MYTEMP');
            this.gatewayID = payload.gatewayID;
            this.gatewayName = payload.gatewayName;
            this.thermostats = payload.thermostats;
            this.loaded = true;
            this.updateDom(1000);
        }
    }

});

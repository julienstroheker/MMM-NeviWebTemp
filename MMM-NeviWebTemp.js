/* global Module */

/* Magic Mirror
 * Module: MMM-NeviWebTemp
 *
 * By Julien Stroheker
 * MIT Licensed.
 */

Module.register("MMM-NeviWebTemp", {
  defaults: {
    email: "",
    password: "",
    gatewayname: "",
    dataServer: "https://neviweb.com/",
    interval: 300000 //all modules use milliseconds
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    if (this.data.classes === "MMM-NeviWebTemp") {
      this.data.classes = "bright medium";
    }
    this.symbols = {
      bed: "fa fa-bed",
      home: "fa fa-home",
      office: "fa fa-briefcase"
    };
    this.loaded = false;
    this.gatewayID = "";
    this.gatewayName = "";
    this.thermostats = [];
    this.updateTemp(this);
  },

  updateTemp: function(self) {
    self.sendSocketNotification("NEVI_TEMP", {
      dataServer: self.config.dataServer,
      email: self.config.email,
      password: self.config.password,
      gatewayname: self.config.gatewayname
    });
    setTimeout(self.updateTemp, self.config.interval, self);
  },

  getStyles: function() {
    return ["temp.css", "font-awesome.css"];
  },

  getDom: function() {
    var wrapper = document.createElement("table");
    wrapper.className = "small";
    if (!this.loaded) {
      wrapper.innerHTML = "Loading Temperature...";
      wrapper.className = "small dimmed";
      return wrapper;
    }
    this.thermostats.forEach(function(element) {
      var eventWrapper = document.createElement("tr");
      eventWrapper.className = "normal";

      var activeWrapper = document.createElement("td");
      activeWrapper.className = "symbol";
      var symbolActive = document.createElement("span");
      if (element.active === 1) {
        symbolActive.className = "fa fa-bolt ligthSymbol";
      } else {
        symbolActive.className = "";
      }
      activeWrapper.appendChild(symbolActive);
      eventWrapper.appendChild(activeWrapper);

      var titleWrapper = document.createElement("td");
      titleWrapper.innerHTML = element.name;
      titleWrapper.className = "titleNevi bright";
      eventWrapper.appendChild(titleWrapper);

      var tempWrapper = document.createElement("td");
      tempWrapper.innerHTML = element.temperature + "°C";
      tempWrapper.className = "titleNevi bright tempValue";
      eventWrapper.appendChild(tempWrapper);

      wrapper.appendChild(eventWrapper);
    });

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "NEVI_MYTEMP") {
      Log.info("received NEVI_MYTEMP");
      this.gatewayID = payload.gatewayID;
      this.gatewayName = payload.gatewayName;
      this.thermostats = payload.thermostats;
      this.loaded = true;
      this.updateDom(1000);
    }
  }
});

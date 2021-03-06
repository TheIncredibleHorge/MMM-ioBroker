/* global Module */

/* Magic Mirror
 * Module: MMM-ioBroker
 *
 * By Benjamin Roesner http://benjaminroesner.com
 * MIT Licensed.
 */

// TODO: implement the weather icons
Module.register('MMM-ioBroker', {

  defaults: {
    host: 'localhost',
    port: '8082',
    initialLoadDelay: 1000,
    updateInterval: 60 * 1000 // every 1 minutes
  },

  // Define required scripts.
  getStyles: function () {
    return ['MMM-ioBroker.css'];
  },

  // Override socket notification handler.
  // Module notifications from node_helper
  socketNotificationReceived: function (notification, payload) {
    if (notification === 'DATARECEIVED') {
      this.values = payload;
      // Log.log(payload);
      this.updateDom(2000);
      this.scheduleUpdate(this.config.updateInterval);
    }
  },

  // Method is called when all modules are loaded an the system is ready to boot up
  start: function() {
    this.values = {};
    this.updateTimer = null;
    this.scheduleUpdate(this.config.initialLoadDelay);
    Log.info('Starting module: ' + this.name);
  },

  /* scheduleUpdate()
   * Schedule next update.
   *
   * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
   */
  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(function () {
      self.sendSocketNotification('GETDATA', self.config);
      // Log.log('ioBroker new data fetched...');
    }, nextLoad);
  },

  // Update the information on screen
  getDom: function () {
    var self = this;
    var wrapper = document.createElement('div');
    wrapper.className = 'flex-container small';

    this.config.devices.forEach(function (device) {
      var deviceWrapper = document.createElement('div');
      deviceWrapper.className = 'flex-item normal';

      // add device alias/name
      var titleWrapper = document.createElement('div');
      titleWrapper.innerHTML = device.name;
      titleWrapper.className = 'title';
      deviceWrapper.appendChild(titleWrapper);

      // add states of device
      device.deviceStates.forEach(function (stateConfig) {
        var valueWrapper = document.createElement('div');

        //add icon
        if (stateConfig.icon) {
          valueWrapper.innerHTML = '<i class="dimmed ' + stateConfig.icon + '"></i>';
        }

        valueWrapper.innerHTML += (self.values[stateConfig.id] === undefined) ? '---' : self.values[stateConfig.id];

        // add suffix
        if (stateConfig.suffix) {
          valueWrapper.innerHTML += stateConfig.suffix;
        }
        valueWrapper.className = 'value medium bright';
        deviceWrapper.appendChild(valueWrapper);
      });

      wrapper.appendChild(deviceWrapper);
    });

    return wrapper;
  }
});

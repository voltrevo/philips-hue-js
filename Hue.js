'use strict';

const Property = require('./Property.js');
const required = require('./required.js');

module.exports = ({
  addr = required('addr'),
  key = required('apikey'),
  msgRate = 10, // Max msgs per sec
}) => {
  const hue = {};

  const apiPrefix = `http://${addr}/api/${key}`;

  hue.get = (addr) => (
    fetch(apiPrefix + addr)
    .then(res => res.json())
  );

  hue.put = (addr, attr) => (
    fetch(apiPrefix + addr, {
      method: 'PUT',
      body: JSON.stringify(attr),
    })
    .then(res => res.json())
  );

  hue.Lights = () => (
    hue.get('/lights')
    .then(res => Object.keys(res).map(Number).map(hue.Light))
  );

  hue.Light = (i) => {
    const light = {};

    light.on = Property({
      get: () => hue.get(`/lights/${i}`).then(res => res.state.on),
      set: (on) => hue.put(`/lights/${i}/state`, {
        on: on,
        transitiontime: 0,
      }),
    });

    light.hue = Property({
      get: () => hue.get(`/lights/${i}`).then(res => res.state.hue),
      set: (hueVal) => hue.put(`/lights/${i}/state`, {
        hue: Math.floor((65536 * hueVal) % 65536),
        transitiontime: 0,
      }),
    });

    light.brightness = Property({
      get: () => hue.get(`/lights/${i}`).then(res => res.state.bri),
      set: (brightness) => hue.put(`/lights/${i}/state`, {
        bri: Math.min(Math.floor(256 * brightness), 255),
        transitiontime: 0,
      }),
    });

    light.saturation = Property({
      get: () => hue.get(`/lights/${i}`).then(res => res.state.sat),
      set: (saturation) => hue.put(`/lights/${i}/state`, {
        sat: Math.min(Math.floor(256 * saturation), 255),
        transitiontime: 0,
      }),
    });

    return light;
  };
  
  return hue;
};

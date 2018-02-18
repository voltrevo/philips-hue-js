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

    const LightProperty = (key, transform = value => value) => Property({
      get: () => hue.get(`/lights/${i}`).then(res => res.state[key]),
      set: (value) => hue.put(`/lights/${i}/state`, {
        [key]: transform(value),
        transitiontime: 0,
      })
    });

    light.on = LightProperty('on');
    light.hue = LightProperty('hue', value => Math.floor((65536 * value) % 65536));
    light.brightness = LightProperty('bri', value => Math.min(Math.floor(256 * value), 255));
    light.saturation = LightProperty('sat', value => Math.min(Math.floor(256 * value), 255));

    return light;
  };
  
  return hue;
};

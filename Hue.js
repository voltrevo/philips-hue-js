'use strict';

const Property = require('./Property.js');
const required = require('./required.js');

module.exports = ({
  addr = required('addr'),
  key = required('apikey'),
}) => {
  const hue = {};

  const apiPrefix = `http://${addr}/api/${key}`;

  let waiting = false;

  const pending = {
    get: {},
    put: {},
  };

  let dispatchScheduled = false;

  const dispatch = ({queued = false} = {}) => {
    if (waiting) {
      return;
    }

    const getKeys = Object.keys(pending.get);

    if (getKeys.length > 0) {
      const addr = getKeys[0];
      const addrInfo = pending.get[addr];
      delete pending.get[addr];

      const promise = get(addr);
      waiting = true;
      addrInfo.resolves.forEach(resolve => resolve(promise));

      promise.then(
        () => { waiting = false; dispatch({queued: true}); },
        () => { waiting = false; dispatch({queued: true}); }
      );

      return;
    }

    const putKeys = Object.keys(pending.put);

    if (putKeys.length > 0) {
      const addr = putKeys[0];
      const addrInfo = pending.put[addr];
      delete pending.put[addr];

      if (addrInfo.attr.transitiontime === 0 && queued) {
        addrInfo.attr.transitiontime = 2;
      }

      const promise = put(addr, addrInfo.attr);
      waiting = true;
      addrInfo.resolves.forEach(resolve => resolve(promise));

      promise.then(
        () => { waiting = false; dispatch({queued: true}); },
        () => { waiting = false; dispatch({queued: true}); }
      );

      return;
    }

    dispatchScheduled = false;
  };

  const scheduleDispatch = () => {
    if (dispatchScheduled) {
      return;
    }

    Promise.resolve().then(dispatch);
    dispatchScheduled = true;
  };

  const get = (addr) => (
    fetch(apiPrefix + addr)
    .then(res => res.json())
  );

  hue.get = (addr) => new Promise(resolve => {
    const addrInfo = pending.get[addr] || {resolves: []};
    pending.get[addr] = addrInfo;

    addrInfo.resolves.push(resolve);
    scheduleDispatch();
  });

  const put = (addr, attr) => (
    fetch(apiPrefix + addr, {
      method: 'PUT',
      body: JSON.stringify(attr),
    })
    .then(res => res.json())
  );

  hue.put = (addr, attr) => new Promise(resolve => {
    const addrInfo = pending.put[addr] || {attr: {}, resolves: []};
    pending.put[addr] = addrInfo;

    Object.keys(attr).forEach(attrKey => addrInfo.attr[attrKey] = attr[attrKey]);
    addrInfo.resolves.push(resolve);

    scheduleDispatch();
  });

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

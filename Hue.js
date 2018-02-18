'use strict';

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
  
  return hue;
};

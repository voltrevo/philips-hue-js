'use strict';

const config = require('./config.json');
const Hue = require('./Hue.js');

window.hue = Hue(config);

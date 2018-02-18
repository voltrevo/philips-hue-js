'use strict';

const config = require('./config.json');
const Hue = require('./Hue.js');
  
const hue = Hue(config);
window.hue = hue;

const Slider = (oninput) => {
  const slider = document.createElement('input');
  
  slider.setAttribute('type', 'range');
  slider.min = 0;
  slider.max = 1;
  slider.step = 0.001;
  slider.style.width = '300px';
  slider.oninput = oninput;

  return slider;
};

(async () => {
  await new Promise(resolve => window.addEventListener('load', resolve));

  const lights = await hue.Lights();

  const brightnessSlider = Slider(() => lights[0].brightness(brightnessSlider.value));
  brightnessSlider.value = await lights[0].brightness();
  document.body.appendChild(brightnessSlider);
})()
  .catch(console.error)
;

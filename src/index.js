import MiniTroll from './minitroll.png';
import Slider from "./Slider.js";
import solution from "./solution.js";
import challenge from "./challenge.js";

function component() {
  const element = document.createElement("div");
  const s1 = document.createElement("script");
  const s2 = document.createElement("script");
  const s3 = document.createElement("script");

  s1.src = Slider
  s2.src = solution
  s3.src = challenge


  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(["Hello", "webpack"], " ");

  const minitroll = new Image();
  minitroll.src = MiniTroll;

  element.appendChild(minitroll);

  return element;
}

document.body.appendChild(component());

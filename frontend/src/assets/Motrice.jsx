import PropTypes from "prop-types";
import { useState } from "react";

export default function Motrice({ fill }) {
  const [hover, setHover] = useState(false);
  return (
    <svg
      id="Calque_2"
      xmlns="http://www.w3.org/2000/svg"
      fill={hover ? fill.replace(".5", ".3") : fill}
      viewBox="0 0 586.66 584.22"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <g>
        <path d="m345.98,584.22h83.78c3.35,0,6.02-.31,7.59-4.73,0,0,37.77-118.18,38.44-120.32,1.4-4.48.49-6.73-3.33-9.16-30.62-19.62-65.08-35.01-100.8-47.05h108.4c3.35,0,6.02-.31,7.59-4.73,0,0,37.77-118.18,38.44-120.32,1.4-4.48.49-6.73-3.33-9.16-29.3-18.77-62.11-33.66-96.18-45.47h113.45c3.35,0,6.02-.31,7.59-4.73,0,0,37.77-118.18,38.44-120.32,1.4-4.48.49-6.73-3.33-9.16C461.34,11.3,279.86,0,197.44,0,185.62,0,11.19.23,3.91.53c-1.49.06-2.79.35-3.91.82v582.87h345.98Z" />
      </g>
    </svg>
  );
}

Motrice.propTypes = {
  fill: PropTypes.string,
};
Motrice.defaultProps = {
  fill: "#fff",
};

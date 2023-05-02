import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "@components/ChallengeSlider.css";
import challengeDefaultImg from "../assets/challenge.heif";

// adapted from https://codepen.io/Snip3r/pen/GxybbN
window.currDot = null;
window.prevDot = null;
window.intrvl = null;
window.timeout = null;
window.prevImg = null;
window.currImg = 0;
window.allDots = [];
export default function ChallengesSlider({ challenges }) {
  const interval = 7000;
  const animDuration = 700;
  const slider = useRef();
  useEffect(() => {
    const dots = slider.current.querySelector(".dots");
    const sliderImgs = slider.current.querySelectorAll(".challengePoster");
    if (!window.prevImg) {
      window.prevImg = sliderImgs.length - 1;
      window.currImg = 0;
      window.allDots = [];
    }

    function animateSlider(incNextImg, right) {
      let nextImg = incNextImg;
      if (!nextImg) {
        nextImg =
          window.currImg + 1 < sliderImgs.length ? window.currImg + 2 : 1;
      }

      nextImg -= 1;
      sliderImgs[window.prevImg].style.animationName = "";

      if (!right) {
        sliderImgs[nextImg].style.animationName = "leftNext";
        sliderImgs[window.currImg].style.animationName = "leftCurr";
      } else {
        sliderImgs[nextImg].style.animationName = "rightNext";
        sliderImgs[window.currImg].style.animationName = "rightCurr";
      }

      window.prevImg = window.currImg;
      window.currImg = nextImg;

      window.currDot = window.allDots[window.currImg];
      window.currDot.classList.add("active-dot");
      window.prevDot = window.allDots[window.prevImg];
      window.prevDot.classList.remove("active-dot");
    }

    function dotClick(num) {
      if (num !== window.currImg) {
        clearTimeout(window.timeout);
        clearInterval(window.intrvl);

        if (num > window.currImg) {
          animateSlider(num + 1);
        } else {
          animateSlider(num + 1, true);
        }

        window.intrvl = setInterval(animateSlider, interval);
      }
    }

    window.allDots = dots.querySelectorAll(".dot");
    window.allDots.forEach((element) => element.remove());
    for (let i = 0; i < sliderImgs.length; i += 1) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dots.appendChild(dot);
      dot.addEventListener("click", dotClick.bind(null, i), false);
    }
    window.allDots = dots.querySelectorAll(".dot");

    if (window.allDots.length) {
      window.allDots[0].classList.add("active-dot");

      sliderImgs[0].style.left = 0;
      if (window.allDots.length > 1) {
        window.timeout = setTimeout(() => {
          animateSlider();
          sliderImgs[0].style.left = "";
          window.intrvl = setInterval(animateSlider, interval);
        }, interval - animDuration);
      }
    }
    return () => {
      clearTimeout(window.timeout);
      clearInterval(window.intrvl);
      window.timeout = undefined;
      window.intrvl = undefined;
      window.currDot = undefined;
      window.prevDot = undefined;
      window.currImg = undefined;
      window.prevImg = undefined;
      window.allDots = undefined;
    };
  }, [challenges]);
  return (
    <div
      ref={slider}
      className="challengesSlider"
      style={{ backgroundImage: `url(${challengeDefaultImg})` }}
    >
      <div className="challenges rounded">
        {challenges
          .filter((challenge) => challenge.poster && challenge.poster.file_name)
          .map((challenge, i) => (
            <div
              key={challenge.id_challenge}
              className="current-challenge-poster"
            >
              <Link
                to={`${import.meta.env.VITE_FRONTEND_URI}/challenge/${
                  challenge.id_challenge
                }`}
              >
                <div
                  className="challengePoster"
                  style={{
                    left: i === 0 ? 100 : undefined,
                    backgroundImage: `url('${
                      import.meta.env.VITE_BACKEND_URL
                    }/uploads/challenges/challenge_${challenge.id_challenge}/${
                      challenge.poster.file_name
                    }')`,
                  }}
                >
                  <span>{challenge.name}</span>
                </div>
              </Link>
            </div>
          ))}
      </div>
      <div className="dots" />
    </div>
  );
}
ChallengesSlider.propTypes = {
  challenges: PropTypes.arrayOf(
    PropTypes.shape({
      id_challenge: PropTypes.number,
      name: PropTypes.string,
      poster: PropTypes.shape({
        file_name: PropTypes.string,
      }),
    })
  ),
};
ChallengesSlider.defaultProps = {
  challenges: [],
};

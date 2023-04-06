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
export default function ChallengesSlider({ challenges }) {
  const interval = 15000;
  const animDuration = 600;
  const slider = useRef();
  useEffect(() => {
    const dots = slider.current.querySelector(".dots");
    const sliderImgs = slider.current.querySelectorAll(".challengePoster");
    let currImg = 0;
    let prevImg = sliderImgs.length - 1;
    let allDots = [];

    function animateSlider(incNextImg, right) {
      let nextImg = incNextImg;
      if (!nextImg) {
        nextImg = currImg + 1 < sliderImgs.length ? currImg + 2 : 1;
      }

      nextImg -= 1;
      sliderImgs[prevImg].style.animationName = "";

      if (!right) {
        sliderImgs[nextImg].style.animationName = "leftNext";
        sliderImgs[currImg].style.animationName = "leftCurr";
      } else {
        sliderImgs[nextImg].style.animationName = "rightNext";
        sliderImgs[currImg].style.animationName = "rightCurr";
      }

      prevImg = currImg;
      currImg = nextImg;

      window.currDot = allDots[currImg];
      window.currDot.classList.add("active-dot");
      window.prevDot = allDots[prevImg];
      window.prevDot.classList.remove("active-dot");
    }

    function dotClick(num) {
      if (num !== currImg) {
        clearTimeout(window.timeout);
        clearInterval(window.intrvl);

        if (num > currImg) {
          animateSlider(num + 1);
        } else {
          animateSlider(num + 1, true);
        }

        window.intrvl = setInterval(animateSlider, interval);
      }
    }

    for (let i = 0; i < sliderImgs.length; i += 1) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dots.appendChild(dot);
      dot.addEventListener("click", dotClick.bind(null, i), false);
    }
    allDots = dots.querySelectorAll(".dot");
    dots.querySelectorAll(".dot").forEach((element) => element.remove());

    if (allDots.length) {
      allDots[0].classList.add("active-dot");

      sliderImgs[0].style.left = 0;
      if (allDots.length > 1) {
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

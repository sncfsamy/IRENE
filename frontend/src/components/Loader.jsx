import React from "react";
import LoaderGif from "@assets/loading.webp";

export default function Loader() {
  return (
    <div
      className="position-fixed vw-100 vh-100 d-flex align-items-center"
      style={{
        zIndex: 1070,
        top: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,.6)",
      }}
    >
      <div
        className="mx-auto align-middle loader"
        style={{ width: "200px", height: "200px" }}
      >
        <img
          src={LoaderGif}
          style={{ width: "200px", height: "200px" }}
          className="mx-auto align-middle"
          alt="loaderGif"
        />
      </div>
    </div>
  );
}

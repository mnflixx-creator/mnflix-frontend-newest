"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

export default function MovieSlider({ title, movies }) {
  return (
    <div className="mb-16 px-6">
      <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>

      <Swiper
        slidesPerView={6}
        spaceBetween={10}
        navigation
        modules={[Navigation]}
        className="mySwiper"
      >
        {movies.map((movie, i) => (
          <SwiperSlide key={i}>
            <div
              className="cursor-pointer hover:scale-105 transition"
              onClick={() => console.log("clicked:", movie.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              <img
                src={movie.thumbnail}
                className="w-full h-40 object-cover rounded-md"
              />
              <p className="text-gray-300 mt-2">{movie.title}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

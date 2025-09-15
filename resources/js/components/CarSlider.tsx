"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface Make {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
  make?: Make;
}

export interface Variant {
  id: number;
  name: string;
  model?: Model;
} 

export interface CarImage {
  id: number;
  car_id: number;
  image_path: string;
}

export interface Car {
  id: number;
  variant?: Variant;
  year: number;
  mileage: number;
  price: number;
  color?: string;
  description?: string;
  images?: CarImage[];
}

interface CarSliderProps {
  title?: string;
  showTitle?: boolean;
  cardsPerView?: number;
}

export default function CarSlider({ 
  title = "Featured Cars",
  showTitle = true,
  cardsPerView = 4 
}: CarSliderProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🟢 fetch API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/cars/random");
        if (!res.ok) throw new Error("Failed to fetch cars");
        const data = await res.json();
        setCars(data);
      } catch (err) {
        console.error("Error fetching cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // 随机挑选最多 8 辆车
  const randomCars = useMemo(() => {
    if (cars.length === 0) return [];
    if (cars.length <= 8) return cars;
    const shuffled = [...cars].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [cars]);

  // 按照 cardsPerView 分组（一次显示 4 辆）
  const slides = useMemo(() => {
    const groups: Car[][] = [];
    for (let i = 0; i < randomCars.length; i += cardsPerView) {
      groups.push(randomCars.slice(i, i + cardsPerView));
    }
    return groups;
  }, [randomCars, cardsPerView]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return <div className="text-center py-12">Loading cars...</div>;
  }

  if (randomCars.length === 0) {
    return (
      <div className="w-full">
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
        )}
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
          No cars available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      )}

      <div className="relative">
        {/* 左右按钮 */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full shadow-lg border p-2 hover:bg-gray-50"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full shadow-lg border p-2 hover:bg-gray-50"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Slider 容器 */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, slideIndex) => (
              <div key={slideIndex} className="min-w-full flex gap-4">
                {slide.map((car) => (
                  <div
                    key={car.id}
                    className="flex-1 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg bg-white"
                    onClick={() => (window.location.href = `/CarDetail/${car.id}`)}
                  >
                    {/* 图片 */}
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={`/storage/${car.images[0].image_path}`}
                        alt={`${car.variant?.model?.make?.name} ${car.variant?.model?.name}`}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-4 text-gray-500">
                        No Image
                      </div>
                    )}

                    {/* 车信息 */}
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
                      {car.variant?.model?.make?.name} {car.variant?.model?.name}{" "}
                      {car.variant?.name}
                    </h3>
                    <p className="text-sm text-gray-600">Year: {car.year}</p>
                    <p className="text-sm text-gray-600">
                      Mileage: {car.mileage.toLocaleString()} km
                    </p>
                    {car.color && (
                      <p className="text-sm text-gray-600">Color: {car.color}</p>
                    )}
                    <p className="text-indigo-600 font-bold text-lg mt-2">
                      RM {car.price.toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* 补空位，保证最后一页也是 4 格 */}
                {slide.length < cardsPerView &&
                  Array.from({ length: cardsPerView - slide.length }).map(
                    (_, idx) => <div key={`empty-${idx}`} className="flex-1" />
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Dots 指示器 */}
        {slides.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full ${
                  idx === currentSlide ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

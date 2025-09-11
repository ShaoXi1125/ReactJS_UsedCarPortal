// components/CarSlider.tsx
import React, { useMemo } from "react";

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
  description?: string;
  images?: CarImage[];
}

interface CarSliderProps {
  cars?: Car[];
}

export default function CarSlider({ cars = [] }: CarSliderProps) {
  // 8 Random Cars
  const randomCars = useMemo(() => {
    if (cars.length <= 8) return cars;
    const shuffled = [...cars].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [cars]);

  // Grouped in Two Sets of 4
  const slides = [];
  for (let i = 0; i < randomCars.length; i += 4) {
    slides.push(randomCars.slice(i, i + 4));
  }

  return (
    <div className="overflow-x-auto flex gap-4 py-4">
      {slides.map((slide, index) => (
        <div key={index} className="flex gap-4 min-w-full">
          {slide.map((car) => (
            <div
              key={car.id}
              className="border rounded p-4 shadow hover:shadow-lg transition flex-1"
            >
              {car.images && car.images.length > 0 ? (
                <img
                  src={`/storage/${car.images[0].image_path}`}
                  alt={car.variant?.name || "Car"}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center">
                  No Image
                </div>
              )}
              <h2 className="font-semibold text-lg">
                {car.variant?.model?.make?.name} {car.variant?.model?.name}{" "}
                {car.variant?.name}
              </h2>
              <p className="text-gray-600">{car.year}</p>
              <p className="text-gray-600">Mileage: {car.mileage} km</p>
              <p className="text-gray-800 font-bold">Price: ${car.price}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

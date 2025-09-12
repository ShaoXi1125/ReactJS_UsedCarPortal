import React, { useEffect, useState } from "react";
import axios from "axios";
import Header  from "@/components/Header";
import Footer from "@/components/Footer";
import CarSelector from "@/components/CarSelector";

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  make_id: number;
  make?: Make;
}

interface Variant {
  id: number;
  name: string;
  model_id: number;
  model?: Model;
}

interface CarImage {
  id: number;
  car_id: number;
  image_path: string;
}

interface Car {
  id: number;
  user_id: number;
  variant_id: number;
  year: number;
  mileage: number;
  price: number;
  description?: string;
  variant?: Variant;
  images?: CarImage[];
}

export default function CarPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get<Car[]>("/api/cars", {
        withCredentials: true, // session auth
      });
      setCars(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cars");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading cars...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
        <Header />
            <div className="mb-6">
              <CarSelector
                onSelectMake={() => {}}
                onSelectModel={() => {}}
                onSelectYear={() => {}}
                onSelectVariant={() => {}}
              />
            </div>
            <main className="flex-grow p-6 text-gray-900">
                <h1 className="text-2xl  font-bold mb-4">Available Cars</h1>
                {cars.length === 0 ? (
                <p>No cars found.</p>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car) => (
                    <div key={car.id} className="border rounded p-4 shadow hover:shadow-lg transition">
                        {car.images && car.images.length > 0 ? (
                        <img src={`/storage/${car.images[0].image_path}`} alt={car.variant?.name || "Car"} className="w-full h-48 object-cover rounded mb-2"/>
                        ) : (
                        <div className="w-full h-48 bg-gray-200 rounded mb-2 flex items-center justify-center">
                            No Image
                        </div>
                        )}
                        <h2 className="font-semibold text-lg">
                        {car.variant?.model?.make?.name} {car.variant?.model?.name} {car.variant?.name}
                        </h2>
                        <p className="text-gray-600">{car.year}</p>
                        <p className="text-gray-600">Mileage: {car.mileage} km</p>
                        <p className="text-gray-800 font-bold">Price: ${car.price}</p>
                        {car.description && <p className="mt-2 text-gray-700">{car.description}</p>}
                    </div>
                    ))}
                </div>
                )}
            </main>
        <Footer />
    </div>

  );
}

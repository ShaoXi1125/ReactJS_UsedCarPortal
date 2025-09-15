import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Car {
  id: number;
  year: number;
  price: number;
  color?: string;
  description?: string;
  make?: { id: number; name: string };
  model?: { id: number; name: string };
  variant?: { id: number; name: string };
  images: { id: number; image_path: string }[];
  main_image_id?: number;
}

export default function CarDetailPage() {
  const carId = window.location.pathname.split("/")[2];
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!carId) return;

    fetch(`http://127.0.0.1:8000/api/cars/${carId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch car");
        return res.json();
      })
      .then((data) => setCar(data))
      .catch((err) => setError("Failed to load car data"))
      .finally(() => setLoading(false));
  }, [carId]);

  if (loading) return <p className="text-center p-6">Loading car...</p>;
  if (error) return <p className="text-center p-6 text-red-500">{error}</p>;
  if (!car) return <p className="text-center p-6">Car not found.</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{car.make?.name} {car.model?.name} {car.variant?.name}</h1>
        <p className="mb-2"><strong>Year:</strong> {car.year}</p>
        <p className="mb-2"><strong>Price:</strong> ${car.price}</p>
        {car.color && <p className="mb-2"><strong>Color:</strong> {car.color}</p>}
        {car.description && <p className="mb-4"><strong>Description:</strong> {car.description}</p>}

        <div className="grid grid-cols-3 gap-4">
          {car.images.map((img) => (
            <div key={img.id} className="relative w-full h-32">
              <img
                src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                alt="Car"
                className={`w-full h-full object-cover rounded-lg border ${
                  car.main_image_id === img.id ? "border-green-600 border-2" : ""
                }`}
              />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Car {
  id: number;
  year: number;
  price: number;
  variant: {
    name: string;
    model: {
      name: string;
      make: {
        name: string;
      };
    };
  };
  images: { id: number; image_path: string }[];
}

export default function MyCarPage() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/mycars")
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Failed to fetch cars:", err));
  }, []);

  const handleEdit = (carId: number) => {
    window.location.href = `/cars/${carId}/edit`;
  };

  const handleDelete = (carId: number) => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    fetch(`http://127.0.0.1:8000/api/cars/${carId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setCars((prev) => prev.filter((c) => c.id !== carId));
        } else {
          alert("Failed to delete car.");
        }
      })
      .catch((err) => console.error("Delete error:", err));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-6">My Cars</h2>
        {cars.length === 0 ? (
          <p className="text-gray-600">You haven't listed any cars yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white shadow rounded-xl p-4 flex flex-col"
              >
                {car.images?.length > 0 ? (
                  <img
                    src={`/storage/${car.images[0].image_path}`}
                    alt={`${car.variant.model.make.name} ${car.variant.model.name}`}
                    className="w-full h-40 object-cover rounded-lg"
                />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg">
                    No Image
                  </div>
                )}

                <h3 className="text-lg font-semibold mt-2">
                  {car.variant.model.make.name} {car.variant.model.name}
                </h3>
                <p className="text-sm">Variant: {car.variant.name}</p>
                <p className="text-sm">Year: {car.year}</p>
                <p className="text-sm font-bold">RM {car.price}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(car.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

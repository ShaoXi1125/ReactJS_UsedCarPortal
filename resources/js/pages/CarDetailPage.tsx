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
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!carId) return;

    fetch(`http://127.0.0.1:8000/api/cars/${carId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch car");
        return res.json();
      })
      .then((data) => {
        setCar(data);
        setCurrentImage(0);
      })
      .catch(() => setError("Failed to load car data"))
      .finally(() => setLoading(false));
  }, [carId]);

  if (loading) return <p className="text-center p-6">Loading car...</p>;
  if (error) return <p className="text-center p-6 text-red-500">{error}</p>;
  if (!car) return <p className="text-center p-6">Car not found.</p>;

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左边图片轮播 */}
          <div className="md:w-2/3 relative">
            {car.images.length > 0 ? (
              <div className="relative">
                <img
                  src={`http://127.0.0.1:8000/storage/${car.images[currentImage].image_path}`}
                  alt="Car"
                  className="w-full h-96 object-cover rounded-lg border"
                />
                {/* 左右箭头 */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                    >
                      &#8594;
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                No Image
              </div>
            )}
            {/* 小图缩略 */}
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {car.images.map((img, idx) => (
                <img
                  key={img.id}
                  src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                  alt="thumb"
                  className={`w-20 h-20 object-cover rounded-lg border cursor-pointer ${
                    idx === currentImage ? "border-indigo-600 border-2" : "border-gray-300"
                  }`}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          </div>

          {/* 右边信息 + 按钮 */}
          <div className="md:w-1/3 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {car.make?.name} {car.model?.name} {car.variant?.name}
              </h1>
              <p className="mb-1"><strong>Year:</strong> {car.year}</p>
              <p className="mb-1"><strong>Price:</strong> RM {car.price.toLocaleString()}</p>
              {car.color && <p className="mb-1"><strong>Color:</strong> {car.color}</p>}
            </div>

            <button className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Book Test Drive
            </button>
          </div>
        </div>
         {car.description && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-gray-700">
            <h2 className="font-semibold mb-2">Description</h2>
            <p>{car.description}</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

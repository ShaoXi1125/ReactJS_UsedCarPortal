import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CarSelector from "../components/CarSelector";

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



export default function EditCarPage() {
  const carId = window.location.pathname.split("/")[2];
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [selectedMake, setSelectedMake] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  


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
      .catch((err) => {
        console.error("Error fetching car:", err);
        setError("Failed to load car data");
      })
      .finally(() => setLoading(false));
  }, [carId]);

  const handleChange = (field: keyof Car, value: any) => {
    if (!car) return;
    setCar({ ...car, [field]: value });
  };

  const handleImageDelete = (imageId: number) => {
    if (!car) return;
    setCar({ ...car, images: car.images.filter((img) => img.id !== imageId) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const handleSetMainImage = (imageId: number) => {
    if (!car) return;
    setCar({ ...car, main_image_id: imageId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
        formData.append("make_id", selectedMake?.value || car.make?.id || "");
        formData.append("make_title", selectedMake?.title || car.make?.name || "");
        formData.append("model_id", selectedModel?.value || car.model?.id || "");
        formData.append("model_title", selectedModel?.title || car.model?.name || "");
        formData.append("variant_id", selectedVariant?.value || car.variant?.id || "");
        formData.append("variant_title", selectedVariant?.title || car.variant?.name || "");
        formData.append("year", String(selectedYear || car.year));
        formData.append("price", car.price.toString());
        formData.append("color", car.color || "");
        formData.append("description", car.description || "");
      if (car.main_image_id) {
        formData.append("main_image_id", car.main_image_id.toString());
      }
      // Laravel 识别 PUT
      formData.append("_method", "PUT");

      // 传递保留的旧图片 ID
      car.images.forEach((img) => {
        formData.append("existing_images[]", img.id.toString());
      });

      // 新上传的图
      newImages.forEach((file) => {
        formData.append("images[]", file);
      });

      // debug formData
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/cars/${car.id}`, {
        method: "POST", // ✅ 永远用 POST
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save car. Response: ${text}`);
      }

      window.location.href = "/my-cars";
    } catch (err) {
      console.error(err);
      alert("Failed to save car.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center p-6">Loading car...</p>;
  if (error) return <p className="text-center p-6 text-red-500">{error}</p>;
  if (!car) return <p className="text-center p-6">Car not found.</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Edit Car</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
           <CarSelector
                onSelectMake={setSelectedMake}
                onSelectModel={setSelectedModel}
                onSelectYear={setSelectedYear}
                onSelectVariant={setSelectedVariant}
            />
          <input
            type="number"
            value={car.price}
            onChange={(e) => handleChange("price", parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            placeholder="Price"
          />
          <input
            type="text"
            value={car.color || ""}
            onChange={(e) => handleChange("color", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            placeholder="Color"
          />
          <textarea
            value={car.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            rows={3}
            placeholder="Description"
          />

          {/* Images */}
          <div>
            <label className="block font-medium mb-2 text-black">Images</label>
            <div className="flex flex-wrap gap-4">
              {car.images.map((img) => (
                <div key={img.id} className="relative w-24 h-24">
                  <img
                    src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                    alt="Car"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => handleSetMainImage(img.id)}
                    className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded ${
                      car.main_image_id === img.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    Main
                  </button> */}
                </div>
              ))}

              {newImages.map((file, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="New"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <PlusIcon className="w-8 h-8 text-black" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

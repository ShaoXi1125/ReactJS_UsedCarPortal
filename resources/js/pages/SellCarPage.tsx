import { useState } from "react";
import CarSelector from "../components/CarSelector";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SellCarPage() {
  const [color, setColor] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedMake, setSelectedMake] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMake || !selectedModel || !selectedVariant || !selectedYear) {
      setMessage("Please select Make, Model, Year, and Variant.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || token === "null") {
      setMessage("You must be logged in to submit the form.");
      return;
    }

    console.log("Selected values:", {
      make_id: selectedMake.value,
      make_title: selectedMake.title,
      model_id: selectedModel.value,
      model_title: selectedModel.title,
      variant_id: selectedVariant.value,
      variant_title: selectedVariant.title,
      year: selectedYear,
      color,
      mileage,
      price,
      description,
    });

    const formData = new FormData();
    formData.append("make_id", selectedMake.value);
    formData.append("make_title", selectedMake.title || ""); // Ensure title is sent
    formData.append("model_id", selectedModel.value);
    formData.append("model_title", selectedModel.title || "");
    formData.append("variant_id", selectedVariant.value);
    formData.append("variant_title", selectedVariant.title || "");
    formData.append("year", selectedYear);
    formData.append("color", color);
    formData.append("mileage", mileage);
    formData.append("price", price);
    formData.append("description", description);
    images.forEach((img) => {
      formData.append("images[]", img);
    });

    setLoading(true);
    setMessage("");

    try {
      // Fetch CSRF cookie
      const csrfResponse = await fetch("http://127.0.0.1:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
      console.log("CSRF cookie response:", csrfResponse.status);

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log("CSRF token:", csrfToken);

      const res = await fetch("http://127.0.0.1:8000/api/cars", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-TOKEN": csrfToken || "",
          "Accept": "application/json",
        },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      console.log("Response data:", data);
      if (res.ok) {
        setMessage("Car listed successfully!");
        setImages([]);
      } else {
        setMessage(data.message || `Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("Network error details:", err);
      setMessage("Network error: " + (err instanceof Error ? err.message : "An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Sell Your Car</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <CarSelector
            onSelectMake={setSelectedMake}
            onSelectModel={setSelectedModel}
            onSelectYear={setSelectedYear}
            onSelectVariant={setSelectedVariant}
          />
          <input
            type="text"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Mileage (km)"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Price (RM)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <div>
            <label className="block text-gray-700 font-medium mb-2">Upload Images</label>
            <div className="flex flex-wrap gap-4">
              {images.map((file, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <PlusIcon className="w-8 h-8 text-gray-400" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </main>
      <Footer />
    </div>
  );
}